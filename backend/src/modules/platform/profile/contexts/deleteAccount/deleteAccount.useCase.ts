import { Injectable, NotFoundException } from "@nestjs/common";
import { eq } from "drizzle-orm";

import { PersonalsRepository } from "@shared/repositories/personals.repository";
import { UsersRepository } from "@shared/repositories/users.repository";
import { StripeProvider } from "@shared/providers/stripe.provider";
import { S3Provider } from "@shared/providers/s3.provider";
import { DrizzleProvider } from "@shared/providers/drizzle.service";
import { logger } from "@config/pino.config";

// Tenant-scoped tables (no cascade from user/personal deletion)
import {
  trainingScheduleExceptions,
  trainingSchedules,
  appointments,
  appointmentRequests,
  availabilityRules,
  availabilityExceptions,
} from "@config/database/schema/scheduling";
import { workoutSessions } from "@config/database/schema/workoutExecution";
import {
  studentPrograms,
  programTemplates,
} from "@config/database/schema/training";
import {
  coachingContracts,
  servicePlans,
  coachStudentRelations,
  studentNotes,
} from "@config/database/schema/coaching";
import {
  progressPhotos,
  progressCheckins,
} from "@config/database/schema/progress";
import { exercises } from "@config/database/schema/exercises";
import { students } from "@config/database/schema/students";
import { studentInvitationTokens } from "@config/database/schema/studentInvitationTokens";

@Injectable()
export class DeleteAccountUseCase {
  constructor(
    private readonly personalsRepository: PersonalsRepository,
    private readonly usersRepository: UsersRepository,
    private readonly stripeProvider: StripeProvider,
    private readonly s3Provider: S3Provider,
    private readonly drizzle: DrizzleProvider,
  ) {}

  async execute(personalId: string, userId: string): Promise<void> {
    const personal = await this.personalsRepository.findById(personalId);

    if (!personal) {
      throw new NotFoundException("Profile not found");
    }

    // 1. Cancel Stripe subscription immediately
    await this.cancelStripeSubscription(personal.stripeSubscriptionId);

    // 2. Collect S3 URLs before deleting data
    const s3Urls = this.collectProfileS3Urls(personal);
    const mediaUrls = await this.collectMediaS3Urls(personalId);

    // 3. Delete all tenant-scoped data in a transaction
    await this.deleteTenantData(personalId);

    // 4. Delete user record (cascades to personal + password tokens)
    await this.usersRepository.deleteById(userId);

    // 5. Best-effort S3 cleanup (non-blocking)
    this.cleanupS3([...s3Urls, ...mediaUrls]);
  }

  private async cancelStripeSubscription(subscriptionId: string | null): Promise<void> {
    if (!this.stripeProvider.isConfigured() || !subscriptionId) return;

    try {
      await this.stripeProvider.client!.subscriptions.cancel(subscriptionId);
    } catch (error) {
      logger.error({ error, subscriptionId }, "Failed to cancel Stripe subscription on account deletion");
    }
  }

  private collectProfileS3Urls(personal: {
    profilePhoto: string | null;
    logoUrl: string | null;
    lpHeroImage: string | null;
    lpImage1: string | null;
    lpImage2: string | null;
    lpImage3: string | null;
  }): string[] {
    return [
      personal.profilePhoto,
      personal.logoUrl,
      personal.lpHeroImage,
      personal.lpImage1,
      personal.lpImage2,
      personal.lpImage3,
    ].filter((url): url is string => url !== null);
  }

  private async collectMediaS3Urls(tenantId: string): Promise<string[]> {
    const urls: string[] = [];

    const photos = await this.drizzle.db
      .select({ mediaUrl: progressPhotos.mediaUrl })
      .from(progressPhotos)
      .where(eq(progressPhotos.tenantId, tenantId));
    for (const photo of photos) {
      if (photo.mediaUrl) urls.push(photo.mediaUrl);
    }

    const exerciseMedia = await this.drizzle.db
      .select({ mediaUrl: exercises.mediaUrl })
      .from(exercises)
      .where(eq(exercises.tenantId, tenantId));
    for (const ex of exerciseMedia) {
      if (ex.mediaUrl) urls.push(ex.mediaUrl);
    }

    return urls;
  }

  private async deleteTenantData(tenantId: string): Promise<void> {
    await this.drizzle.db.transaction(async (tx) => {
      // Scheduling (exceptions before parent schedules)
      await tx.delete(trainingScheduleExceptions).where(eq(trainingScheduleExceptions.tenantId, tenantId));
      await tx.delete(trainingSchedules).where(eq(trainingSchedules.tenantId, tenantId));
      await tx.delete(appointments).where(eq(appointments.tenantId, tenantId));
      await tx.delete(appointmentRequests).where(eq(appointmentRequests.tenantId, tenantId));
      await tx.delete(availabilityRules).where(eq(availabilityRules.tenantId, tenantId));
      await tx.delete(availabilityExceptions).where(eq(availabilityExceptions.tenantId, tenantId));

      // Workout execution (cascade: sessions → executions → sets)
      await tx.delete(workoutSessions).where(eq(workoutSessions.tenantId, tenantId));

      // Student programs (cascade: programs → workoutDays → studentExercises)
      await tx.delete(studentPrograms).where(eq(studentPrograms.tenantId, tenantId));

      // Program templates (cascade: templates → workoutTemplates → exerciseTemplates)
      await tx.delete(programTemplates).where(eq(programTemplates.tenantId, tenantId));

      // Progress (cascade: checkins → records, checkins → photos)
      await tx.delete(progressPhotos).where(eq(progressPhotos.tenantId, tenantId));
      await tx.delete(progressCheckins).where(eq(progressCheckins.tenantId, tenantId));

      // Coaching
      await tx.delete(coachingContracts).where(eq(coachingContracts.tenantId, tenantId));
      await tx.delete(servicePlans).where(eq(servicePlans.tenantId, tenantId));
      await tx.delete(studentNotes).where(eq(studentNotes.tenantId, tenantId));
      await tx.delete(coachStudentRelations).where(eq(coachStudentRelations.tenantId, tenantId));

      // Invitations & private exercises
      await tx.delete(studentInvitationTokens).where(eq(studentInvitationTokens.tenantId, tenantId));
      await tx.delete(exercises).where(eq(exercises.tenantId, tenantId));

      // Students belonging to this tenant
      await tx.delete(students).where(eq(students.tenantId, tenantId));
    });
  }

  private cleanupS3(urls: string[]): void {
    // Fire-and-forget — failure must not block the response
    for (const url of urls) {
      this.s3Provider.deleteObject(url).catch((error) => {
        logger.error({ error, url }, "Failed to delete S3 object on account deletion");
      });
    }
  }
}
