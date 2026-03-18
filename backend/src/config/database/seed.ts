import "dotenv/config";
import { randomUUID } from "crypto";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as argon2 from "argon2";
import { and, eq, inArray, isNull } from "drizzle-orm";

import { getDatabaseConfig } from "./database.config";
import { env } from "../env";
import {
  plans,
  exercises,
  users,
  personals,
  students,
  coachStudentRelations,
  servicePlans,
  coachingContracts,
  programTemplates,
  workoutTemplates,
  exerciseTemplates,
  availabilityRules,
  studentPrograms,
  workoutDays,
  studentExercises,
  trainingSchedules,
  progressRecords,
} from "./schema";

// Drizzle ORM type inference excludes optional/defaulted columns from insert types.
// This helper bypasses the limitation for seed data only.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function sv<T>(v: T): any {
  return v;
}

async function clean(db: ReturnType<typeof drizzle>) {
  console.log("Cleaning seed data...");

  // Delete in reverse dependency order to avoid FK violations

  // Remove demo personal's data
  const [demoUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, "coach@demo.com"))
    .limit(1);

  if (demoUser) {
    const [demoPersonal] = await db
      .select()
      .from(personals)
      .where(eq(personals.userId, demoUser.id))
      .limit(1);

    if (demoPersonal) {
      // Templates cascade: workoutTemplates → exerciseTemplates
      const templates = await db
        .select({ id: programTemplates.id })
        .from(programTemplates)
        .where(eq(programTemplates.tenantId, demoPersonal.id));

      for (const t of templates) {
        const workouts = await db
          .select({ id: workoutTemplates.id })
          .from(workoutTemplates)
          .where(eq(workoutTemplates.programTemplateId, t.id));

        for (const w of workouts) {
          await db
            .delete(exerciseTemplates)
            .where(eq(exerciseTemplates.workoutTemplateId, w.id));
        }
        await db
          .delete(workoutTemplates)
          .where(eq(workoutTemplates.programTemplateId, t.id));
      }
      await db
        .delete(programTemplates)
        .where(eq(programTemplates.tenantId, demoPersonal.id));

      await db
        .delete(availabilityRules)
        .where(eq(availabilityRules.tenantId, demoPersonal.id));

      await db
        .delete(servicePlans)
        .where(eq(servicePlans.tenantId, demoPersonal.id));

      // Remove training schedules
      await db
        .delete(trainingSchedules)
        .where(eq(trainingSchedules.tenantId, demoPersonal.id));

      // Remove student programs (workoutDays + studentExercises cascade via FK)
      await db
        .delete(studentPrograms)
        .where(eq(studentPrograms.tenantId, demoPersonal.id));

      // Remove progress records and photos
      await db
        .delete(progressRecords)
        .where(eq(progressRecords.tenantId, demoPersonal.id));

      // Remove coaching contracts
      await db
        .delete(coachingContracts)
        .where(eq(coachingContracts.tenantId, demoPersonal.id));

      // Remove coach-student relations
      await db
        .delete(coachStudentRelations)
        .where(eq(coachStudentRelations.tenantId, demoPersonal.id));

      // Remove demo students and their users
      const demoStudents = await db
        .select({ id: students.id, userId: students.userId })
        .from(students)
        .where(eq(students.tenantId, demoPersonal.id));

      for (const s of demoStudents) {
        await db.delete(students).where(eq(students.id, s.id));
        await db.delete(users).where(eq(users.id, s.userId));
      }

      await db.delete(personals).where(eq(personals.id, demoPersonal.id));
    }

    await db.delete(users).where(eq(users.id, demoUser.id));
  }

  // Remove global exercises (tenantId is null)
  await db.delete(exercises).where(isNull(exercises.tenantId));
  console.log("✓ Global exercises removed");

  // Null out plan references on all personals before deleting plans (FK constraint)
  await db.update(personals).set({ subscriptionPlanId: null } as any);

  // Remove plans
  await db.delete(plans);
  console.log("✓ Plans removed");

  console.log("Clean completed!");
}

async function seed(db: ReturnType<typeof drizzle>) {
  console.log("Seeding database...");

  try {
    // ─── Plans ────────────────────────────────────────────────────────────────
    const planData = [
      {
        id: randomUUID(),
        name: "Básico",
        description: "Ideal para quem está começando",
        price: "29.90",
        maxStudents: 10,
        order: 1,
        isDefault: true,
        highlighted: false,
        isActive: true,
        benefits: [
          "Gestão de alunos",
          "Criação de treinos",
          "Biblioteca de exercícios",
          "Portal do aluno",
        ],
        stripePriceId: process.env.STRIPE_PRICE_BASICO || null,
      },
      {
        id: randomUUID(),
        name: "Pro",
        description: "Para profissionais que querem crescer",
        price: "49.90",
        maxStudents: 30,
        order: 2,
        isDefault: false,
        highlighted: true,
        isActive: true,
        benefits: [
          "Tudo do plano Básico",
          "Exercícios personalizados",
          "Página pública profissional",
          "Personalização de marca",
        ],
        stripePriceId: process.env.STRIPE_PRICE_PRO || null,
      },
      {
        id: randomUUID(),
        name: "Elite",
        description: "Para profissionais de alto volume",
        price: "99.90",
        maxStudents: 100,
        order: 3,
        isDefault: false,
        highlighted: false,
        isActive: true,
        benefits: [
          "Tudo do plano Pro",
          "Métricas avançadas",
          "Histórico completo",
          "Maior armazenamento de mídia",
        ],
        stripePriceId: process.env.STRIPE_PRICE_EMPRESARIAL || null,
      },
    ];

    await db.insert(plans).values(planData).onConflictDoNothing();
    console.log(`✓ ${planData.length} plans seeded`);

    // ─── Global Exercises ──────────────────────────────────────────────────────
    const globalExercises = [
      // Chest
      { name: "Supino Reto com Barra", muscleGroup: "Peito", description: "Exercício composto para peitoral maior", instructions: "Deite no banco, segure a barra na largura dos ombros, desça até o peito e empurre de volta." },
      { name: "Supino Inclinado com Halteres", muscleGroup: "Peito", description: "Foco na parte superior do peitoral", instructions: "No banco inclinado a 30-45°, pressione os halteres para cima alinhados com o peito." },
      { name: "Crucifixo com Halteres", muscleGroup: "Peito", description: "Isolamento do peitoral", instructions: "Deite no banco, abra os braços lateralmente com leve flexão dos cotovelos e retorne." },
      { name: "Flexão de Braço", muscleGroup: "Peito", description: "Exercício com peso corporal para peitoral", instructions: "Mãos na largura dos ombros, desça o corpo até o peito quase tocar o chão." },

      // Back
      { name: "Puxada na Barra Fixa", muscleGroup: "Costas", description: "Exercício composto para dorsal", instructions: "Segure a barra pronada, puxe o corpo até o queixo ultrapassar a barra." },
      { name: "Remada Curvada com Barra", muscleGroup: "Costas", description: "Desenvolvimento da espessura das costas", instructions: "Incline o tronco a 45°, puxe a barra em direção ao abdômen." },
      { name: "Puxada no Pulley", muscleGroup: "Costas", description: "Variação da puxada para dorsal", instructions: "Segure a barra do pulley, puxe em direção ao peito mantendo a postura." },
      { name: "Remada Unilateral com Halter", muscleGroup: "Costas", description: "Remada para correção de assimetrias", instructions: "Apoie um joelho e mão no banco, puxe o halter em direção ao quadril." },

      // Legs
      { name: "Agachamento Livre", muscleGroup: "Pernas", description: "Exercício fundamental para membros inferiores", instructions: "Barra nos trapézios, desça até as coxas ficarem paralelas ao chão." },
      { name: "Leg Press 45°", muscleGroup: "Pernas", description: "Exercício composto na máquina", instructions: "Posicione os pés na plataforma na largura dos ombros e empurre." },
      { name: "Cadeira Extensora", muscleGroup: "Pernas", description: "Isolamento do quadríceps", instructions: "Estenda as pernas completamente e retorne de forma controlada." },
      { name: "Mesa Flexora", muscleGroup: "Pernas", description: "Isolamento dos isquiotibiais", instructions: "Deite de bruços e flexione as pernas trazendo o calcanhar em direção ao glúteo." },
      { name: "Stiff", muscleGroup: "Pernas", description: "Posterior de coxa e glúteos", instructions: "Com a barra, incline o tronco mantendo as pernas semi-estendidas." },

      // Shoulders
      { name: "Desenvolvimento com Halteres", muscleGroup: "Ombros", description: "Exercício composto para deltoides", instructions: "Sentado, pressione os halteres acima da cabeça." },
      { name: "Elevação Lateral", muscleGroup: "Ombros", description: "Isolamento do deltoide lateral", instructions: "Em pé, eleve os halteres lateralmente até a altura dos ombros." },
      { name: "Elevação Frontal", muscleGroup: "Ombros", description: "Isolamento do deltoide anterior", instructions: "Em pé, eleve os halteres à frente até a altura dos ombros." },

      // Arms
      { name: "Rosca Direta com Barra", muscleGroup: "Bíceps", description: "Exercício básico para bíceps", instructions: "Em pé, flexione os braços trazendo a barra até os ombros." },
      { name: "Rosca Alternada com Halteres", muscleGroup: "Bíceps", description: "Trabalho unilateral dos bíceps", instructions: "Em pé, flexione um braço de cada vez com supinação." },
      { name: "Tríceps Pulley", muscleGroup: "Tríceps", description: "Isolamento do tríceps", instructions: "Na polia alta, estenda os braços mantendo os cotovelos junto ao corpo." },
      { name: "Tríceps Testa", muscleGroup: "Tríceps", description: "Exercício para cabeça longa do tríceps", instructions: "Deitado, desça a barra/halteres até a testa e estenda." },

      // Core
      { name: "Prancha Abdominal", muscleGroup: "Abdômen", description: "Estabilização do core", instructions: "Apoie antebraços e pés, mantenha o corpo reto por tempo determinado." },
      { name: "Abdominal Crunch", muscleGroup: "Abdômen", description: "Flexão de tronco básica", instructions: "Deite com joelhos flexionados, eleve os ombros do chão contraindo o abdômen." },

      // Glutes
      { name: "Hip Thrust", muscleGroup: "Glúteos", description: "Exercício principal para glúteos", instructions: "Apoie as costas no banco, empurre o quadril para cima com a barra." },
      { name: "Abdução de Quadril na Máquina", muscleGroup: "Glúteos", description: "Isolamento do glúteo médio", instructions: "Sentado na máquina, abra as pernas contra a resistência." },

      // Calves
      { name: "Panturrilha em Pé", muscleGroup: "Panturrilha", description: "Exercício para gastrocnêmio", instructions: "Em pé na máquina, eleve os calcanhares o máximo possível." },
      { name: "Panturrilha Sentado", muscleGroup: "Panturrilha", description: "Exercício para sóleo", instructions: "Sentado na máquina, eleve os calcanhares de forma controlada." },
    ];

    const exerciseValues = globalExercises.map((e) => ({
      id: randomUUID(),
      name: e.name,
      muscleGroup: e.muscleGroup,
      description: e.description,
      instructions: e.instructions,
      tenantId: null,
    }));

    await db.insert(exercises).values(exerciseValues).onConflictDoNothing();
    console.log(`✓ ${exerciseValues.length} global exercises seeded`);

    // ─── Demo Personal (Coach Demo) ────────────────────────────────────────────
    const demoPassword = await argon2.hash("Coach@123456" + env.HASH_PEPPER, {
      type: argon2.argon2id,
    });

    // Fetch Pro plan to link subscription
    const [proPlan] = await db
      .select()
      .from(plans)
      .where(eq(plans.name, "Pro"))
      .limit(1);

    // Find or create user
    let [demoUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, "coach@demo.com"))
      .limit(1);

    if (!demoUser) {
      await db.insert(users).values(sv({
        name: "Coach Demo",
        email: "coach@demo.com",
        password: demoPassword,
        role: "PERSONAL",
        isActive: true,
      }));
      [demoUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, "coach@demo.com"))
        .limit(1);
    }

    if (!demoUser) throw new Error("Failed to create or find demo user");

    // Find or create personal
    let [demoPersonal] = await db
      .select()
      .from(personals)
      .where(eq(personals.userId, demoUser.id))
      .limit(1);

    if (!demoPersonal) {
      await db.insert(personals).values(sv({
        userId: demoUser.id,
        slug: "coach-demo",
        bio: "Personal trainer especializado em musculação, condicionamento físico e emagrecimento. Mais de 10 anos de experiência transformando vidas.",
        specialties: ["Musculação", "Emagrecimento", "Condicionamento Físico", "Hipertrofia"],
        onboardingCompleted: true,
        accessStatus: "active",
        subscriptionPlanId: proPlan?.id ?? null,
        lpTitle: "Transforme seu corpo com método e dedicação",
        lpSubtitle: "Treinos personalizados para alcançar seus objetivos com segurança e resultados reais",
        lpAboutTitle: "Sobre mim",
        lpAboutText: "Sou personal trainer certificado com vasta experiência em musculação e condicionamento físico. Meu método é baseado em ciência e personalização — cada aluno recebe um programa único, adaptado ao seu nível, objetivo e rotina.",
      }));
      [demoPersonal] = await db
        .select()
        .from(personals)
        .where(eq(personals.userId, demoUser.id))
        .limit(1);
    }

    if (!demoPersonal) throw new Error("Failed to create or find demo personal");

    console.log(`✓ Demo personal seeded (slug: coach-demo, email: coach@demo.com, password: Coach@123456)`);

    // ─── Service Plans ─────────────────────────────────────────────────────────
    const existingServicePlans = await db
      .select()
      .from(servicePlans)
      .where(eq(servicePlans.tenantId, demoPersonal.id));

    if (existingServicePlans.length === 0) {
      await db.insert(servicePlans).values(sv([
        {
          tenantId: demoPersonal.id,
          name: "Consultoria Online",
          description: "Acompanhamento online completo com treinos personalizados, ajustes semanais e suporte por mensagem. Ideal para quem treina em qualquer lugar.",
          sessionsPerWeek: null,
          durationMinutes: 60,
          price: "299.90",
          attendanceType: "online",
          isActive: true,
        },
        {
          tenantId: demoPersonal.id,
          name: "Presencial 3x por Semana",
          description: "Treino presencial às segundas, quartas e sextas das 08:00 às 09:00. Acompanhamento completo com ajuste de cargas e técnica.",
          sessionsPerWeek: 3,
          durationMinutes: 60,
          price: "499.90",
          attendanceType: "presential",
          isActive: true,
        },
        {
          tenantId: demoPersonal.id,
          name: "Presencial 5x por Semana",
          description: "Treino presencial de segunda a sexta das 16:00 às 17:00. Para quem busca máxima evolução com acompanhamento diário.",
          sessionsPerWeek: 5,
          durationMinutes: 60,
          price: "699.90",
          attendanceType: "presential",
          isActive: true,
        },
      ]));
      console.log("✓ 3 service plans seeded");
    } else {
      console.log("✓ Service plans already exist, skipping");
    }

    // ─── Availability Rules ────────────────────────────────────────────────────
    // 3x/week plan: Mon(1), Wed(3), Fri(5) 08:00–09:00
    // 5x/week plan: Mon(1)–Fri(5) 16:00–17:00
    const existingRules = await db
      .select()
      .from(availabilityRules)
      .where(eq(availabilityRules.tenantId, demoPersonal.id));

    if (existingRules.length === 0) {
      await db.insert(availabilityRules).values(sv([
        { tenantId: demoPersonal.id, dayOfWeek: 1, startTime: "08:00", endTime: "09:00", isActive: true },
        { tenantId: demoPersonal.id, dayOfWeek: 3, startTime: "08:00", endTime: "09:00", isActive: true },
        { tenantId: demoPersonal.id, dayOfWeek: 5, startTime: "08:00", endTime: "09:00", isActive: true },
        { tenantId: demoPersonal.id, dayOfWeek: 1, startTime: "16:00", endTime: "17:00", isActive: true },
        { tenantId: demoPersonal.id, dayOfWeek: 2, startTime: "16:00", endTime: "17:00", isActive: true },
        { tenantId: demoPersonal.id, dayOfWeek: 3, startTime: "16:00", endTime: "17:00", isActive: true },
        { tenantId: demoPersonal.id, dayOfWeek: 4, startTime: "16:00", endTime: "17:00", isActive: true },
        { tenantId: demoPersonal.id, dayOfWeek: 5, startTime: "16:00", endTime: "17:00", isActive: true },
      ]));
      console.log("✓ 8 availability rules seeded");
    } else {
      console.log("✓ Availability rules already exist, skipping");
    }

    // ─── Fetch exercise IDs by name ────────────────────────────────────────────
    const exerciseNames = [
      "Supino Reto com Barra",
      "Supino Inclinado com Halteres",
      "Crucifixo com Halteres",
      "Flexão de Braço",
      "Puxada na Barra Fixa",
      "Remada Curvada com Barra",
      "Puxada no Pulley",
      "Remada Unilateral com Halter",
      "Agachamento Livre",
      "Leg Press 45°",
      "Cadeira Extensora",
      "Mesa Flexora",
      "Stiff",
      "Desenvolvimento com Halteres",
      "Elevação Lateral",
      "Elevação Frontal",
      "Rosca Direta com Barra",
      "Rosca Alternada com Halteres",
      "Tríceps Pulley",
      "Tríceps Testa",
      "Prancha Abdominal",
      "Abdominal Crunch",
      "Hip Thrust",
      "Abdução de Quadril na Máquina",
      "Panturrilha em Pé",
      "Panturrilha Sentado",
    ];

    const exerciseRows = await db
      .select({ id: exercises.id, name: exercises.name })
      .from(exercises)
      .where(inArray(exercises.name, exerciseNames));

    const ex = Object.fromEntries(exerciseRows.map((e) => [e.name, e.id]));

    // ─── Program Templates ─────────────────────────────────────────────────────

    // Helper to insert a program template with its workouts and exercises
    type ExerciseEntry = {
      exerciseId: string;
      sets: number;
      repetitions?: number;
      restSeconds?: number;
      duration?: string;
      notes?: string;
    };

    type WorkoutEntry = {
      name: string;
      exercises: ExerciseEntry[];
    };

    async function seedProgramTemplate(
      name: string,
      description: string,
      tenantId: string,
      workouts: WorkoutEntry[],
    ) {
      // Skip if template already exists for this tenant
      const [existing] = await db
        .select()
        .from(programTemplates)
        .where(
          and(
            eq(programTemplates.tenantId, tenantId),
            eq(programTemplates.name, name),
          ),
        )
        .limit(1);

      if (existing) return;

      await db
        .insert(programTemplates)
        .values(sv({ tenantId, name, description, status: "active" }));

      const [template] = await db
        .select()
        .from(programTemplates)
        .where(
          and(
            eq(programTemplates.tenantId, tenantId),
            eq(programTemplates.name, name),
          ),
        )
        .limit(1);

      if (!template) return;

      for (let wi = 0; wi < workouts.length; wi++) {
        const workout = workouts[wi];

        await db.insert(workoutTemplates).values(sv({
          programTemplateId: template.id,
          name: workout.name,
          order: wi + 1,
        }));

        const existingWorkouts = await db
          .select()
          .from(workoutTemplates)
          .where(eq(workoutTemplates.programTemplateId, template.id));

        const wt = existingWorkouts.find((w) => w.name === workout.name);
        if (!wt) continue;

        const exerciseEntries = workout.exercises
          .filter((e) => !!e.exerciseId)
          .map((e, ei) => ({
            workoutTemplateId: wt.id,
            exerciseId: e.exerciseId,
            sets: e.sets,
            repetitions: e.repetitions ?? null,
            restSeconds: e.restSeconds ?? null,
            duration: e.duration ?? null,
            notes: e.notes ?? null,
            order: ei + 1,
          }));

        if (exerciseEntries.length > 0) {
          await db.insert(exerciseTemplates).values(sv(exerciseEntries));
        }
      }
    }

    // ── Template 1: Treino A/B/C — 3x por Semana ──────────────────────────────
    await seedProgramTemplate(
      "Treino A/B/C — 3x por Semana",
      "Programa dividido em três treinos semanais (Segunda, Quarta e Sexta). Ideal para quem tem disponibilidade de 3 dias por semana.",
      demoPersonal.id,
      [
        {
          name: "Treino A — Segunda (Peito e Tríceps)",
          exercises: [
            { exerciseId: ex["Supino Reto com Barra"], sets: 4, repetitions: 10, restSeconds: 90 },
            { exerciseId: ex["Supino Inclinado com Halteres"], sets: 3, repetitions: 12, restSeconds: 90 },
            { exerciseId: ex["Crucifixo com Halteres"], sets: 3, repetitions: 12, restSeconds: 60 },
            { exerciseId: ex["Tríceps Pulley"], sets: 4, repetitions: 12, restSeconds: 60 },
            { exerciseId: ex["Tríceps Testa"], sets: 3, repetitions: 10, restSeconds: 60 },
          ],
        },
        {
          name: "Treino B — Quarta (Costas e Bíceps)",
          exercises: [
            { exerciseId: ex["Puxada na Barra Fixa"], sets: 4, repetitions: 8, restSeconds: 90 },
            { exerciseId: ex["Remada Curvada com Barra"], sets: 4, repetitions: 10, restSeconds: 90 },
            { exerciseId: ex["Puxada no Pulley"], sets: 3, repetitions: 12, restSeconds: 60 },
            { exerciseId: ex["Remada Unilateral com Halter"], sets: 3, repetitions: 12, restSeconds: 60 },
            { exerciseId: ex["Rosca Direta com Barra"], sets: 3, repetitions: 12, restSeconds: 60 },
            { exerciseId: ex["Rosca Alternada com Halteres"], sets: 3, repetitions: 12, restSeconds: 60 },
          ],
        },
        {
          name: "Treino C — Sexta (Pernas)",
          exercises: [
            { exerciseId: ex["Agachamento Livre"], sets: 4, repetitions: 8, restSeconds: 120 },
            { exerciseId: ex["Leg Press 45°"], sets: 4, repetitions: 10, restSeconds: 90 },
            { exerciseId: ex["Cadeira Extensora"], sets: 3, repetitions: 12, restSeconds: 60 },
            { exerciseId: ex["Mesa Flexora"], sets: 3, repetitions: 12, restSeconds: 60 },
            { exerciseId: ex["Stiff"], sets: 3, repetitions: 10, restSeconds: 90 },
            { exerciseId: ex["Panturrilha em Pé"], sets: 4, repetitions: 15, restSeconds: 60 },
          ],
        },
      ],
    );

    // ── Template 2: Treino 5 Dias — Segunda a Sexta ────────────────────────────
    await seedProgramTemplate(
      "Treino 5 Dias — Segunda a Sexta",
      "Programa dividido em cinco treinos semanais. Cada dia foca em grupos musculares específicos para máxima recuperação e evolução.",
      demoPersonal.id,
      [
        {
          name: "Treino A — Segunda (Peito e Tríceps)",
          exercises: [
            { exerciseId: ex["Supino Reto com Barra"], sets: 4, repetitions: 10, restSeconds: 90 },
            { exerciseId: ex["Supino Inclinado com Halteres"], sets: 3, repetitions: 12, restSeconds: 90 },
            { exerciseId: ex["Crucifixo com Halteres"], sets: 3, repetitions: 12, restSeconds: 60 },
            { exerciseId: ex["Flexão de Braço"], sets: 3, repetitions: 15, restSeconds: 60 },
            { exerciseId: ex["Tríceps Pulley"], sets: 4, repetitions: 12, restSeconds: 60 },
            { exerciseId: ex["Tríceps Testa"], sets: 3, repetitions: 10, restSeconds: 60 },
          ],
        },
        {
          name: "Treino B — Terça (Costas e Bíceps)",
          exercises: [
            { exerciseId: ex["Puxada na Barra Fixa"], sets: 4, repetitions: 8, restSeconds: 90 },
            { exerciseId: ex["Remada Curvada com Barra"], sets: 4, repetitions: 10, restSeconds: 90 },
            { exerciseId: ex["Puxada no Pulley"], sets: 3, repetitions: 12, restSeconds: 60 },
            { exerciseId: ex["Remada Unilateral com Halter"], sets: 3, repetitions: 12, restSeconds: 60 },
            { exerciseId: ex["Rosca Direta com Barra"], sets: 3, repetitions: 12, restSeconds: 60 },
            { exerciseId: ex["Rosca Alternada com Halteres"], sets: 3, repetitions: 12, restSeconds: 60 },
          ],
        },
        {
          name: "Treino C — Quarta (Pernas)",
          exercises: [
            { exerciseId: ex["Agachamento Livre"], sets: 4, repetitions: 8, restSeconds: 120 },
            { exerciseId: ex["Leg Press 45°"], sets: 4, repetitions: 10, restSeconds: 90 },
            { exerciseId: ex["Cadeira Extensora"], sets: 3, repetitions: 12, restSeconds: 60 },
            { exerciseId: ex["Mesa Flexora"], sets: 3, repetitions: 12, restSeconds: 60 },
            { exerciseId: ex["Stiff"], sets: 3, repetitions: 10, restSeconds: 90 },
            { exerciseId: ex["Panturrilha em Pé"], sets: 4, repetitions: 15, restSeconds: 60 },
          ],
        },
        {
          name: "Treino D — Quinta (Ombros e Abdômen)",
          exercises: [
            { exerciseId: ex["Desenvolvimento com Halteres"], sets: 4, repetitions: 10, restSeconds: 90 },
            { exerciseId: ex["Elevação Lateral"], sets: 4, repetitions: 12, restSeconds: 60 },
            { exerciseId: ex["Elevação Frontal"], sets: 3, repetitions: 12, restSeconds: 60 },
            { exerciseId: ex["Prancha Abdominal"], sets: 3, duration: "45s", restSeconds: 60 },
            { exerciseId: ex["Abdominal Crunch"], sets: 3, repetitions: 20, restSeconds: 60 },
          ],
        },
        {
          name: "Treino E — Sexta (Glúteos e Panturrilha)",
          exercises: [
            { exerciseId: ex["Hip Thrust"], sets: 4, repetitions: 10, restSeconds: 90 },
            { exerciseId: ex["Abdução de Quadril na Máquina"], sets: 3, repetitions: 15, restSeconds: 60 },
            { exerciseId: ex["Stiff"], sets: 3, repetitions: 10, restSeconds: 90 },
            { exerciseId: ex["Panturrilha em Pé"], sets: 4, repetitions: 15, restSeconds: 60 },
            { exerciseId: ex["Panturrilha Sentado"], sets: 3, repetitions: 15, restSeconds: 60 },
          ],
        },
      ],
    );

    // ── Template 3: Consultoria Online — Full Body 3x por Semana ──────────────
    await seedProgramTemplate(
      "Consultoria Online — Full Body 3x por Semana",
      "Programa full body para 3 dias semanais. Ideal para consultorias online, adaptável a qualquer academia ou espaço de treino.",
      demoPersonal.id,
      [
        {
          name: "Full Body A",
          exercises: [
            { exerciseId: ex["Agachamento Livre"], sets: 3, repetitions: 10, restSeconds: 90 },
            { exerciseId: ex["Supino Reto com Barra"], sets: 3, repetitions: 10, restSeconds: 90 },
            { exerciseId: ex["Puxada na Barra Fixa"], sets: 3, repetitions: 8, restSeconds: 90 },
            { exerciseId: ex["Desenvolvimento com Halteres"], sets: 3, repetitions: 10, restSeconds: 60 },
            { exerciseId: ex["Prancha Abdominal"], sets: 3, duration: "30s", restSeconds: 60 },
          ],
        },
        {
          name: "Full Body B",
          exercises: [
            { exerciseId: ex["Leg Press 45°"], sets: 3, repetitions: 12, restSeconds: 90 },
            { exerciseId: ex["Supino Inclinado com Halteres"], sets: 3, repetitions: 12, restSeconds: 90 },
            { exerciseId: ex["Remada Curvada com Barra"], sets: 3, repetitions: 10, restSeconds: 90 },
            { exerciseId: ex["Elevação Lateral"], sets: 3, repetitions: 12, restSeconds: 60 },
            { exerciseId: ex["Hip Thrust"], sets: 3, repetitions: 10, restSeconds: 90 },
            { exerciseId: ex["Abdominal Crunch"], sets: 3, repetitions: 20, restSeconds: 60 },
          ],
        },
        {
          name: "Full Body C",
          exercises: [
            { exerciseId: ex["Stiff"], sets: 3, repetitions: 10, restSeconds: 90 },
            { exerciseId: ex["Flexão de Braço"], sets: 3, repetitions: 12, restSeconds: 60 },
            { exerciseId: ex["Remada Unilateral com Halter"], sets: 3, repetitions: 12, restSeconds: 60 },
            { exerciseId: ex["Rosca Direta com Barra"], sets: 3, repetitions: 12, restSeconds: 60 },
            { exerciseId: ex["Tríceps Pulley"], sets: 3, repetitions: 12, restSeconds: 60 },
            { exerciseId: ex["Panturrilha em Pé"], sets: 3, repetitions: 15, restSeconds: 60 },
          ],
        },
      ],
    );

    console.log(`✓ 3 program templates seeded with workouts and exercises`);

    // ─── Demo Students ─────────────────────────────────────────────────────────
    // Helper: create user → student → coach-student relation, return student record
    async function seedStudent(data: {
      name: string;
      email: string;
      phoneNumber: string;
      goal: string;
      observations: string;
      physicalRestrictions: string | null;
    }) {
      const studentPassword = await argon2.hash("Student@123456" + env.HASH_PEPPER, {
        type: argon2.argon2id,
      });

      let [studentUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, data.email))
        .limit(1);

      if (!studentUser) {
        await db.insert(users).values(sv({
          name: data.name,
          email: data.email,
          password: studentPassword,
          role: "STUDENT",
          isActive: true,
        }));
        [studentUser] = await db
          .select()
          .from(users)
          .where(eq(users.email, data.email))
          .limit(1);
      }

      if (!studentUser) throw new Error(`Failed to create student user: ${data.email}`);

      let [studentRecord] = await db
        .select()
        .from(students)
        .where(eq(students.userId, studentUser.id))
        .limit(1);

      if (!studentRecord) {
        await db.insert(students).values(sv({
          userId: studentUser.id,
          tenantId: demoPersonal.id,
          status: "active",
          phoneNumber: data.phoneNumber,
          goal: data.goal,
          observations: data.observations,
          physicalRestrictions: data.physicalRestrictions,
        }));
        [studentRecord] = await db
          .select()
          .from(students)
          .where(eq(students.userId, studentUser.id))
          .limit(1);
      }

      if (!studentRecord) throw new Error(`Failed to create student: ${data.email}`);

      const existingRelation = await db
        .select()
        .from(coachStudentRelations)
        .where(eq(coachStudentRelations.studentId, studentRecord.id))
        .limit(1);

      if (!existingRelation.length) {
        await db.insert(coachStudentRelations).values(sv({
          tenantId: demoPersonal.id,
          studentId: studentRecord.id,
          status: "active",
          startDate: new Date(),
        }));
      }

      return studentRecord;
    }

    // Helper: create a student program as a snapshot of a template
    async function seedStudentProgram(studentId: string, templateName: string) {
      // Fetch the template with its workouts and exercises
      const [template] = await db
        .select()
        .from(programTemplates)
        .where(
          and(
            eq(programTemplates.tenantId, demoPersonal.id),
            eq(programTemplates.name, templateName),
          ),
        )
        .limit(1);

      if (!template) throw new Error(`Template not found: ${templateName}`);

      // Check if student program already exists
      const [existingProgram] = await db
        .select()
        .from(studentPrograms)
        .where(
          and(
            eq(studentPrograms.studentId, studentId),
            eq(studentPrograms.tenantId, demoPersonal.id),
          ),
        )
        .limit(1);

      if (existingProgram) return existingProgram;

      // Create student program
      await db.insert(studentPrograms).values(sv({
        tenantId: demoPersonal.id,
        studentId,
        programTemplateId: template.id,
        name: template.name,
        status: "active",
        startedAt: new Date(),
      }));

      const [program] = await db
        .select()
        .from(studentPrograms)
        .where(
          and(
            eq(studentPrograms.studentId, studentId),
            eq(studentPrograms.tenantId, demoPersonal.id),
          ),
        )
        .limit(1);

      if (!program) throw new Error(`Failed to create student program for student: ${studentId}`);

      // Fetch workouts from the template
      const wts = await db
        .select()
        .from(workoutTemplates)
        .where(eq(workoutTemplates.programTemplateId, template.id));

      for (const wt of wts) {
        // Create workout day (snapshot)
        await db.insert(workoutDays).values(sv({
          studentProgramId: program.id,
          name: wt.name,
          order: wt.order,
        }));

        const [day] = await db
          .select()
          .from(workoutDays)
          .where(
            and(
              eq(workoutDays.studentProgramId, program.id),
              eq(workoutDays.name, wt.name),
            ),
          )
          .limit(1);

        if (!day) continue;

        // Fetch exercise templates for this workout
        const ets = await db
          .select()
          .from(exerciseTemplates)
          .where(eq(exerciseTemplates.workoutTemplateId, wt.id));

        if (ets.length > 0) {
          await db.insert(studentExercises).values(
            sv(
              ets.map((et) => ({
                workoutDayId: day.id,
                exerciseId: et.exerciseId,
                sets: et.sets,
                repetitions: et.repetitions ?? null,
                restSeconds: et.restSeconds ?? null,
                duration: et.duration ?? null,
                notes: et.notes ?? null,
                order: et.order,
              })),
            ),
          );
        }
      }

      return program;
    }

    const existingStudents = await db
      .select()
      .from(students)
      .where(eq(students.tenantId, demoPersonal.id));

    // Fetch service plan IDs for contracts
    const allServicePlans = await db
      .select()
      .from(servicePlans)
      .where(eq(servicePlans.tenantId, demoPersonal.id));

    const servicePlanByName = Object.fromEntries(allServicePlans.map((p) => [p.name, p.id]));

    if (existingStudents.length === 0) {
      // ── Student 1: Fernanda Costa — Consultoria Online ──────────────────────
      const fernanda = await seedStudent({
        name: "Fernanda Costa",
        email: "fernanda.costa@demo.com",
        phoneNumber: "(21) 99876-5432",
        goal: "Ganho de força e resistência",
        observations: "Aluna online. Treina em casa com halteres e barra.",
        physicalRestrictions: null,
      });

      await seedStudentProgram(fernanda.id, "Consultoria Online — Full Body 3x por Semana");

      // Contract: Consultoria Online
      if (servicePlanByName["Consultoria Online"]) {
        await db.insert(coachingContracts).values(sv({
          tenantId: demoPersonal.id,
          studentId: fernanda.id,
          servicePlanId: servicePlanByName["Consultoria Online"],
          status: "active",
          startDate: new Date(),
        }));
      }

      // Progress records for Fernanda — 3 months of weight, waist, hip and body_fat tracking
      await db.insert(progressRecords).values(sv([
        // Month 1 — Week 1
        { tenantId: demoPersonal.id, studentId: fernanda.id, metricType: "weight", value: "72.30", unit: "kg", recordedAt: new Date("2026-01-06T12:00:00Z"), notes: "Início do programa" },
        { tenantId: demoPersonal.id, studentId: fernanda.id, metricType: "waist", value: "80.00", unit: "cm", recordedAt: new Date("2026-01-06T12:00:00Z") },
        { tenantId: demoPersonal.id, studentId: fernanda.id, metricType: "hip", value: "100.00", unit: "cm", recordedAt: new Date("2026-01-06T12:00:00Z") },
        { tenantId: demoPersonal.id, studentId: fernanda.id, metricType: "body_fat", value: "28.50", unit: "%", recordedAt: new Date("2026-01-06T12:00:00Z"), notes: "Dobras cutâneas" },
        // Month 1 — Week 3
        { tenantId: demoPersonal.id, studentId: fernanda.id, metricType: "weight", value: "71.80", unit: "kg", recordedAt: new Date("2026-01-20T12:00:00Z") },
        { tenantId: demoPersonal.id, studentId: fernanda.id, metricType: "waist", value: "79.50", unit: "cm", recordedAt: new Date("2026-01-20T12:00:00Z") },
        // Month 2 — Week 1
        { tenantId: demoPersonal.id, studentId: fernanda.id, metricType: "weight", value: "71.10", unit: "kg", recordedAt: new Date("2026-02-03T12:00:00Z") },
        { tenantId: demoPersonal.id, studentId: fernanda.id, metricType: "waist", value: "78.80", unit: "cm", recordedAt: new Date("2026-02-03T12:00:00Z") },
        { tenantId: demoPersonal.id, studentId: fernanda.id, metricType: "hip", value: "99.00", unit: "cm", recordedAt: new Date("2026-02-03T12:00:00Z") },
        { tenantId: demoPersonal.id, studentId: fernanda.id, metricType: "body_fat", value: "27.20", unit: "%", recordedAt: new Date("2026-02-03T12:00:00Z"), notes: "Boa evolução no mês 2" },
        // Month 2 — Week 3
        { tenantId: demoPersonal.id, studentId: fernanda.id, metricType: "weight", value: "70.50", unit: "kg", recordedAt: new Date("2026-02-17T12:00:00Z") },
        { tenantId: demoPersonal.id, studentId: fernanda.id, metricType: "waist", value: "78.20", unit: "cm", recordedAt: new Date("2026-02-17T12:00:00Z") },
        // Month 3 — Week 1
        { tenantId: demoPersonal.id, studentId: fernanda.id, metricType: "weight", value: "69.90", unit: "kg", recordedAt: new Date("2026-03-03T12:00:00Z") },
        { tenantId: demoPersonal.id, studentId: fernanda.id, metricType: "waist", value: "77.50", unit: "cm", recordedAt: new Date("2026-03-03T12:00:00Z") },
        { tenantId: demoPersonal.id, studentId: fernanda.id, metricType: "hip", value: "97.50", unit: "cm", recordedAt: new Date("2026-03-03T12:00:00Z") },
        { tenantId: demoPersonal.id, studentId: fernanda.id, metricType: "body_fat", value: "25.80", unit: "%", recordedAt: new Date("2026-03-03T12:00:00Z"), notes: "3 meses de evolução consistente" },
        // Month 3 — Week 3 (latest)
        { tenantId: demoPersonal.id, studentId: fernanda.id, metricType: "weight", value: "69.40", unit: "kg", recordedAt: new Date("2026-03-17T12:00:00Z"), notes: "Mês 3, semana 3" },
        { tenantId: demoPersonal.id, studentId: fernanda.id, metricType: "waist", value: "77.00", unit: "cm", recordedAt: new Date("2026-03-17T12:00:00Z") },
        { tenantId: demoPersonal.id, studentId: fernanda.id, metricType: "bicep", value: "29.50", unit: "cm", recordedAt: new Date("2026-03-17T12:00:00Z"), notes: "Primeira medição de bíceps" },
      ]));
      console.log("✓ 19 progress records seeded for Fernanda");

      // ── Student 2: Carlos Mendonça — Presencial 3x por Semana ───────────────
      const carlos = await seedStudent({
        name: "Carlos Mendonça",
        email: "carlos.mendonca@demo.com",
        phoneNumber: "(11) 91234-5678",
        goal: "Hipertrofia muscular",
        observations: "Treina há 2 anos. Experiência intermediária.",
        physicalRestrictions: "Leve dor no ombro direito — evitar carga alta no supino",
      });

      const carlosProgram = await seedStudentProgram(carlos.id, "Treino A/B/C — 3x por Semana");

      // Contract: Presencial 3x por Semana
      if (servicePlanByName["Presencial 3x por Semana"]) {
        await db.insert(coachingContracts).values(sv({
          tenantId: demoPersonal.id,
          studentId: carlos.id,
          servicePlanId: servicePlanByName["Presencial 3x por Semana"],
          status: "active",
          startDate: new Date(),
        }));
      }

      // Training schedule: Mon/Wed/Fri 08:00–09:00 (matches coach availability)
      await db.insert(trainingSchedules).values(sv([
        { tenantId: demoPersonal.id, studentId: carlos.id, studentProgramId: carlosProgram.id, dayOfWeek: 1, startTime: "08:00", endTime: "09:00", location: "Academia Central", isActive: true },
        { tenantId: demoPersonal.id, studentId: carlos.id, studentProgramId: carlosProgram.id, dayOfWeek: 3, startTime: "08:00", endTime: "09:00", location: "Academia Central", isActive: true },
        { tenantId: demoPersonal.id, studentId: carlos.id, studentProgramId: carlosProgram.id, dayOfWeek: 5, startTime: "08:00", endTime: "09:00", location: "Academia Central", isActive: true },
      ]));

      // ── Student 3: Ana Paula Silva — Presencial 5x por Semana ───────────────
      const ana = await seedStudent({
        name: "Ana Paula Silva",
        email: "ana.silva@demo.com",
        phoneNumber: "(11) 98765-4321",
        goal: "Condicionamento físico e definição muscular",
        observations: "Prefere treinos no período da tarde. Muito dedicada e assídua.",
        physicalRestrictions: null,
      });

      const anaProgram = await seedStudentProgram(ana.id, "Treino 5 Dias — Segunda a Sexta");

      // Contract: Presencial 5x por Semana
      if (servicePlanByName["Presencial 5x por Semana"]) {
        await db.insert(coachingContracts).values(sv({
          tenantId: demoPersonal.id,
          studentId: ana.id,
          servicePlanId: servicePlanByName["Presencial 5x por Semana"],
          status: "active",
          startDate: new Date(),
        }));
      }

      // Training schedule: Mon–Fri 16:00–17:00 (matches coach availability)
      await db.insert(trainingSchedules).values(sv([
        { tenantId: demoPersonal.id, studentId: ana.id, studentProgramId: anaProgram.id, dayOfWeek: 1, startTime: "16:00", endTime: "17:00", location: "Academia Central", isActive: true },
        { tenantId: demoPersonal.id, studentId: ana.id, studentProgramId: anaProgram.id, dayOfWeek: 2, startTime: "16:00", endTime: "17:00", location: "Academia Central", isActive: true },
        { tenantId: demoPersonal.id, studentId: ana.id, studentProgramId: anaProgram.id, dayOfWeek: 3, startTime: "16:00", endTime: "17:00", location: "Academia Central", isActive: true },
        { tenantId: demoPersonal.id, studentId: ana.id, studentProgramId: anaProgram.id, dayOfWeek: 4, startTime: "16:00", endTime: "17:00", location: "Academia Central", isActive: true },
        { tenantId: demoPersonal.id, studentId: ana.id, studentProgramId: anaProgram.id, dayOfWeek: 5, startTime: "16:00", endTime: "17:00", location: "Academia Central", isActive: true },
      ]));

      console.log("✓ 3 demo students seeded with programs, training schedules and coaching contracts");
    } else {
      console.log(`✓ Demo students already exist (${existingStudents.length}), skipping`);
    }

    console.log("Seed completed successfully!");
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const shouldClean = args.includes("--clean") || args.includes("--only-clean");
  const onlyClean = args.includes("--only-clean");

  const pool = new Pool(getDatabaseConfig());
  const db = drizzle(pool);

  try {
    if (shouldClean) {
      await clean(db);
    }
    if (!onlyClean) {
      await seed(db);
    }
  } catch (error) {
    console.error("Failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
    console.log("Database connection closed");
  }
}

main();
