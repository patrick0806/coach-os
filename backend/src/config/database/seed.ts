import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { hash } from "bcrypt";
import { sql } from "drizzle-orm";

import { getDatabaseConfig } from "@config/database/database.config";

import {
  CreatePlan,
  plans,
  users,
  personals,
  students,
  exercises,
} from "./schema";
import { ApplicationRoles } from "@shared/enums";

async function cleanDatabase() {
  console.log("Starting database cleanup...");

  const pool = new Pool(getDatabaseConfig());
  const db = drizzle(pool);

  try {
    // Limpa as tabelas na ordem correta (respeitando foreign keys)
    console.log("Deleting all students...");
    await db.delete(students);

    console.log("Deleting all personals...");
    await db.delete(personals);

    console.log("Deleting all plans...");
    await db.delete(plans);

    console.log("Deleting all users...");
    await db.delete(users);

    // Reseta as sequences (auto-increment) para começar do 1 novamente
    console.log("Resetting sequences...");
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
    const seedUsers = [
      {
        email: "admin@example.com",
        password: await hash("testPassword", 10),
        name: "Admin User",
        role: ApplicationRoles.ADMIN,
        isActive: true,
      },
      {
        email: "personal@example.com",
        password: await hash("testPassword", 10),
        name: "Personal User",
        role: ApplicationRoles.PERSONAL,
        isActive: true,
      },
    ];

    const seedPlans: CreatePlan[] = [
      {
        name: "Basico",
        description: "O plano perfeito para quem está começando",
        benefits: [
          "Até 3 alunos",
          "Agenda personalizada",
          "Planilhas de treinos",
        ].toString(),
        price: (19.9).toString(),
        order: 0,
        highlighted: false,
        isActive: true,
      },
      {
        name: "Pró",
        description: "O plano perfeito para quem está voando",
        benefits: [
          "Até 10 alunos",
          "Agenda personalizada",
          "Planilhas de treinos",
        ].toString(),
        price: (29.9).toString(),
        order: 1,
        highlighted: true,
        isActive: true,
      },
      {
        name: "Empresarial",
        description: "Plano customizado para grandes projetos",
        benefits: [
          "Alunos ilimitados",
          "Agenda personalizada",
          "Planilhas de treinos",
        ].toString(),
        price: (49.9).toString(),
        order: 2,
        highlighted: false,
        isActive: true,
      },
    ];

    const exercisesSeed = [
      {
        name: "Supino Reto",
        description: "Supino reto com barra para desenvolvimento do peitoral",
        muscleGroup: "peito",
        personalId: null,
      },
      {
        name: "Supino Inclinado",
        description: "Supino inclinado com barra ou halteres",
        muscleGroup: "peito",
        personalId: null,
      },
      {
        name: "Supino Declinado",
        description: "Supino declinado para parte inferior do peitoral",
        muscleGroup: "peito",
        personalId: null,
      },
      {
        name: "Crucifixo Reto",
        description: "Crucifixo reto com halteres",
        muscleGroup: "peito",
        personalId: null,
      },
      {
        name: "Crucifixo Inclinado",
        description: "Crucifixo inclinado para peitoral superior",
        muscleGroup: "peito",
        personalId: null,
      },
      {
        name: "Puxada Frontal",
        description: "Puxada na barra ou polia para dorsais",
        muscleGroup: "costas",
        personalId: null,
      },
      {
        name: "Remada Curvada",
        description: "Remada curvada com barra",
        muscleGroup: "costas",
        personalId: null,
      },
      {
        name: "Remada Unilateral",
        description: "Remada unilateral com haltere",
        muscleGroup: "costas",
        personalId: null,
      },
      {
        name: "Levantamento Terra",
        description: "Levantamento terra tradicional",
        muscleGroup: "costas",
        personalId: null,
      },
      {
        name: "Pullover",
        description: "Pullover com halteres para dorsais e peitoral",
        muscleGroup: "costas",
        personalId: null,
      },
      {
        name: "Desenvolvimento Militar",
        description: "Desenvolvimento de ombros com barra",
        muscleGroup: "ombro",
        personalId: null,
      },
      {
        name: "Elevação Lateral",
        description: "Elevação lateral com halteres",
        muscleGroup: "ombro",
        personalId: null,
      },
      {
        name: "Elevação Frontal",
        description: "Elevação frontal com halteres ou barra",
        muscleGroup: "ombro",
        personalId: null,
      },
      {
        name: "Arnold Press",
        description: "Desenvolvimento de ombro estilo Arnold",
        muscleGroup: "ombro",
        personalId: null,
      },
      {
        name: "Remada Alta",
        description: "Remada alta com barra ou polia",
        muscleGroup: "ombro",
        personalId: null,
      },
      {
        name: "Rosca Direta",
        description: "Rosca direta com barra para bíceps",
        muscleGroup: "biceps",
        personalId: null,
      },
      {
        name: "Rosca Alternada",
        description: "Rosca alternada com halteres",
        muscleGroup: "biceps",
        personalId: null,
      },
      {
        name: "Rosca Martelo",
        description: "Rosca martelo com halteres",
        muscleGroup: "biceps",
        personalId: null,
      },
      {
        name: "Rosca Scott",
        description: "Rosca no banco Scott",
        muscleGroup: "biceps",
        personalId: null,
      },
      {
        name: "Rosca Concentrada",
        description: "Rosca concentrada unilateral",
        muscleGroup: "biceps",
        personalId: null,
      },
      {
        name: "Tríceps Testa",
        description: "Tríceps na barra W ou reta",
        muscleGroup: "triceps",
        personalId: null,
      },
      {
        name: "Tríceps Corda",
        description: "Tríceps na polia com corda",
        muscleGroup: "triceps",
        personalId: null,
      },
      {
        name: "Tríceps Francês",
        description: "Tríceps francês com halteres ou barra",
        muscleGroup: "triceps",
        personalId: null,
      },
      {
        name: "Mergulho Banco",
        description: "Mergulho em banco para tríceps",
        muscleGroup: "triceps",
        personalId: null,
      },
      {
        name: "Supino Fechado",
        description: "Supino fechado para tríceps",
        muscleGroup: "triceps",
        personalId: null,
      },
      {
        name: "Agachamento Livre",
        description: "Agachamento com barra",
        muscleGroup: "perna",
        personalId: null,
      },
      {
        name: "Leg Press",
        description: "Leg press horizontal ou inclinado",
        muscleGroup: "perna",
        personalId: null,
      },
      {
        name: "Cadeira Extensora",
        description: "Extensão de pernas na máquina",
        muscleGroup: "perna",
        personalId: null,
      },
      {
        name: "Cadeira Flexora",
        description: "Flexão de pernas na máquina",
        muscleGroup: "perna",
        personalId: null,
      },
      {
        name: "Passada",
        description: "Avanço ou passada com halteres",
        muscleGroup: "perna",
        personalId: null,
      },
      {
        name: "Stiff",
        description: "Stiff com barra ou halteres para posteriores",
        muscleGroup: "perna",
        personalId: null,
      },
      {
        name: "Levantamento Terra Romeno",
        description: "Focado nos posteriores e glúteos",
        muscleGroup: "perna",
        personalId: null,
      },
      {
        name: "Panturrilha em Pé",
        description: "Elevação de panturrilha em pé",
        muscleGroup: "perna",
        personalId: null,
      },
      {
        name: "Panturrilha Sentado",
        description: "Elevação de panturrilha sentado",
        muscleGroup: "perna",
        personalId: null,
      },
      {
        name: "Glúteo 4 Apoios",
        description: "Glúteo 4 apoios com caneleira",
        muscleGroup: "gluteo",
        personalId: null,
      },
      {
        name: "Hip Thrust",
        description: "Elevação de quadril com barra",
        muscleGroup: "gluteo",
        personalId: null,
      },
      {
        name: "Abdução Quadril",
        description: "Abdução de quadril na máquina",
        muscleGroup: "gluteo",
        personalId: null,
      },
      {
        name: "Avanço Glúteo",
        description: "Passada focando glúteos",
        muscleGroup: "gluteo",
        personalId: null,
      },
      {
        name: "Agachamento Sumô",
        description: "Agachamento sumô com barra ou halteres",
        muscleGroup: "gluteo",
        personalId: null,
      },
      {
        name: "Prancha",
        description: "Exercício isométrico de core",
        muscleGroup: "core",
        personalId: null,
      },
      {
        name: "Abdominal Supra",
        description: "Abdominal tradicional",
        muscleGroup: "core",
        personalId: null,
      },
      {
        name: "Abdominal Infra",
        description: "Abdominal inferior",
        muscleGroup: "core",
        personalId: null,
      },
      {
        name: "Bicicleta",
        description: "Abdominal oblíquo em movimento",
        muscleGroup: "core",
        personalId: null,
      },
      {
        name: "Russian Twist",
        description: "Torção de tronco sentado",
        muscleGroup: "core",
        personalId: null,
      },
      {
        name: "Barra Fixa",
        description: "Barra fixa para costas e bíceps",
        muscleGroup: "costas",
        personalId: null,
      },
      {
        name: "Puxada Neutra",
        description: "Puxada na polia com pegada neutra",
        muscleGroup: "costas",
        personalId: null,
      },
      {
        name: "Face Pull",
        description: "Face pull na polia alta",
        muscleGroup: "ombro",
        personalId: null,
      },
      {
        name: "Crucifixo Inverso",
        description: "Crucifixo inverso para posterior de ombro",
        muscleGroup: "ombro",
        personalId: null,
      },
      {
        name: "Cadeira Abdutora",
        description: "Abdução de quadril na máquina",
        muscleGroup: "gluteo",
        personalId: null,
      },
      {
        name: "Cadeira Adutora",
        description: "Adução de quadril na máquina",
        muscleGroup: "gluteo",
        personalId: null,
      },
    ];
    console.log("Inserting users...");
    const insertedUsers = await db.insert(users).values(seedUsers).returning();

    console.log("Inserting plans...");
    await db.insert(plans).values(seedPlans);

    // Buscar o usuário personal que foi criado
    const personalUser = insertedUsers.find(
      (u) => u.role === ApplicationRoles.PERSONAL
    );

    if (personalUser) {
      console.log("Inserting personal profile...");
      const personalData: any = {
        userId: personalUser.id,
        slug: "personal-trainer",
        bio: "Personal trainer certificado com mais de 10 anos de experiência em treinamento funcional e musculação.",
        profilePhoto: "https://i.pravatar.cc/300?img=12",
        themeColor: "#10b981",
        phoneNumber: "+5511999887766",
        lpTitle: "Transforme seu corpo, transforme sua vida!",
        lpSubtitle:
          "Treinos personalizados e acompanhamento profissional para você alcançar seus objetivos.",
        lpHeroImage:
          "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200",
        lpAboutTitle: "Sobre Mim",
        lpAboutText:
          "Sou formado em Educação Física e especializado em treinamento funcional. Minha missão é ajudar você a conquistar seus objetivos de forma saudável e sustentável.",
        lpImage1:
          "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800",
        lpImage2:
          "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800",
        lpImage3:
          "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800",
      };

      const [insertedPersonal] = await db
        .insert(personals)
        .values(personalData)
        .returning();

      console.log("Inserting student for personal...");
      const studentData: any = {
        name: "João Silva",
        email: "joao.silva@example.com",
        password: await hash("studentPassword", 10),
        personalId: insertedPersonal.id,
        isActive: true,
      };

      await db.insert(students).values(studentData);

      console.log("Personal profile and student created successfully!");
    }

    await db.insert(exercises).values(exercisesSeed);

    console.log("Seed data inserted successfully!");
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
      console.log("\n");
    }

    await seed();
    console.log("\nSeed completed!");
  } catch (error) {
    console.error("\nOperation failed:", error);
    process.exit(1);
  }
}

main();
