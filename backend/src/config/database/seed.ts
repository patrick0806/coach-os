import "dotenv/config";
import { randomUUID } from "crypto";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { getDatabaseConfig } from "./database.config";
import { plans, exercises } from "./schema";

async function seed() {
  console.log("Seeding database...");

  const pool = new Pool(getDatabaseConfig());
  const db = drizzle(pool);

  try {
    // Seed plans
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

    // Seed global exercises (tenantId = null means global)
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
