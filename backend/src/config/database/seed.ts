import "dotenv/config";
import { randomUUID } from "crypto";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as argon2 from "argon2";
import { and, eq, inArray } from "drizzle-orm";

import { getDatabaseConfig } from "./database.config";
import {
  plans,
  exercises,
  users,
  personals,
  servicePlans,
  programTemplates,
  workoutTemplates,
  exerciseTemplates,
  availabilityRules,
} from "./schema";

// Drizzle ORM type inference excludes optional/defaulted columns from insert types.
// This helper bypasses the limitation for seed data only.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function sv<T>(v: T): any {
  return v;
}

async function seed() {
  console.log("Seeding database...");

  const pool = new Pool(getDatabaseConfig());
  const db = drizzle(pool);

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
    const demoPassword = await argon2.hash("Coach@123456", {
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
            { exerciseId: ex["Supino Reto com Barra"],         sets: 4, repetitions: 10, restSeconds: 90 },
            { exerciseId: ex["Supino Inclinado com Halteres"], sets: 3, repetitions: 12, restSeconds: 90 },
            { exerciseId: ex["Crucifixo com Halteres"],        sets: 3, repetitions: 12, restSeconds: 60 },
            { exerciseId: ex["Tríceps Pulley"],                sets: 4, repetitions: 12, restSeconds: 60 },
            { exerciseId: ex["Tríceps Testa"],                 sets: 3, repetitions: 10, restSeconds: 60 },
          ],
        },
        {
          name: "Treino B — Quarta (Costas e Bíceps)",
          exercises: [
            { exerciseId: ex["Puxada na Barra Fixa"],          sets: 4, repetitions: 8,  restSeconds: 90 },
            { exerciseId: ex["Remada Curvada com Barra"],      sets: 4, repetitions: 10, restSeconds: 90 },
            { exerciseId: ex["Puxada no Pulley"],              sets: 3, repetitions: 12, restSeconds: 60 },
            { exerciseId: ex["Remada Unilateral com Halter"],  sets: 3, repetitions: 12, restSeconds: 60 },
            { exerciseId: ex["Rosca Direta com Barra"],        sets: 3, repetitions: 12, restSeconds: 60 },
            { exerciseId: ex["Rosca Alternada com Halteres"],  sets: 3, repetitions: 12, restSeconds: 60 },
          ],
        },
        {
          name: "Treino C — Sexta (Pernas)",
          exercises: [
            { exerciseId: ex["Agachamento Livre"],             sets: 4, repetitions: 8,  restSeconds: 120 },
            { exerciseId: ex["Leg Press 45°"],                 sets: 4, repetitions: 10, restSeconds: 90 },
            { exerciseId: ex["Cadeira Extensora"],             sets: 3, repetitions: 12, restSeconds: 60 },
            { exerciseId: ex["Mesa Flexora"],                  sets: 3, repetitions: 12, restSeconds: 60 },
            { exerciseId: ex["Stiff"],                         sets: 3, repetitions: 10, restSeconds: 90 },
            { exerciseId: ex["Panturrilha em Pé"],             sets: 4, repetitions: 15, restSeconds: 60 },
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
            { exerciseId: ex["Supino Reto com Barra"],         sets: 4, repetitions: 10, restSeconds: 90 },
            { exerciseId: ex["Supino Inclinado com Halteres"], sets: 3, repetitions: 12, restSeconds: 90 },
            { exerciseId: ex["Crucifixo com Halteres"],        sets: 3, repetitions: 12, restSeconds: 60 },
            { exerciseId: ex["Flexão de Braço"],               sets: 3, repetitions: 15, restSeconds: 60 },
            { exerciseId: ex["Tríceps Pulley"],                sets: 4, repetitions: 12, restSeconds: 60 },
            { exerciseId: ex["Tríceps Testa"],                 sets: 3, repetitions: 10, restSeconds: 60 },
          ],
        },
        {
          name: "Treino B — Terça (Costas e Bíceps)",
          exercises: [
            { exerciseId: ex["Puxada na Barra Fixa"],          sets: 4, repetitions: 8,  restSeconds: 90 },
            { exerciseId: ex["Remada Curvada com Barra"],      sets: 4, repetitions: 10, restSeconds: 90 },
            { exerciseId: ex["Puxada no Pulley"],              sets: 3, repetitions: 12, restSeconds: 60 },
            { exerciseId: ex["Remada Unilateral com Halter"],  sets: 3, repetitions: 12, restSeconds: 60 },
            { exerciseId: ex["Rosca Direta com Barra"],        sets: 3, repetitions: 12, restSeconds: 60 },
            { exerciseId: ex["Rosca Alternada com Halteres"],  sets: 3, repetitions: 12, restSeconds: 60 },
          ],
        },
        {
          name: "Treino C — Quarta (Pernas)",
          exercises: [
            { exerciseId: ex["Agachamento Livre"],             sets: 4, repetitions: 8,  restSeconds: 120 },
            { exerciseId: ex["Leg Press 45°"],                 sets: 4, repetitions: 10, restSeconds: 90 },
            { exerciseId: ex["Cadeira Extensora"],             sets: 3, repetitions: 12, restSeconds: 60 },
            { exerciseId: ex["Mesa Flexora"],                  sets: 3, repetitions: 12, restSeconds: 60 },
            { exerciseId: ex["Stiff"],                         sets: 3, repetitions: 10, restSeconds: 90 },
            { exerciseId: ex["Panturrilha em Pé"],             sets: 4, repetitions: 15, restSeconds: 60 },
          ],
        },
        {
          name: "Treino D — Quinta (Ombros e Abdômen)",
          exercises: [
            { exerciseId: ex["Desenvolvimento com Halteres"],  sets: 4, repetitions: 10, restSeconds: 90 },
            { exerciseId: ex["Elevação Lateral"],              sets: 4, repetitions: 12, restSeconds: 60 },
            { exerciseId: ex["Elevação Frontal"],              sets: 3, repetitions: 12, restSeconds: 60 },
            { exerciseId: ex["Prancha Abdominal"],             sets: 3, duration: "45s",  restSeconds: 60 },
            { exerciseId: ex["Abdominal Crunch"],              sets: 3, repetitions: 20, restSeconds: 60 },
          ],
        },
        {
          name: "Treino E — Sexta (Glúteos e Panturrilha)",
          exercises: [
            { exerciseId: ex["Hip Thrust"],                          sets: 4, repetitions: 10, restSeconds: 90 },
            { exerciseId: ex["Abdução de Quadril na Máquina"],       sets: 3, repetitions: 15, restSeconds: 60 },
            { exerciseId: ex["Stiff"],                               sets: 3, repetitions: 10, restSeconds: 90 },
            { exerciseId: ex["Panturrilha em Pé"],                   sets: 4, repetitions: 15, restSeconds: 60 },
            { exerciseId: ex["Panturrilha Sentado"],                 sets: 3, repetitions: 15, restSeconds: 60 },
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
            { exerciseId: ex["Agachamento Livre"],             sets: 3, repetitions: 10, restSeconds: 90 },
            { exerciseId: ex["Supino Reto com Barra"],         sets: 3, repetitions: 10, restSeconds: 90 },
            { exerciseId: ex["Puxada na Barra Fixa"],          sets: 3, repetitions: 8,  restSeconds: 90 },
            { exerciseId: ex["Desenvolvimento com Halteres"],  sets: 3, repetitions: 10, restSeconds: 60 },
            { exerciseId: ex["Prancha Abdominal"],             sets: 3, duration: "30s",  restSeconds: 60 },
          ],
        },
        {
          name: "Full Body B",
          exercises: [
            { exerciseId: ex["Leg Press 45°"],                 sets: 3, repetitions: 12, restSeconds: 90 },
            { exerciseId: ex["Supino Inclinado com Halteres"], sets: 3, repetitions: 12, restSeconds: 90 },
            { exerciseId: ex["Remada Curvada com Barra"],      sets: 3, repetitions: 10, restSeconds: 90 },
            { exerciseId: ex["Elevação Lateral"],              sets: 3, repetitions: 12, restSeconds: 60 },
            { exerciseId: ex["Hip Thrust"],                    sets: 3, repetitions: 10, restSeconds: 90 },
            { exerciseId: ex["Abdominal Crunch"],              sets: 3, repetitions: 20, restSeconds: 60 },
          ],
        },
        {
          name: "Full Body C",
          exercises: [
            { exerciseId: ex["Stiff"],                         sets: 3, repetitions: 10, restSeconds: 90 },
            { exerciseId: ex["Flexão de Braço"],               sets: 3, repetitions: 12, restSeconds: 60 },
            { exerciseId: ex["Remada Unilateral com Halter"],  sets: 3, repetitions: 12, restSeconds: 60 },
            { exerciseId: ex["Rosca Direta com Barra"],        sets: 3, repetitions: 12, restSeconds: 60 },
            { exerciseId: ex["Tríceps Pulley"],                sets: 3, repetitions: 12, restSeconds: 60 },
            { exerciseId: ex["Panturrilha em Pé"],             sets: 3, repetitions: 15, restSeconds: 60 },
          ],
        },
      ],
    );

    console.log(`✓ 3 program templates seeded with workouts and exercises`);

    console.log("Seed completed successfully!");
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
    console.log("Database connection closed");
  }
}

seed();
