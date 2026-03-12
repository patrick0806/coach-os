import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { hash } from "argon2";

import { getDatabaseConfig } from "@config/database/database.config";
import { env } from "@config/env";
import {
  plans,
  users,
  personals,
  students,
  admins,
  exercises,
  workoutExercises,
  workoutPlanStudents,
  workoutPlans,
  availabilitySlots,
  servicePlans,
  bookingSeries,
  bookings,
  passwordSetupTokens,
  studentNotes,
  NewServicePlan,
  CreateWorkoutPlan,
  CreateWorkoutExercise,
  CreateWorkoutPlanStudent,
} from "./schema";
import { ApplicationRoles } from "@shared/enums";

async function cleanDatabase() {
  console.log("Starting database cleanup...");

  const pool = new Pool(getDatabaseConfig());
  const db = drizzle(pool);

  try {
    // Delete in dependency order: children before parents
    await db.delete(workoutExercises);
    await db.delete(workoutPlanStudents);
    await db.delete(workoutPlans);
    await db.delete(bookings);
    await db.delete(bookingSeries);
    await db.delete(studentNotes);
    await db.delete(students);
    await db.delete(servicePlans);
    await db.delete(availabilitySlots);
    await db.delete(passwordSetupTokens);
    await db.delete(admins);
    await db.delete(personals);
    await db.delete(exercises);
    await db.delete(plans);
    await db.delete(users);

    console.log("Database cleaned successfully!");
  } catch (error) {
    console.error("Clean failed:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

async function seed() {
  console.log("Starting database seed...");

  const pool = new Pool(getDatabaseConfig());
  const db = drizzle(pool);

  try {
    // --- USERS ---
    console.log("Inserting users...");
    const usersToInsert = [
      {
        name: "Admin User",
        email: "admin@example.com",
        password: await hash("testPassword" + env.HASH_PEPPER, { type: 2 }), // argon2id = type 2
        role: ApplicationRoles.ADMIN,
        isActive: true,
      },
      {
        name: "Personal Trainer",
        email: "personal@example.com",
        password: await hash("testPassword" + env.HASH_PEPPER, { type: 2 }),
        role: ApplicationRoles.PERSONAL,
        isActive: true,
      },
      {
        name: "Joao Silva",
        email: "joao.silva@example.com",
        password: await hash("studentPassword" + env.HASH_PEPPER, { type: 2 }),
        role: ApplicationRoles.STUDENT,
        isActive: true,
      },
      {
        name: "Maria Oliveira",
        email: "maria.oliveira@example.com",
        password: await hash("studentPassword" + env.HASH_PEPPER, { type: 2 }),
        role: ApplicationRoles.STUDENT,
        isActive: true,
      },
      {
        name: "Carlos Santos",
        email: "carlos.santos@example.com",
        password: await hash("studentPassword" + env.HASH_PEPPER, { type: 2 }),
        role: ApplicationRoles.STUDENT,
        isActive: true,
      },
    ];

    const [adminUser, personalUser, studentUser, student2User, student3User] = await db
      .insert(users)
      .values(usersToInsert)
      .returning();

    // --- ADMINS ---
    console.log("Inserting admin profile...");
    await db.insert(admins).values({ userId: adminUser.id });

    // --- SAAS PLANS ---
    console.log("Inserting SaaS plans...");
    const plansData = [
      {
        name: "Basico",
        description: "O plano perfeito para quem esta comecando",
        benefits: ["Ate 3 alunos", "Agenda personalizada", "Planilhas de treinos"],
        price: "19.90",
        order: 0,
        highlighted: false,
        isActive: true,
        maxStudents: 3,
      },
      {
        name: "Pro",
        description: "O plano perfeito para quem esta voando",
        benefits: ["Ate 10 alunos", "Agenda personalizada", "Planilhas de treinos"],
        price: "29.90",
        order: 1,
        highlighted: true,
        isActive: true,
        maxStudents: 10,
      },
      {
        name: "Empresarial",
        description: "Plano customizado para grandes projetos",
        benefits: ["Alunos ilimitados", "Agenda personalizada", "Planilhas de treinos"],
        price: "49.90",
        order: 2,
        highlighted: false,
        isActive: true,
        maxStudents: null,
      },
    ];
    const insertedPlans = await db.insert(plans).values(plansData).returning();
    const basicPlan = insertedPlans.find((plan) => plan.name.toLowerCase() === "basico");
    if (!basicPlan) {
      throw new Error("Plano Basico não encontrado no seed");
    }

    // --- PERSONALS ---
    console.log("Inserting personal profile...");
    const now = new Date();
    const trialEndsAt = new Date(now);
    trialEndsAt.setDate(trialEndsAt.getDate() + 30);
    const personalData = {
      userId: personalUser.id,
      slug: "personal-trainer",
      bio: "Personal trainer certificado com mais de 10 anos de experiencia em treinamento funcional e musculacao.",
      profilePhoto: "https://i.pravatar.cc/300?img=12",
      themeColor: "#10b981",
      phoneNumber: "+5511999887766",
      lpTitle: "Transforme seu corpo, transforme sua vida!",
      lpSubtitle:
        "Treinos personalizados e acompanhamento profissional para voce alcancar seus objetivos.",
      lpHeroImage:
        "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200",
      lpAboutTitle: "Sobre Mim",
      lpAboutText:
        "Sou formado em Educacao Fisica e especializado em treinamento funcional. Minha missao e ajudar voce a conquistar seus objetivos de forma saudavel e sustentavel.",
      lpImage1:
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800",
      lpImage2:
        "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800",
      lpImage3:
        "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800",
      trialStartedAt: now,
      trialEndsAt,
      accessStatus: "trialing",
      subscriptionPlanId: basicPlan.id,
      subscriptionStatus: "trialing",
      subscriptionExpiresAt: trialEndsAt,
    };
    const [insertedPersonal] = await db
      .insert(personals)
      .values(personalData)
      .returning();

    // --- SERVICE PLANS ---
    console.log("Inserting service plans...");
    const servicePlansData: any[] = [
      {
        personalId: insertedPersonal.id,
        name: "Consultoria Online",
        sessionsPerWeek: 0,
        price: "149.90",
        attendanceType: "online" as const,
      },
      {
        personalId: insertedPersonal.id,
        name: "Presencial 3x na Semana",
        sessionsPerWeek: 3,
        price: "349.90",
        attendanceType: "presential" as const,
      },
      {
        personalId: insertedPersonal.id,
        name: "Presencial Todos os Dias",
        sessionsPerWeek: 5,
        price: "549.90",
        attendanceType: "presential" as const,
      }
    ];
    const [planOnline, plan3x, plan5x] = await db
      .insert(servicePlans)
      .values(servicePlansData as any)
      .returning();

    // --- STUDENTS ---
    console.log("Inserting student profile...");
    const [joao, maria, carlos] = await db.insert(students).values([
      {
        userId: studentUser.id,
        personalId: insertedPersonal.id,
        servicePlanId: planOnline.id,
      },
      {
        userId: student2User.id,
        personalId: insertedPersonal.id,
        servicePlanId: plan3x.id,
      },
      {
        userId: student3User.id,
        personalId: insertedPersonal.id,
        servicePlanId: plan5x.id,
      }
    ]).returning();

    // --- EXERCISES ---
    console.log("Inserting global exercises...");
    const exercisesData = [
      // Peito
      { name: "Supino Reto", description: "Supino reto com barra para desenvolvimento do peitoral", muscleGroup: "peito", personalId: null },
      { name: "Supino Reto com Halteres", description: "Supino reto com halteres para maior amplitude", muscleGroup: "peito", personalId: null },
      { name: "Supino Inclinado", description: "Supino inclinado com barra ou halteres", muscleGroup: "peito", personalId: null },
      { name: "Supino Inclinado com Halteres", description: "Supino inclinado com halteres para peitoral superior", muscleGroup: "peito", personalId: null },
      { name: "Supino Declinado", description: "Supino declinado para parte inferior do peitoral", muscleGroup: "peito", personalId: null },
      { name: "Chest Press Maquina", description: "Pressao horizontal na maquina para peitoral", muscleGroup: "peito", personalId: null },
      { name: "Supino Articulado", description: "Supino em maquina articulada", muscleGroup: "peito", personalId: null },
      { name: "Crucifixo Reto", description: "Crucifixo reto com halteres", muscleGroup: "peito", personalId: null },
      { name: "Crucifixo Inclinado", description: "Crucifixo inclinado para peitoral superior", muscleGroup: "peito", personalId: null },
      { name: "Crucifixo Declinado", description: "Crucifixo declinado com halteres", muscleGroup: "peito", personalId: null },
      { name: "Crossover Polia Alta", description: "Crossover na polia alta para peitoral medio e inferior", muscleGroup: "peito", personalId: null },
      { name: "Crossover Polia Baixa", description: "Crossover na polia baixa para peitoral superior", muscleGroup: "peito", personalId: null },
      { name: "Peck Deck", description: "Voador na maquina para isolamento do peitoral", muscleGroup: "peito", personalId: null },
      { name: "Flexao de Braco", description: "Flexao de braco tradicional no solo", muscleGroup: "peito", personalId: null },
      { name: "Flexao Inclinada", description: "Flexao com apoio elevado para regressao", muscleGroup: "peito", personalId: null },
      { name: "Flexao Declinado", description: "Flexao com os pes elevados para maior enfase no peitoral superior", muscleGroup: "peito", personalId: null },
      { name: "Flexao Fechada", description: "Flexao com pegada fechada para peitoral e triceps", muscleGroup: "peito", personalId: null },
      // Costas
      { name: "Puxada Frontal", description: "Puxada na barra ou polia para dorsais", muscleGroup: "costas", personalId: null },
      { name: "Puxada Aberta", description: "Puxada alta com pegada pronada e aberta", muscleGroup: "costas", personalId: null },
      { name: "Puxada Supinada", description: "Puxada na polia com pegada supinada", muscleGroup: "costas", personalId: null },
      { name: "Puxada Neutra", description: "Puxada na polia com pegada neutra", muscleGroup: "costas", personalId: null },
      { name: "Puxada Unilateral", description: "Puxada unilateral na polia alta", muscleGroup: "costas", personalId: null },
      { name: "Barra Fixa", description: "Barra fixa para costas e biceps", muscleGroup: "costas", personalId: null },
      { name: "Barra Fixa Supinada", description: "Barra fixa com pegada supinada", muscleGroup: "costas", personalId: null },
      { name: "Remada Curvada", description: "Remada curvada com barra", muscleGroup: "costas", personalId: null },
      { name: "Remada Serrote", description: "Remada unilateral com haltere apoiado no banco", muscleGroup: "costas", personalId: null },
      { name: "Remada Unilateral", description: "Remada unilateral com haltere", muscleGroup: "costas", personalId: null },
      { name: "Remada Cavalinho", description: "Remada em T para espessura dorsal", muscleGroup: "costas", personalId: null },
      { name: "Remada Baixa", description: "Remada baixa na polia com triangulo", muscleGroup: "costas", personalId: null },
      { name: "Remada Maquina", description: "Remada guiada em maquina", muscleGroup: "costas", personalId: null },
      { name: "Remada Articulada", description: "Remada em maquina articulada", muscleGroup: "costas", personalId: null },
      { name: "Pulldown Reto", description: "Puxada com bracos estendidos na polia", muscleGroup: "costas", personalId: null },
      { name: "Pullover", description: "Pullover com halteres para dorsais e peitoral", muscleGroup: "costas", personalId: null },
      { name: "Levantamento Terra", description: "Levantamento terra tradicional", muscleGroup: "costas", personalId: null },
      // Ombro
      { name: "Desenvolvimento Militar", description: "Desenvolvimento de ombros com barra", muscleGroup: "ombro", personalId: null },
      { name: "Desenvolvimento com Halteres", description: "Desenvolvimento sentado com halteres", muscleGroup: "ombro", personalId: null },
      { name: "Desenvolvimento Maquina", description: "Desenvolvimento de ombros em maquina", muscleGroup: "ombro", personalId: null },
      { name: "Arnold Press", description: "Desenvolvimento de ombro estilo Arnold", muscleGroup: "ombro", personalId: null },
      { name: "Push Press", description: "Desenvolvimento acima da cabeca com ajuda das pernas", muscleGroup: "ombro", personalId: null },
      { name: "Elevacao Lateral", description: "Elevacao lateral com halteres", muscleGroup: "ombro", personalId: null },
      { name: "Elevacao Lateral Unilateral", description: "Elevacao lateral feita de forma unilateral", muscleGroup: "ombro", personalId: null },
      { name: "Elevacao Lateral na Polia", description: "Elevacao lateral na polia baixa", muscleGroup: "ombro", personalId: null },
      { name: "Elevacao Frontal", description: "Elevacao frontal com halteres ou barra", muscleGroup: "ombro", personalId: null },
      { name: "Elevacao Frontal na Polia", description: "Elevacao frontal unilateral na polia", muscleGroup: "ombro", personalId: null },
      { name: "Remada Alta", description: "Remada alta com barra ou polia", muscleGroup: "ombro", personalId: null },
      { name: "Face Pull", description: "Face pull na polia alta", muscleGroup: "ombro", personalId: null },
      { name: "Crucifixo Inverso", description: "Crucifixo inverso para posterior de ombro", muscleGroup: "ombro", personalId: null },
      { name: "Crucifixo Inverso Maquina", description: "Peck deck invertido para deltoide posterior", muscleGroup: "ombro", personalId: null },
      { name: "Desenvolvimento Landmine", description: "Press com barra apoiada no landmine", muscleGroup: "ombro", personalId: null },
      // Biceps
      { name: "Rosca Direta", description: "Rosca direta com barra para biceps", muscleGroup: "biceps", personalId: null },
      { name: "Rosca Direta Barra W", description: "Rosca direta usando barra W", muscleGroup: "biceps", personalId: null },
      { name: "Rosca Alternada", description: "Rosca alternada com halteres", muscleGroup: "biceps", personalId: null },
      { name: "Rosca Alternada Sentado", description: "Rosca alternada realizada sentado", muscleGroup: "biceps", personalId: null },
      { name: "Rosca Martelo", description: "Rosca martelo com halteres", muscleGroup: "biceps", personalId: null },
      { name: "Rosca Martelo Corda", description: "Rosca martelo na polia com corda", muscleGroup: "biceps", personalId: null },
      { name: "Rosca Scott", description: "Rosca no banco Scott", muscleGroup: "biceps", personalId: null },
      { name: "Rosca Scott Unilateral", description: "Rosca Scott feita com um braco por vez", muscleGroup: "biceps", personalId: null },
      { name: "Rosca Concentrada", description: "Rosca concentrada unilateral", muscleGroup: "biceps", personalId: null },
      { name: "Rosca Inclinada", description: "Rosca com halteres em banco inclinado", muscleGroup: "biceps", personalId: null },
      { name: "Rosca 21", description: "Metodo de 21 repeticoes para biceps", muscleGroup: "biceps", personalId: null },
      { name: "Rosca na Polia", description: "Rosca de biceps na polia baixa", muscleGroup: "biceps", personalId: null },
      { name: "Rosca Inversa", description: "Rosca com pegada pronada para biceps e antebraco", muscleGroup: "biceps", personalId: null },
      // Triceps
      { name: "Triceps Testa", description: "Triceps na barra W ou reta", muscleGroup: "triceps", personalId: null },
      { name: "Triceps Frances", description: "Triceps frances com halteres ou barra", muscleGroup: "triceps", personalId: null },
      { name: "Triceps Frances Unilateral", description: "Extensao de triceps acima da cabeca com um braco", muscleGroup: "triceps", personalId: null },
      { name: "Triceps Corda", description: "Triceps na polia com corda", muscleGroup: "triceps", personalId: null },
      { name: "Triceps Barra Reta", description: "Triceps pulley com barra reta", muscleGroup: "triceps", personalId: null },
      { name: "Triceps Barra V", description: "Triceps na polia com barra em V", muscleGroup: "triceps", personalId: null },
      { name: "Triceps Coice", description: "Extensao de triceps com halteres", muscleGroup: "triceps", personalId: null },
      { name: "Triceps Banco", description: "Mergulho em banco para triceps", muscleGroup: "triceps", personalId: null },
      { name: "Paralelas", description: "Mergulho nas paralelas com foco em triceps", muscleGroup: "triceps", personalId: null },
      { name: "Supino Fechado", description: "Supino fechado para triceps", muscleGroup: "triceps", personalId: null },
      { name: "Extensao de Triceps na Polia Unilateral", description: "Extensao unilateral de triceps na polia", muscleGroup: "triceps", personalId: null },
      { name: "Triceps Maquina", description: "Extensao de triceps em maquina", muscleGroup: "triceps", personalId: null },
      { name: "JM Press", description: "Variacao de press para triceps com barra", muscleGroup: "triceps", personalId: null },
      // Perna
      { name: "Agachamento Livre", description: "Agachamento com barra", muscleGroup: "perna", personalId: null },
      { name: "Agachamento Frontal", description: "Agachamento frontal com barra", muscleGroup: "perna", personalId: null },
      { name: "Agachamento Hack", description: "Agachamento no hack machine", muscleGroup: "perna", personalId: null },
      { name: "Agachamento no Smith", description: "Agachamento guiado no smith", muscleGroup: "perna", personalId: null },
      { name: "Leg Press", description: "Leg press horizontal ou inclinado", muscleGroup: "perna", personalId: null },
      { name: "Leg Press 45", description: "Leg press inclinado 45 graus", muscleGroup: "perna", personalId: null },
      { name: "Cadeira Extensora", description: "Extensao de pernas na maquina", muscleGroup: "perna", personalId: null },
      { name: "Extensora Unilateral", description: "Extensao de perna unilateral na maquina", muscleGroup: "perna", personalId: null },
      { name: "Cadeira Flexora", description: "Flexao de pernas na maquina", muscleGroup: "perna", personalId: null },
      { name: "Mesa Flexora", description: "Flexao de joelhos na mesa flexora", muscleGroup: "perna", personalId: null },
      { name: "Flexora Sentado", description: "Flexora sentado para posteriores", muscleGroup: "perna", personalId: null },
      { name: "Passada", description: "Avanco ou passada com halteres", muscleGroup: "perna", personalId: null },
      { name: "Afundo", description: "Afundo estacionario com halteres ou barra", muscleGroup: "perna", personalId: null },
      { name: "Bulgarian Split Squat", description: "Agachamento bulgaro com apoio traseiro", muscleGroup: "perna", personalId: null },
      { name: "Step Up", description: "Subida no banco ou caixa com carga", muscleGroup: "perna", personalId: null },
      { name: "Agachamento Goblet", description: "Agachamento segurando halter a frente do corpo", muscleGroup: "perna", personalId: null },
      { name: "Stiff", description: "Stiff com barra ou halteres para posteriores", muscleGroup: "perna", personalId: null },
      { name: "Levantamento Terra Romeno", description: "Focado nos posteriores e gluteos", muscleGroup: "perna", personalId: null },
      { name: "Levantamento Terra Sumo", description: "Variacao do terra com base ampla", muscleGroup: "perna", personalId: null },
      { name: "Bom Dia", description: "Movimento de hinge para posteriores com barra", muscleGroup: "perna", personalId: null },
      { name: "Panturrilha em Pe", description: "Elevacao de panturrilha em pe", muscleGroup: "perna", personalId: null },
      { name: "Panturrilha Sentado", description: "Elevacao de panturrilha sentado", muscleGroup: "perna", personalId: null },
      { name: "Panturrilha no Leg Press", description: "Elevacao de panturrilha usando o leg press", muscleGroup: "perna", personalId: null },
      { name: "Panturrilha Unilateral", description: "Elevacao de panturrilha com uma perna por vez", muscleGroup: "perna", personalId: null },
      // Gluteo
      { name: "Gluteo 4 Apoios", description: "Gluteo 4 apoios com caneleira", muscleGroup: "gluteo", personalId: null },
      { name: "Coice na Polia", description: "Extensao de quadril na polia baixa", muscleGroup: "gluteo", personalId: null },
      { name: "Hip Thrust", description: "Elevacao de quadril com barra", muscleGroup: "gluteo", personalId: null },
      { name: "Hip Thrust Maquina", description: "Elevacao de quadril em maquina especifica", muscleGroup: "gluteo", personalId: null },
      { name: "Glute Bridge", description: "Elevacao de quadril no solo ou com carga", muscleGroup: "gluteo", personalId: null },
      { name: "Abducao Quadril", description: "Abducao de quadril na maquina", muscleGroup: "gluteo", personalId: null },
      { name: "Abducao de Quadril na Polia", description: "Abducao unilateral com tornozeleira na polia", muscleGroup: "gluteo", personalId: null },
      { name: "Avanco Gluteo", description: "Passada focando gluteos", muscleGroup: "gluteo", personalId: null },
      { name: "Agachamento Sumo", description: "Agachamento sumo com barra ou halteres", muscleGroup: "gluteo", personalId: null },
      { name: "Levantamento Sumo com Halter", description: "Hinge com base ampla para gluteos e adutores", muscleGroup: "gluteo", personalId: null },
      { name: "Cadeira Abdutora", description: "Abducao de quadril na maquina", muscleGroup: "gluteo", personalId: null },
      { name: "Cadeira Adutora", description: "Aducao de quadril na maquina", muscleGroup: "gluteo", personalId: null },
      { name: "Cable Pull Through", description: "Extensao de quadril na polia entre as pernas", muscleGroup: "gluteo", personalId: null },
      { name: "Frog Pump", description: "Elevacao de quadril com sola dos pes unidas", muscleGroup: "gluteo", personalId: null },
      { name: "Donkey Kick", description: "Coice de gluteo no solo ou com miniband", muscleGroup: "gluteo", personalId: null },
      { name: "Lateral Walk com Mini Band", description: "Caminhada lateral com faixa elastica", muscleGroup: "gluteo", personalId: null },
      // Core
      { name: "Prancha", description: "Exercicio isometrico de core", muscleGroup: "core", personalId: null },
      { name: "Prancha Lateral", description: "Prancha lateral para obliquos e estabilizacao", muscleGroup: "core", personalId: null },
      { name: "Prancha com Toque no Ombro", description: "Prancha alta alternando toque nos ombros", muscleGroup: "core", personalId: null },
      { name: "Abdominal Supra", description: "Abdominal tradicional", muscleGroup: "core", personalId: null },
      { name: "Abdominal Infra", description: "Abdominal inferior", muscleGroup: "core", personalId: null },
      { name: "Abdominal Maquina", description: "Flexao de tronco na maquina abdominal", muscleGroup: "core", personalId: null },
      { name: "Abdominal na Polia", description: "Crunch ajoelhado na polia alta", muscleGroup: "core", personalId: null },
      { name: "Abdominal Remador", description: "Abdominal no solo levando joelhos e tronco", muscleGroup: "core", personalId: null },
      { name: "Bicicleta", description: "Abdominal obliquo em movimento", muscleGroup: "core", personalId: null },
      { name: "Russian Twist", description: "Torcao de tronco sentado", muscleGroup: "core", personalId: null },
      { name: "Elevacao de Pernas", description: "Elevacao de pernas no banco ou no solo", muscleGroup: "core", personalId: null },
      { name: "Elevacao de Joelhos na Barra", description: "Elevacao de joelhos pendurado na barra", muscleGroup: "core", personalId: null },
      { name: "Canivete", description: "Abdominal tipo V-up", muscleGroup: "core", personalId: null },
      { name: "Dead Bug", description: "Exercicio de estabilidade do core em decubito dorsal", muscleGroup: "core", personalId: null },
      { name: "Bird Dog", description: "Extensao alternada de braco e perna em quatro apoios", muscleGroup: "core", personalId: null },
      { name: "Mountain Climber", description: "Corrida de montanha com foco em core e condicionamento", muscleGroup: "core", personalId: null },
      { name: "Hollow Hold", description: "Posicao isometrica para estabilidade anterior do tronco", muscleGroup: "core", personalId: null },
    ].map((exercise) => ({
      ...exercise,
      exercisedbGifUrl: null,
      youtubeUrl: null,
    }));
    const insertedExercises = await db.insert(exercises).values(exercisesData).returning();

    // --- GENERIC TEMPLATES ---
    console.log("Inserting workout generic templates...");
    const genericTemplates: any[] = [
      {
        personalId: insertedPersonal.id,
        name: "Peito e Tríceps",
        description: "Treino focado em superiores (Peitoral e Tríceps)",
        planKind: "template" as const,
      },
      {
        personalId: insertedPersonal.id,
        name: "Costas e Bíceps",
        description: "Treino focado em superiores (Dorsais e Bíceps)",
        planKind: "template" as const,
      },
      {
        personalId: insertedPersonal.id,
        name: "Pernas e Glúteos",
        description: "Treino focado em inferiores",
        planKind: "template" as const,
      }
    ];
    const [chestTriceps, backBiceps, legsGlutes] = await db.insert(workoutPlans).values(genericTemplates as any).returning();

    const getExerciseId = (nameMatch: string) => insertedExercises.find(e => e.name.toLowerCase().includes(nameMatch.toLowerCase()))?.id;
    const chestIds = [getExerciseId("supino reto"), getExerciseId("supino inclinado"), getExerciseId("crucifixo reto")];
    const tricepsIds = [getExerciseId("triceps testa"), getExerciseId("triceps corda")];
    const backIds = [getExerciseId("puxada frontal"), getExerciseId("remada curvada"), getExerciseId("remada baixa")];
    const bicepsIds = [getExerciseId("rosca direta"), getExerciseId("rosca alternada")];
    const legIds = [getExerciseId("agachamento livre"), getExerciseId("leg press"), getExerciseId("cadeira extensora")];
    const gluteIds = [getExerciseId("abducao quadril"), getExerciseId("gluteo 4 apoios")];

    // Generic function to map workout exercises
    const mapExercises = (planId: string, exerciseIds: (string | undefined)[], load: string | null, rest: string, exec: string) =>
      exerciseIds.filter(Boolean).map((id, index) => ({
        workoutPlanId: planId,
        exerciseId: id as string,
        sets: 3,
        repetitions: 12,
        order: index,
        load, restTime: rest, executionTime: exec
      }));

    const workoutExercisesToInsert = [
      ...mapExercises(chestTriceps.id, [...chestIds, ...tricepsIds], null, "60s", "45s"),
      ...mapExercises(backBiceps.id, [...backIds, ...bicepsIds], null, "60s", "45s"),
      ...mapExercises(legsGlutes.id, [...legIds, ...gluteIds], null, "90s", "60s")
    ];

    await db.insert(workoutExercises).values(workoutExercisesToInsert);

    // --- STUDENT PLANS ---
    console.log("Inserting specific student workout plans...");
    const joaoPlansToInsert: any[] = [
      { personalId: insertedPersonal.id, name: "Treino A - Joao", planKind: "student" as const, sourceTemplateId: chestTriceps.id }
    ];
    const [joaoPlan1] = await db.insert(workoutPlans).values(joaoPlansToInsert as any).returning();
    await db.insert(workoutPlanStudents).values([{ workoutPlanId: joaoPlan1.id, studentId: joao.id } as CreateWorkoutPlanStudent]);
    await db.insert(workoutExercises).values([
      ...mapExercises(joaoPlan1.id, [...chestIds, ...tricepsIds], "20kg", "45s", "40s")
    ]);

    const mariaPlansToInsert: any[] = [
      { personalId: insertedPersonal.id, name: "Treino A - Maria (Segunda)", planKind: "student" as const, sourceTemplateId: legsGlutes.id },
      { personalId: insertedPersonal.id, name: "Treino B - Maria (Quarta)", planKind: "student" as const, sourceTemplateId: chestTriceps.id },
      { personalId: insertedPersonal.id, name: "Treino C - Maria (Sexta)", planKind: "student" as const, sourceTemplateId: backBiceps.id },
    ];
    const [mariaPlanA, mariaPlanB, mariaPlanC] = await db.insert(workoutPlans).values(mariaPlansToInsert).returning();
    await db.insert(workoutPlanStudents).values([
      { workoutPlanId: mariaPlanA.id, studentId: maria.id },
      { workoutPlanId: mariaPlanB.id, studentId: maria.id },
      { workoutPlanId: mariaPlanC.id, studentId: maria.id },
    ] as any[]);
    await db.insert(workoutExercises).values([
      ...mapExercises(mariaPlanA.id, [...legIds, ...gluteIds], "30kg", "120s", "60s"),
      ...mapExercises(mariaPlanB.id, [...chestIds, ...tricepsIds], "15kg", "60s", "45s"),
      ...mapExercises(mariaPlanC.id, [...backIds, ...bicepsIds], "25kg", "90s", "45s"),
    ]);

    const [carlosPlanA, carlosPlanB, carlosPlanC] = await db.insert(workoutPlans).values([
      { personalId: insertedPersonal.id, name: "Treino A - Carlos (Peito/Tríceps)", planKind: "student" as const, sourceTemplateId: chestTriceps.id },
      { personalId: insertedPersonal.id, name: "Treino B - Carlos (Costas/Bíceps)", planKind: "student" as const, sourceTemplateId: backBiceps.id },
      { personalId: insertedPersonal.id, name: "Treino C - Carlos (Perna)", planKind: "student" as const, sourceTemplateId: legsGlutes.id },
    ] as any).returning();
    await db.insert(workoutPlanStudents).values([
      { workoutPlanId: carlosPlanA.id, studentId: carlos.id },
      { workoutPlanId: carlosPlanB.id, studentId: carlos.id },
      { workoutPlanId: carlosPlanC.id, studentId: carlos.id },
    ] as any[]);
    await db.insert(workoutExercises).values([
      ...mapExercises(carlosPlanA.id, [...chestIds, ...tricepsIds], "40kg", "90s", "50s"),
      ...mapExercises(carlosPlanB.id, [...backIds, ...bicepsIds], "50kg", "90s", "50s"),
      ...mapExercises(carlosPlanC.id, [...legIds], "80kg", "120s", "60s"),
    ]);

    // --- BOOKING SERIES & BOOKINGS ---
    console.log("Inserting schedule and bookings...");
    const nextMonday = new Date();
    nextMonday.setDate(nextMonday.getDate() + ((1 + 7 - nextMonday.getDay()) % 7 || 7));
    const nextFriday = new Date(nextMonday);
    nextFriday.setDate(nextFriday.getDate() + 4);
    const endOfMonthTS = new Date(now.getFullYear(), now.getMonth() + 2, 0);

    const [mariaSeries, carlosSeries] = await db.insert(bookingSeries).values([
      {
        personalId: insertedPersonal.id,
        studentId: maria.id,
        servicePlanId: plan3x.id,
        daysOfWeek: [1, 3, 5],
        startTime: "08:00",
        endTime: "09:00",
        seriesStartDate: nextMonday.toISOString().split("T")[0],
        seriesEndDate: endOfMonthTS.toISOString().split("T")[0],
      },
      {
        personalId: insertedPersonal.id,
        studentId: carlos.id,
        servicePlanId: plan5x.id,
        daysOfWeek: [1, 2, 3, 4, 5],
        startTime: "14:00",
        endTime: "15:00",
        seriesStartDate: nextMonday.toISOString().split("T")[0],
        seriesEndDate: endOfMonthTS.toISOString().split("T")[0],
      }
    ]).returning();

    const bookingsToInsert = [];
    let currentDate = new Date(nextMonday);
    while (currentDate <= endOfMonthTS) {
      const day = currentDate.getDay();
      if ([1, 3, 5].includes(day)) {
        bookingsToInsert.push({
          personalId: insertedPersonal.id,
          studentId: maria.id,
          servicePlanId: plan3x.id,
          seriesId: mariaSeries.id,
          scheduledDate: new Date(currentDate),
          startTime: "08:00",
          endTime: "09:00",
          status: "scheduled",
        });
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    currentDate = new Date(nextMonday);
    while (currentDate <= endOfMonthTS) {
      const day = currentDate.getDay();
      if ([1, 2, 3, 4, 5].includes(day)) {
        bookingsToInsert.push({
          personalId: insertedPersonal.id,
          studentId: carlos.id,
          servicePlanId: plan5x.id,
          seriesId: carlosSeries.id,
          scheduledDate: new Date(currentDate),
          startTime: "14:00",
          endTime: "15:00",
          status: "scheduled",
        });
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    if (bookingsToInsert.length > 0) {
      await db.insert(bookings).values(bookingsToInsert);
    }

    console.log("Seed data inserted successfully!");
    console.log("\n--- Credenciais da Seed ---");
    console.log("Admin:    admin@example.com / testPassword");
    console.log("Personal: personal@example.com / testPassword");
    console.log("Student (Online):        joao.silva@example.com / studentPassword");
    console.log("Student (Presential 3x): maria.oliveira@example.com / studentPassword");
    console.log("Student (Presential 5x): carlos.santos@example.com / studentPassword");
  } catch (error) {
    console.error("Seed failed:", error);
    throw error;
  } finally {
    await pool.end();
    console.log("Database connection closed");
  }
}

async function main() {
  const args = process.argv.slice(2);
  const npmCleanFlag = process.env.npm_config_clean === "true";
  const npmOnlyCleanFlag = process.env.npm_config_only_clean === "true";

  const shouldClean = args.includes("--clean") || args.includes("-c") || npmCleanFlag;
  const onlyClean = args.includes("--only-clean") || npmOnlyCleanFlag;

  try {
    if (onlyClean) {
      await cleanDatabase();
      console.log("\nCleanup completed!");
      return;
    }

    if (shouldClean) {
      await cleanDatabase();
    }

    await seed();
    console.log("\nSeed completed!");
  } catch (error) {
    console.error("\nOperation failed:", error);
    process.exit(1);
  }
}

main();
