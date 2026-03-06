import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { hash } from "argon2";
import { sql } from "drizzle-orm";

import { getDatabaseConfig } from "@config/database/database.config";
import {
  plans,
  users,
  personals,
  students,
  admins,
  exercises,
} from "./schema";
import { ApplicationRoles } from "@shared/enums";

async function cleanDatabase() {
  console.log("Starting database cleanup...");

  const pool = new Pool(getDatabaseConfig());
  const db = drizzle(pool);

  try {
    await db.delete(students);
    await db.delete(admins);
    await db.delete(personals);
    await db.delete(plans);
    await db.delete(exercises);
    await db.delete(users);

    await db.execute(sql`ALTER SEQUENCE IF EXISTS users_id_seq RESTART WITH 1`);
    await db.execute(sql`ALTER SEQUENCE IF EXISTS plans_id_seq RESTART WITH 1`);

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
    const [adminUser, personalUser, studentUser] = await db
      .insert(users)
      .values([
        {
          name: "Admin User",
          email: "admin@example.com",
          password: await hash("testPassword"),
          role: ApplicationRoles.ADMIN,
          isActive: true,
        },
        {
          name: "Personal Trainer",
          email: "personal@example.com",
          password: await hash("testPassword"),
          role: ApplicationRoles.PERSONAL,
          isActive: true,
        },
        {
          name: "Joao Silva",
          email: "joao.silva@example.com",
          password: await hash("studentPassword"),
          role: ApplicationRoles.STUDENT,
          isActive: true,
        },
      ])
      .returning();

    // --- ADMINS ---
    console.log("Inserting admin profile...");
    await db.insert(admins).values({ userId: adminUser.id });

    // --- PERSONALS ---
    console.log("Inserting personal profile...");
    const [insertedPersonal] = await db
      .insert(personals)
      .values({
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
      })
      .returning();

    // --- STUDENTS ---
    console.log("Inserting student profile...");
    await db.insert(students).values({
      userId: studentUser.id,
      personalId: insertedPersonal.id,
    });

    // --- SAAS PLANS ---
    console.log("Inserting SaaS plans...");
    await db.insert(plans).values([
      {
        name: "Basico",
        description: "O plano perfeito para quem esta comecando",
        benefits: ["Ate 3 alunos", "Agenda personalizada", "Planilhas de treinos"],
        price: "19.90",
        order: 0,
        highlighted: false,
        isActive: true,
      },
      {
        name: "Pro",
        description: "O plano perfeito para quem esta voando",
        benefits: ["Ate 10 alunos", "Agenda personalizada", "Planilhas de treinos"],
        price: "29.90",
        order: 1,
        highlighted: true,
        isActive: true,
      },
      {
        name: "Empresarial",
        description: "Plano customizado para grandes projetos",
        benefits: ["Alunos ilimitados", "Agenda personalizada", "Planilhas de treinos"],
        price: "49.90",
        order: 2,
        highlighted: false,
        isActive: true,
      },
    ]);

    // --- EXERCISES ---
    console.log("Inserting global exercises...");
    await db.insert(exercises).values([
      // Peito
      { name: "Supino Reto", description: "Supino reto com barra para desenvolvimento do peitoral", muscleGroup: "peito", personalId: null },
      { name: "Supino Inclinado", description: "Supino inclinado com barra ou halteres", muscleGroup: "peito", personalId: null },
      { name: "Supino Declinado", description: "Supino declinado para parte inferior do peitoral", muscleGroup: "peito", personalId: null },
      { name: "Crucifixo Reto", description: "Crucifixo reto com halteres", muscleGroup: "peito", personalId: null },
      { name: "Crucifixo Inclinado", description: "Crucifixo inclinado para peitoral superior", muscleGroup: "peito", personalId: null },
      // Costas
      { name: "Puxada Frontal", description: "Puxada na barra ou polia para dorsais", muscleGroup: "costas", personalId: null },
      { name: "Remada Curvada", description: "Remada curvada com barra", muscleGroup: "costas", personalId: null },
      { name: "Remada Unilateral", description: "Remada unilateral com haltere", muscleGroup: "costas", personalId: null },
      { name: "Levantamento Terra", description: "Levantamento terra tradicional", muscleGroup: "costas", personalId: null },
      { name: "Pullover", description: "Pullover com halteres para dorsais e peitoral", muscleGroup: "costas", personalId: null },
      { name: "Barra Fixa", description: "Barra fixa para costas e biceps", muscleGroup: "costas", personalId: null },
      { name: "Puxada Neutra", description: "Puxada na polia com pegada neutra", muscleGroup: "costas", personalId: null },
      // Ombro
      { name: "Desenvolvimento Militar", description: "Desenvolvimento de ombros com barra", muscleGroup: "ombro", personalId: null },
      { name: "Elevacao Lateral", description: "Elevacao lateral com halteres", muscleGroup: "ombro", personalId: null },
      { name: "Elevacao Frontal", description: "Elevacao frontal com halteres ou barra", muscleGroup: "ombro", personalId: null },
      { name: "Arnold Press", description: "Desenvolvimento de ombro estilo Arnold", muscleGroup: "ombro", personalId: null },
      { name: "Remada Alta", description: "Remada alta com barra ou polia", muscleGroup: "ombro", personalId: null },
      { name: "Face Pull", description: "Face pull na polia alta", muscleGroup: "ombro", personalId: null },
      { name: "Crucifixo Inverso", description: "Crucifixo inverso para posterior de ombro", muscleGroup: "ombro", personalId: null },
      // Biceps
      { name: "Rosca Direta", description: "Rosca direta com barra para biceps", muscleGroup: "biceps", personalId: null },
      { name: "Rosca Alternada", description: "Rosca alternada com halteres", muscleGroup: "biceps", personalId: null },
      { name: "Rosca Martelo", description: "Rosca martelo com halteres", muscleGroup: "biceps", personalId: null },
      { name: "Rosca Scott", description: "Rosca no banco Scott", muscleGroup: "biceps", personalId: null },
      { name: "Rosca Concentrada", description: "Rosca concentrada unilateral", muscleGroup: "biceps", personalId: null },
      // Triceps
      { name: "Triceps Testa", description: "Triceps na barra W ou reta", muscleGroup: "triceps", personalId: null },
      { name: "Triceps Corda", description: "Triceps na polia com corda", muscleGroup: "triceps", personalId: null },
      { name: "Triceps Frances", description: "Triceps frances com halteres ou barra", muscleGroup: "triceps", personalId: null },
      { name: "Mergulho Banco", description: "Mergulho em banco para triceps", muscleGroup: "triceps", personalId: null },
      { name: "Supino Fechado", description: "Supino fechado para triceps", muscleGroup: "triceps", personalId: null },
      // Perna
      { name: "Agachamento Livre", description: "Agachamento com barra", muscleGroup: "perna", personalId: null },
      { name: "Leg Press", description: "Leg press horizontal ou inclinado", muscleGroup: "perna", personalId: null },
      { name: "Cadeira Extensora", description: "Extensao de pernas na maquina", muscleGroup: "perna", personalId: null },
      { name: "Cadeira Flexora", description: "Flexao de pernas na maquina", muscleGroup: "perna", personalId: null },
      { name: "Passada", description: "Avanco ou passada com halteres", muscleGroup: "perna", personalId: null },
      { name: "Stiff", description: "Stiff com barra ou halteres para posteriores", muscleGroup: "perna", personalId: null },
      { name: "Levantamento Terra Romeno", description: "Focado nos posteriores e gluteos", muscleGroup: "perna", personalId: null },
      { name: "Panturrilha em Pe", description: "Elevacao de panturrilha em pe", muscleGroup: "perna", personalId: null },
      { name: "Panturrilha Sentado", description: "Elevacao de panturrilha sentado", muscleGroup: "perna", personalId: null },
      // Gluteo
      { name: "Gluteo 4 Apoios", description: "Gluteo 4 apoios com caneleira", muscleGroup: "gluteo", personalId: null },
      { name: "Hip Thrust", description: "Elevacao de quadril com barra", muscleGroup: "gluteo", personalId: null },
      { name: "Abducao Quadril", description: "Abducao de quadril na maquina", muscleGroup: "gluteo", personalId: null },
      { name: "Avanco Gluteo", description: "Passada focando gluteos", muscleGroup: "gluteo", personalId: null },
      { name: "Agachamento Sumo", description: "Agachamento sumo com barra ou halteres", muscleGroup: "gluteo", personalId: null },
      { name: "Cadeira Abdutora", description: "Abducao de quadril na maquina", muscleGroup: "gluteo", personalId: null },
      { name: "Cadeira Adutora", description: "Aducao de quadril na maquina", muscleGroup: "gluteo", personalId: null },
      // Core
      { name: "Prancha", description: "Exercicio isometrico de core", muscleGroup: "core", personalId: null },
      { name: "Abdominal Supra", description: "Abdominal tradicional", muscleGroup: "core", personalId: null },
      { name: "Abdominal Infra", description: "Abdominal inferior", muscleGroup: "core", personalId: null },
      { name: "Bicicleta", description: "Abdominal obliquo em movimento", muscleGroup: "core", personalId: null },
      { name: "Russian Twist", description: "Torcao de tronco sentado", muscleGroup: "core", personalId: null },
    ]);

    console.log("Seed data inserted successfully!");
    console.log("\n--- Seed Credentials ---");
    console.log("Admin:    admin@example.com / testPassword");
    console.log("Personal: personal@example.com / testPassword");
    console.log("Student:  joao.silva@example.com / studentPassword");
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
  const shouldClean = args.includes("--clean") || args.includes("-c");
  const onlyClean = args.includes("--only-clean");

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
