import React from "react";
import { Injectable } from "@nestjs/common";
import { Resend } from "resend";
import { render } from "@react-email/render";

import { env } from "@config/env";
import { logger } from "@config/pino.config";
import { LogBuilderService } from "./LogBuilder.service";

import { WelcomeEmail } from "@shared/emails/templates/welcome.email";
import { PasswordResetRequestEmail } from "@shared/emails/templates/passwordResetRequest.email";
import { PasswordResetConfirmEmail } from "@shared/emails/templates/passwordResetConfirm.email";
import { PlanSubscribedEmail } from "@shared/emails/templates/planSubscribed.email";
import { PlanChangedEmail } from "@shared/emails/templates/planChanged.email";
import { PlanCancelledEmail } from "@shared/emails/templates/planCancelled.email";
import { AccessLostEmail } from "@shared/emails/templates/accessLost.email";
import { PaymentFailedEmail } from "@shared/emails/templates/paymentFailed.email";
import { PaymentRetryEmail } from "@shared/emails/templates/paymentRetry.email";
import { TrialEndingSoonEmail } from "@shared/emails/templates/trialEndingSoon.email";
import { StudentInviteEmail } from "@shared/emails/templates/studentInvite.email";
import { CoachInviteEmail } from "@shared/emails/templates/coachInvite.email";
import { StudentPasswordSetupEmail } from "@shared/emails/templates/studentPasswordSetup.email";
import { StudentPasswordResetConfirmEmail } from "@shared/emails/templates/studentPasswordResetConfirm.email";

const FROM_ADDRESS = "Coach OS <no-reply@geeknizado.com.br>";

// --- Param interfaces ---

export interface SendInviteEmailParams {
  to: string;
  studentName: string;
  personalName: string;
  setupPasswordUrl: string;
}

export interface SendBookingConfirmationParams {
  to: string;
  studentName: string;
  personalName: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  servicePlanName: string;
}

export interface SendBookingNotificationParams {
  to: string;
  personalName: string;
  studentName: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
}

export interface SendSupportContactParams {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface SendPasswordResetParams {
  to: string;
  userName: string;
  resetPasswordUrl: string;
}

export interface SendPasswordResetConfirmParams {
  to: string;
  userName: string;
}

export interface SendWelcomeParams {
  to: string;
  userName: string;
}

export interface SendPlanSubscribedParams {
  to: string;
  userName: string;
  planName: string;
  expiresAt?: string;
}

export interface SendPlanChangedParams {
  to: string;
  userName: string;
  newPlanName: string;
  oldPlanName?: string;
}

export interface SendPlanCancelledParams {
  to: string;
  userName: string;
  expiresAt?: string;
}

export interface SendAccessLostParams {
  to: string;
  userName: string;
}

export interface SendPaymentFailedParams {
  to: string;
  userName: string;
}

export interface SendPaymentRetryParams {
  to: string;
  userName: string;
  retryDate: string;
}

export interface SendTrialEndingSoonParams {
  to: string;
  userName: string;
  trialEndsAt: string;
  upgradeUrl: string;
}

export interface SendStudentPasswordSetupConfirmParams {
  to: string;
  studentName: string;
}

export interface SendStudentPasswordResetConfirmParams {
  to: string;
  studentName: string;
}

export interface SendCoachInviteParams {
  to: string;
  coachName: string;
  setupPasswordUrl: string;
}

@Injectable()
export class ResendProvider {
  private readonly client: Resend | null;

  // Legacy HTML layout kept for booking/session emails not yet migrated
  private readonly legacyColors = {
    primary: "#facc15",
    background: "#09090b",
    card: "#18181b",
    foreground: "#fafafa",
    muted: "#a1a1aa",
    border: "#27272a",
  };

  constructor() {
    this.client = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;
    if (!this.client) {
      logger.warn("RESEND_API_KEY not set — email sending is disabled");
    }
  }

  // --- Helper to send email with rendered React Email template ---
  private async sendWithTemplate(params: {
    to: string;
    subject: string;
    element: React.ReactElement;
  }): Promise<void> {
    if (!this.client) return;

    try {
      const html = await render(params.element);
      await this.client.emails.send({
        from: FROM_ADDRESS,
        to: params.to,
        subject: params.subject,
        html,
      });
    } catch (error) {
      LogBuilderService.log("error", `Failed to send email: ${params.subject}`, error);
    }
  }

  // --- New React Email methods ---

  async sendWelcome(params: SendWelcomeParams): Promise<void> {
    try {
      await this.sendWithTemplate({
        to: params.to,
        subject: "Bem-vindo ao Coach OS!",
        element: React.createElement(WelcomeEmail, { userName: params.userName }),
      });
    }
    catch (error) {
      LogBuilderService.log("error", `Failed to send email: ${params.userName}`, error);
    }
  }

  async sendPasswordReset(params: SendPasswordResetParams): Promise<void> {
    try {
      await this.sendWithTemplate({
        to: params.to,
        subject: "Recuperação de Senha — Coach OS",
        element: React.createElement(PasswordResetRequestEmail, {
          userName: params.userName,
          resetPasswordUrl: params.resetPasswordUrl,
        }),
      });
    } catch (error) {
      LogBuilderService.log("error", `Failed to send email: ${params.userName}`, error);
    }
  }

  async sendPasswordResetConfirm(params: SendPasswordResetConfirmParams): Promise<void> {
    try {
      await this.sendWithTemplate({
        to: params.to,
        subject: "Senha redefinida com sucesso — Coach OS",
        element: React.createElement(PasswordResetConfirmEmail, { userName: params.userName }),
      });
    } catch (error) {
      LogBuilderService.log("error", `Failed to send email: ${params.userName}`, error);
    }
  }

  async sendPlanSubscribed(params: SendPlanSubscribedParams): Promise<void> {
    try {
      await this.sendWithTemplate({
        to: params.to,
        subject: `Plano ${params.planName} ativado — Coach OS`,
        element: React.createElement(PlanSubscribedEmail, {
          userName: params.userName,
          planName: params.planName,
          expiresAt: params.expiresAt,
        }),
      });
    } catch (error) {
      LogBuilderService.log("error", `Failed to send email: ${params.userName}`, error);
    }
  }

  async sendPlanChanged(params: SendPlanChangedParams): Promise<void> {
    try {
      await this.sendWithTemplate({
        to: params.to,
        subject: `Plano alterado para ${params.newPlanName} — Coach OS`,
        element: React.createElement(PlanChangedEmail, {
          userName: params.userName,
          newPlanName: params.newPlanName,
          oldPlanName: params.oldPlanName,
        }),
      });
    } catch (error) {
      LogBuilderService.log("error", `Failed to send email: ${params.userName}`, error);
    }
  }

  async sendPlanCancelled(params: SendPlanCancelledParams): Promise<void> {
    try {
      await this.sendWithTemplate({
        to: params.to,
        subject: "Cancelamento de assinatura agendado — Coach OS",
        element: React.createElement(PlanCancelledEmail, {
          userName: params.userName,
          expiresAt: params.expiresAt,
        }),
      });
    } catch (error) {
      LogBuilderService.log("error", `Failed to send email: ${params.userName}`, error);
    }
  }

  async sendAccessLost(params: SendAccessLostParams): Promise<void> {
    try {
      await this.sendWithTemplate({
        to: params.to,
        subject: "Seu acesso ao Coach OS foi encerrado",
        element: React.createElement(AccessLostEmail, { userName: params.userName }),
      });
    } catch (error) {
      LogBuilderService.log("error", `Failed to send email: ${params.userName}`, error);
    }
  }

  async sendPaymentFailed(params: SendPaymentFailedParams): Promise<void> {
    try {
      await this.sendWithTemplate({
        to: params.to,
        subject: "Falha no pagamento — Coach OS",
        element: React.createElement(PaymentFailedEmail, { userName: params.userName }),
      });
    } catch (error) {
      LogBuilderService.log("error", `Failed to send email: ${params.userName}`, error);
    }
  }

  async sendPaymentRetry(params: SendPaymentRetryParams): Promise<void> {
    try {
      await this.sendWithTemplate({
        to: params.to,
        subject: "Nova tentativa de cobrança agendada — Coach OS",
        element: React.createElement(PaymentRetryEmail, {
          userName: params.userName,
          retryDate: params.retryDate,
        }),
      });
    } catch (error) {
      LogBuilderService.log("error", `Failed to send email: ${params.userName}`, error);
    }
  }

  async sendTrialEndingSoon(params: SendTrialEndingSoonParams): Promise<void> {
    try {
      await this.sendWithTemplate({
        to: params.to,
        subject: "Seu período trial está encerrando — Coach OS",
        element: React.createElement(TrialEndingSoonEmail, {
          userName: params.userName,
          trialEndsAt: params.trialEndsAt,
          upgradeUrl: params.upgradeUrl,
        }),
      });
    } catch (error) {
      LogBuilderService.log("error", `Failed to send email: ${params.userName}`, error);
    }
  }

  async sendStudentInvite(params: SendInviteEmailParams): Promise<void> {
    try {
      await this.sendWithTemplate({
        to: params.to,
        subject: `${params.personalName} te convidou para o Coach OS`,
        element: React.createElement(StudentInviteEmail, {
          studentName: params.studentName,
          personalName: params.personalName,
          setupPasswordUrl: params.setupPasswordUrl,
        }),
      });
    } catch (error) {
      LogBuilderService.log("error", `Failed to send email: ${params.personalName}`, error);
    }
  }

  async sendStudentPasswordSetupConfirm(
    params: SendStudentPasswordSetupConfirmParams,
  ): Promise<void> {
    try {
      await this.sendWithTemplate({
        to: params.to,
        subject: "Senha configurada com sucesso — Coach OS",
        element: React.createElement(StudentPasswordSetupEmail, {
          studentName: params.studentName,
        }),
      });
    } catch (error) {
      LogBuilderService.log("error", `Failed to send email: ${params.studentName}`, error);
    }
  }

  async sendCoachInvite(params: SendCoachInviteParams): Promise<void> {
    try {
      await this.sendWithTemplate({
        to: params.to,
        subject: "Você foi convidado para o Coach OS",
        element: React.createElement(CoachInviteEmail, {
          coachName: params.coachName,
          setupPasswordUrl: params.setupPasswordUrl,
        }),
      });
    } catch (error) {
      LogBuilderService.log("error", `Failed to send coach invite email: ${params.to}`, error);
    }
  }

  async sendStudentPasswordResetConfirm(
    params: SendStudentPasswordResetConfirmParams,
  ): Promise<void> {
    try {
      await this.sendWithTemplate({
        to: params.to,
        subject: "Senha redefinida com sucesso — Coach OS",
        element: React.createElement(StudentPasswordResetConfirmEmail, {
          studentName: params.studentName,
        }),
      });
    } catch (error) {
      LogBuilderService.log("error", `Failed to send email: ${params.studentName}`, error);
    }
  }
}
