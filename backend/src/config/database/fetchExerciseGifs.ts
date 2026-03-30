/**
 * Script to fetch exercise GIFs from ExerciseDB API, upload to S3,
 * and rewrite seed-exercises.sql with media_url already populated.
 *
 * Usage:
 *   cd backend && npx tsx src/config/database/fetchExerciseGifs.ts
 *
 * Optional env vars:
 *   RAPIDAPI_KEY=your_key  — RapidAPI key (free tier works)
 *   DRY_RUN=true           — only show matches, don't upload or rewrite SQL
 *   SKIP_S3=true           — write ExerciseDB GIF URLs directly (no S3 upload)
 *   SIMILARITY_THRESHOLD   — minimum similarity score (0-1), default 0.3
 *
 * Requirements:
 *   - Backend .env loaded (AWS_* vars)
 *   - seed-exercises.sql in same directory
 *   - RapidAPI key with ExerciseDB subscription (if open-source API is down)
 *   - AWS S3 credentials in .env (unless SKIP_S3=true)
 */

import "dotenv/config";
import * as fs from "fs";
import * as path from "path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// -- Config -------------------------------------------------------------------

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const DRY_RUN = process.env.DRY_RUN === "true";
const SKIP_S3 = process.env.SKIP_S3 === "true";
const REVIEW_HTML = process.env.REVIEW_HTML === "true";
const SIMILARITY_THRESHOLD = Number(process.env.SIMILARITY_THRESHOLD) || 0.3;

const EXERCISEDB_BASE = "https://exercisedb-api.vercel.app/api/v1";

const S3_BUCKET = process.env.AWS_S3_BUCKET || "";
const S3_REGION = process.env.AWS_REGION || "us-east-1";

const SQL_FILE = path.join(__dirname, "seed-exercises.sql");

// -- Types --------------------------------------------------------------------

interface ExerciseDBEntry {
  exerciseId: string;
  name: string;
  gifUrl: string;
  bodyPart: string;
  target: string;
  equipment: string;
}

interface ParsedExercise {
  name: string;
  description: string;
  muscleGroup: string;
  instructions: string;
  // Will be populated by the script
  mediaUrl: string | null;
  // For SQL reconstruction
  comment?: string;
}

// -- Similarity (Levenshtein-based) -------------------------------------------

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    Array(n + 1).fill(0),
  );

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }

  return dp[m][n];
}

function similarity(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - levenshtein(a, b) / maxLen;
}

// -- Exercise name translation map (PT-BR → EN) ------------------------------

const translationHints: Record<string, string[]> = {
  // PEITORAL
  "supino reto com barra": ["barbell bench press", "bench press"],
  "supino inclinado com barra": ["incline barbell bench press"],
  "supino declinado com barra": ["decline barbell bench press"],
  "supino reto com halteres": ["dumbbell bench press"],
  "supino inclinado com halteres": ["incline dumbbell bench press"],
  "supino declinado com halteres": ["decline dumbbell bench press"],
  "crucifixo com halteres": ["dumbbell fly", "dumbbell flyes"],
  "crucifixo inclinado com halteres": ["incline dumbbell fly"],
  "flexao de braco": ["push up", "push-up"],
  "cross over no cabo": ["cable crossover", "cable fly"],
  "supino na maquina chest press": ["chest press machine", "machine chest press"],
  "pullover com halter": ["dumbbell pullover"],
  "cross over baixo low cable fly": ["low cable fly", "low cable crossover"],
  "supino reto no smith": ["smith machine bench press"],
  "crucifixo no cabo cable fly": ["cable fly"],
  // COSTAS
  "puxada na barra fixa pullup": ["pull up", "pull-up"],
  "puxada na barra fixa supinada chinup": ["chin up", "chin-up"],
  "puxada no pulley frontal": ["lat pulldown", "cable lat pulldown"],
  "puxada no pulley triangulo": ["close grip lat pulldown", "v-bar pulldown"],
  "remada curvada com barra": ["barbell bent over row", "barbell row"],
  "remada curvada com barra supinada": ["reverse grip barbell row"],
  "remada unilateral com halter": ["dumbbell row", "one arm dumbbell row"],
  "remada cavalinho tbar row": ["t-bar row", "lever t-bar row"],
  "remada sentado no cabo seated row": ["seated cable row", "cable seated row"],
  "remada na maquina": ["machine row", "lever seated row"],
  "remada pendlay": ["pendlay row"],
  "pullover no cabo": ["cable pullover", "straight arm pulldown"],
  "levantamento terra": ["deadlift", "barbell deadlift"],
  "good morning": ["good morning"],
  "hiperextensao back extension": ["back extension", "hyperextension"],
  // OMBROS
  "desenvolvimento com halteres": ["dumbbell shoulder press"],
  "desenvolvimento com barra": ["barbell shoulder press", "overhead press"],
  "desenvolvimento arnold": ["arnold press"],
  "desenvolvimento na maquina shoulder press": ["machine shoulder press"],
  "desenvolvimento no smith": ["smith machine shoulder press"],
  "elevacao lateral com halteres": ["dumbbell lateral raise"],
  "elevacao lateral no cabo": ["cable lateral raise"],
  "elevacao frontal com halteres": ["dumbbell front raise"],
  "elevacao frontal com barra": ["barbell front raise"],
  "crucifixo inverso com halteres": ["reverse fly", "dumbbell reverse fly"],
  "face pull no cabo": ["face pull", "cable face pull"],
  "remada alta com halteres": ["dumbbell upright row"],
  // BÍCEPS
  "rosca direta com barra": ["barbell curl"],
  "rosca direta com barra w": ["ez barbell curl", "ez bar curl"],
  "rosca alternada com halteres": ["alternate dumbbell curl", "dumbbell curl"],
  "rosca simultanea com halteres": ["dumbbell curl"],
  "rosca martelo": ["hammer curl", "dumbbell hammer curl"],
  "rosca concentrada": ["concentration curl"],
  "rosca scott com barra w": ["preacher curl", "ez bar preacher curl"],
  "rosca scott com halter": ["dumbbell preacher curl"],
  "rosca no cabo pulley": ["cable curl", "cable bicep curl"],
  "rosca martelo no cabo rope curl": ["cable rope curl", "rope hammer curl"],
  "rosca inclinada com halteres": ["incline dumbbell curl"],
  "rosca 21": ["21s curl", "barbell 21 curl"],
  "rosca inversa com barra": ["reverse barbell curl"],
  // TRÍCEPS
  "triceps pulley com barra": ["triceps pushdown", "cable pushdown"],
  "triceps pulley com corda": ["triceps rope pushdown", "cable rope pushdown"],
  "triceps pulley inverso": ["reverse grip pushdown"],
  "triceps testa com barra w": ["skull crusher", "lying triceps extension"],
  "triceps frances com halter": ["overhead triceps extension", "dumbbell overhead extension"],
  "triceps coice kickback": ["triceps kickback", "dumbbell kickback"],
  "mergulho no banco": ["bench dip", "triceps dip bench"],
  "mergulho nas paralelas": ["parallel bar dip", "chest dip", "tricep dip"],
  "triceps no cross over overhead": ["cable overhead extension"],
  "supino fechado com barra": ["close grip bench press"],
  "triceps na maquina": ["machine triceps extension"],
  "triceps testa no cabo": ["cable lying triceps extension"],
  // PERNAS
  "agachamento livre com barra": ["barbell squat", "barbell full squat"],
  "agachamento frontal": ["front squat", "barbell front squat"],
  "agachamento goblet": ["goblet squat", "dumbbell goblet squat"],
  "agachamento no smith": ["smith machine squat"],
  "agachamento bulgaro": ["bulgarian split squat"],
  "agachamento sumo": ["sumo squat", "barbell sumo squat"],
  "leg press 45": ["leg press", "sled 45 leg press"],
  "hack squat": ["hack squat", "sled hack squat"],
  "cadeira extensora": ["leg extension", "lever leg extension"],
  "mesa flexora": ["leg curl", "lying leg curl"],
  "cadeira flexora": ["seated leg curl"],
  "stiff com barra": ["stiff leg deadlift", "barbell stiff leg deadlift"],
  "stiff com halteres": ["dumbbell stiff leg deadlift"],
  "avanco passada com halteres": ["dumbbell lunge", "dumbbell walking lunge"],
  "avanco passada com barra": ["barbell lunge"],
  "levantamento terra sumo": ["sumo deadlift"],
  "levantamento terra romeno": ["romanian deadlift"],
  "step up com halteres": ["dumbbell step up"],
  // GLÚTEOS
  "hip thrust com barra": ["barbell hip thrust", "hip thrust"],
  "elevacao pelvica glute bridge": ["glute bridge", "barbell glute bridge"],
  "elevacao pelvica unilateral": ["single leg glute bridge"],
  "abducao de quadril no cabo": ["cable hip abduction"],
  "extensao de quadril no cabo": ["cable hip extension", "cable kickback"],
  "agachamento sumo com halter": ["dumbbell sumo squat"],
  // ABDÔMEN
  "prancha frontal": ["plank", "front plank"],
  "abdominal crunch": ["crunch", "floor crunch"],
  "abdominal infra elevacao de pernas": ["lying leg raise", "leg raise"],
  "abdominal bicicleta": ["bicycle crunch"],
  "abdominal obliquo": ["oblique crunch"],
  "elevacao de pernas na barra fixa": ["hanging leg raise"],
  "elevacao de joelhos na barra fixa": ["hanging knee raise"],
  "russian twist": ["russian twist"],
  "mountain climber": ["mountain climber"],
  // PANTURRILHA
  "panturrilha em pe na maquina": ["standing calf raise", "machine calf raise"],
  "panturrilha sentado na maquina": ["seated calf raise"],
  "panturrilha no leg press": ["leg press calf raise"],
  "panturrilha com halter": ["dumbbell calf raise"],
  "panturrilha unilateral": ["single leg calf raise"],
  "panturrilha no donkey calf raise": ["donkey calf raise"],
  // ANTEBRAÇO
  "rosca de punho com barra": ["barbell wrist curl", "wrist curl"],
  "rosca de punho inversa com barra": ["barbell reverse wrist curl"],
  "rosca de punho com halter": ["dumbbell wrist curl"],
  "farmer walk caminhada do fazendeiro": ["farmer walk", "farmers walk"],
  // TRAPÉZIO
  "encolhimento com halteres": ["dumbbell shrug"],
  "encolhimento com barra": ["barbell shrug"],
  "encolhimento no smith": ["smith machine shrug"],
  "remada alta com barra trapezio": ["barbell upright row"],
  "remada alta com halteres trapezio": ["dumbbell upright row"],
  // FUNCIONAL
  "burpee": ["burpee"],
  "kettlebell swing": ["kettlebell swing"],
  "clean and press com barra": ["clean and press", "barbell clean and press"],
  "thruster com barra": ["barbell thruster", "thruster"],
  "bear crawl": ["bear crawl"],
  "medicine ball slam": ["medicine ball slam", "ball slam"],
  "pulo com agachamento jump squat": ["jump squat"],
  "inchworm": ["inchworm"],
};

// -- Direct ExerciseDB ID overrides -------------------------------------------
// For exercises where fuzzy matching picks the wrong variation.
// Keys: normalized PT-BR names (same format as translationHints keys).
// Values: ExerciseDB exerciseId strings.
// To find correct IDs: run with DRY_RUN=true and check the [id: ...] column.

const exerciseIdOverrides: Record<string, string> = {
  // Populate after a DRY_RUN verification pass, e.g.:
  // "supino inclinado com barra": "0025",
  // "supino declinado com barra": "0033",
};

// -- Qualifier words for scoring penalties ------------------------------------

const QUALIFIER_WORDS = [
  "incline", "decline", "seated", "standing", "reverse",
  "close grip", "wide grip", "single", "overhead", "front",
  "behind", "prone", "supine", "one arm", "alternate",
];

// -- Normalize for comparison -------------------------------------------------

function normalize(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .trim();
}

// -- Find best match ----------------------------------------------------------

function scoreExercise(
  normalizedName: string,
  hints: string[],
  apiEx: ExerciseDBEntry,
): number {
  const apiName = normalize(apiEx.name);

  // If we have English translation hints, use them as PRIMARY search (EN vs EN)
  if (hints.length > 0) {
    let bestHintScore = 0;

    for (const hint of hints) {
      const normalizedHint = normalize(hint);

      // Direct string similarity (EN hint vs EN API name)
      const directScore = similarity(normalizedHint, apiName);

      // Bidirectional word matching — penalizes extra words in API name
      const hintWords = normalizedHint.split(/\s+/);
      const apiWords = apiName.split(/\s+/);
      const hintMatched = hintWords.filter((w) =>
        apiWords.some((aw) => similarity(w, aw) > 0.85),
      ).length;
      const apiMatched = apiWords.filter((aw) =>
        hintWords.some((w) => similarity(w, aw) > 0.85),
      ).length;
      // Harmonic mean of precision and recall (F1 score)
      const precision = hintMatched / Math.max(hintWords.length, 1);
      const recall = apiMatched / Math.max(apiWords.length, 1);
      const wordScore =
        precision + recall > 0
          ? (2 * precision * recall) / (precision + recall)
          : 0;

      let hintScore = Math.max(directScore, wordScore);

      // Penalize missing/extra qualifier words (incline vs flat, seated vs standing, etc.)
      for (const q of QUALIFIER_WORDS) {
        const hintHas = normalizedHint.includes(q);
        const apiHas = apiName.includes(q);
        if (hintHas && !apiHas) hintScore -= 0.25;
        if (!hintHas && apiHas) hintScore -= 0.15;
      }

      bestHintScore = Math.max(bestHintScore, hintScore);
    }

    return Math.max(0, Math.min(1, bestHintScore));
  }

  // Fallback: no hints, compare PT-BR name vs EN API name directly
  return similarity(normalizedName, apiName);
}

function findBestMatch(
  exerciseName: string,
  apiExercises: ExerciseDBEntry[],
): { match: ExerciseDBEntry | null; score: number; overridden: boolean } {
  const normalizedName = normalize(exerciseName);

  // 1. Check for a direct ID override
  const overrideId = exerciseIdOverrides[normalizedName];
  if (overrideId) {
    const exactMatch = apiExercises.find((ex) => ex.exerciseId === overrideId);
    if (exactMatch) {
      return { match: exactMatch, score: 1.0, overridden: true };
    }
    console.warn(
      `⚠️ Override ID "${overrideId}" for "${exerciseName}" not found in API data. Falling back to fuzzy match.`,
    );
  }

  // 2. Fuzzy matching with qualifier penalties
  const hints = translationHints[normalizedName] || [];
  let bestMatch: ExerciseDBEntry | null = null;
  let bestScore = 0;

  for (const apiEx of apiExercises) {
    const score = scoreExercise(normalizedName, hints, apiEx);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = apiEx;
    }
  }

  return { match: bestMatch, score: bestScore, overridden: false };
}

function getTopCandidates(
  exerciseName: string,
  apiExercises: ExerciseDBEntry[],
  count: number,
): Array<{ match: ExerciseDBEntry; score: number }> {
  const normalizedName = normalize(exerciseName);
  const hints = translationHints[normalizedName] || [];

  const scored = apiExercises.map((apiEx) => ({
    match: apiEx,
    score: scoreExercise(normalizedName, hints, apiEx),
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, count);
}

// -- Parse exercises from SQL file --------------------------------------------

interface SqlExercise {
  name: string;
  description: string;
  muscleGroup: string;
  instructions: string;
}

function parseSqlFile(content: string): { exercises: SqlExercise[]; sections: string[] } {
  const exercises: SqlExercise[] = [];
  const sections: string[] = [];

  // Match each INSERT value tuple (with or without existing media_url)
  const tupleRegex = /\(gen_random_uuid\(\),\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*(?:NULL|'[^']*'),\s*NULL,\s*NOW\(\),\s*NOW\(\)\)/g;

  let match;
  while ((match = tupleRegex.exec(content)) !== null) {
    exercises.push({
      name: match[1],
      description: match[2],
      muscleGroup: match[3],
      instructions: match[4],
    });
  }

  // Extract section comments
  const sectionRegex = /-- =+\n-- (.+)\n-- =+/g;
  let sMatch;
  while ((sMatch = sectionRegex.exec(content)) !== null) {
    sections.push(sMatch[1]);
  }

  return { exercises, sections };
}

// -- Rebuild SQL file with media_url ------------------------------------------

function buildSql(
  exercisesWithMedia: Array<SqlExercise & { mediaUrl: string | null }>,
): string {
  const lines: string[] = [];

  lines.push("-- Coach OS — 200 Global Exercises Seed (production)");
  lines.push("-- Run manually: psql -d <database> -f seed-exercises.sql");
  lines.push("-- All exercises are global (tenant_id IS NULL)");
  lines.push("-- muscleGroup values match MuscleGroup enum");
  lines.push("-- media_url populated from ExerciseDB API GIFs via S3");
  lines.push("");
  lines.push(
    "INSERT INTO exercises (id, name, description, muscle_group, instructions, media_url, tenant_id, created_at, updated_at) VALUES",
  );
  lines.push("");

  // Group by muscleGroup for readability
  const groups: Record<string, Array<SqlExercise & { mediaUrl: string | null }>> = {};
  for (const ex of exercisesWithMedia) {
    if (!groups[ex.muscleGroup]) groups[ex.muscleGroup] = [];
    groups[ex.muscleGroup].push(ex);
  }

  const groupOrder = [
    "peitoral",
    "costas",
    "ombros",
    "bíceps",
    "tríceps",
    "pernas",
    "glúteos",
    "abdômen",
    "panturrilha",
    "antebraço",
    "trapézio",
    "funcional",
  ];

  const groupLabels: Record<string, string> = {
    peitoral: "PEITORAL",
    costas: "COSTAS",
    ombros: "OMBROS",
    "bíceps": "BÍCEPS",
    "tríceps": "TRÍCEPS",
    pernas: "PERNAS",
    "glúteos": "GLÚTEOS",
    "abdômen": "ABDÔMEN",
    panturrilha: "PANTURRILHA",
    "antebraço": "ANTEBRAÇO",
    "trapézio": "TRAPÉZIO",
    funcional: "FUNCIONAL",
  };

  const allEntries: string[] = [];

  for (const group of groupOrder) {
    const items = groups[group];
    if (!items || items.length === 0) continue;

    const label = groupLabels[group] || group.toUpperCase();
    allEntries.push(`\n-- ============================================================`);
    allEntries.push(`-- ${label} (${items.length} exercises)`);
    allEntries.push(`-- ============================================================`);

    for (const ex of items) {
      const escapedName = ex.name.replace(/'/g, "''");
      const escapedDesc = ex.description.replace(/'/g, "''");
      const escapedInstr = ex.instructions.replace(/'/g, "''");
      const mediaValue = ex.mediaUrl ? `'${ex.mediaUrl}'` : "NULL";

      allEntries.push(
        `(gen_random_uuid(), '${escapedName}', '${escapedDesc}', '${ex.muscleGroup}', '${escapedInstr}', ${mediaValue}, NULL, NOW(), NOW())`,
      );
    }
  }

  // Join with commas between entries, semicolon at the end
  const valueLines = allEntries
    .map((line, i) => {
      if (line.startsWith("--") || line.startsWith("\n--")) return line;
      // Find next non-comment line
      const isLast =
        allEntries.slice(i + 1).every((l) => l.startsWith("--") || l.startsWith("\n--"));
      return isLast ? line + ";" : line + ",";
    })
    .join("\n");

  lines.push(valueLines);

  return lines.join("\n") + "\n";
}

// -- Fetch all exercises from ExerciseDB API ----------------------------------

async function fetchExerciseDBExercises(): Promise<ExerciseDBEntry[]> {
  console.log("Fetching exercises from ExerciseDB API...\n");

  const allExercises: ExerciseDBEntry[] = [];
  let offset = 0;
  const limit = 100;

  // Try open-source v1 API first (no key needed)
  try {
    console.log("Trying open-source ExerciseDB API (v1)...");

    while (true) {
      const res = await fetch(
        `${EXERCISEDB_BASE}/exercises?limit=${limit}&offset=${offset}`,
      );

      if (res.status === 429) {
        console.log("  Rate limited, waiting 15s...");
        await sleep(15000);
        continue;
      }
      if (!res.ok) break;

      const data = await res.json();
      const items = data.data?.exercises || data.data || data || [];
      if (!Array.isArray(items) || items.length === 0) break;

      allExercises.push(...items);
      offset += limit;
      console.log(`  Fetched ${allExercises.length} exercises so far...`);

      if (items.length < limit) break;
      await sleep(500);
    }

    if (allExercises.length > 0) {
      console.log(
        `\nFetched ${allExercises.length} exercises from open-source API\n`,
      );
      return allExercises;
    }
  } catch (err) {
    console.log(`Open-source API error: ${(err as Error).message}\nTrying RapidAPI...\n`);
  }

  // Fallback to RapidAPI
  if (!RAPIDAPI_KEY) {
    throw new Error(
      "RAPIDAPI_KEY is required. Get a free key at https://rapidapi.com/justin-WFnsXH_t6/api/exercisedb",
    );
  }

  const headers = {
    "X-RapidAPI-Key": RAPIDAPI_KEY,
    "X-RapidAPI-Host": "exercisedb.p.rapidapi.com",
  };

  while (true) {
    const res = await fetch(
      `https://exercisedb.p.rapidapi.com/exercises?limit=${limit}&offset=${offset}`,
      { headers },
    );

    if (!res.ok) {
      if (res.status === 429) {
        console.log("Rate limited, waiting 60s...");
        await sleep(60000);
        continue;
      }
      throw new Error(`API error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) break;

    allExercises.push(...data);
    offset += limit;
    console.log(`  Fetched ${allExercises.length} exercises so far...`);

    if (data.length < limit) break;
    await sleep(500);
  }

  console.log(`\nFetched ${allExercises.length} total exercises from RapidAPI\n`);
  return allExercises;
}

// -- S3 upload ----------------------------------------------------------------

function getS3Client(): S3Client {
  return new S3Client({
    region: S3_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    },
  });
}

async function uploadGifToS3(
  s3: S3Client,
  gifBuffer: Buffer,
  exerciseName: string,
): Promise<string> {
  // Create a stable key from the exercise name
  const slug = exerciseName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const key = `exercises/global/${slug}.gif`;

  await s3.send(
    new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: gifBuffer,
      ContentType: "image/gif",
    }),
  );

  return `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${key}`;
}

async function downloadGif(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download GIF: ${res.status}`);
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// -- Utils --------------------------------------------------------------------

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// -- Review HTML generation ---------------------------------------------------

interface ReviewEntry {
  name: string;
  muscleGroup: string;
  currentMatch: { name: string; id: string; gifUrl: string; score: number } | null;
  overridden: boolean;
  candidates: Array<{ name: string; id: string; gifUrl: string; score: number }>;
}

const REVIEW_HTML_FILE = path.join(__dirname, "review-exercises.html");
const OVERRIDES_JSON_FILE = path.join(__dirname, "exerciseIdOverrides.json");

function generateReviewHtml(entries: ReviewEntry[]): void {
  const groups: Record<string, ReviewEntry[]> = {};
  for (const e of entries) {
    if (!groups[e.muscleGroup]) groups[e.muscleGroup] = [];
    groups[e.muscleGroup].push(e);
  }

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Coach OS — Exercise GIF Review</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: system-ui, sans-serif; background: #0f1117; color: #e1e1e6; padding: 20px; }
  h1 { text-align: center; margin-bottom: 8px; color: #fff; }
  .subtitle { text-align: center; color: #888; margin-bottom: 24px; }
  .stats { text-align: center; margin-bottom: 24px; color: #aaa; font-size: 14px; }
  .stats span { margin: 0 12px; }
  .group-title { font-size: 20px; font-weight: 700; margin: 32px 0 16px; padding: 8px 16px; background: #1a1d27; border-radius: 8px; border-left: 4px solid #6366f1; }
  .exercise-card { background: #1a1d27; border-radius: 12px; margin-bottom: 16px; padding: 16px; border: 1px solid #2a2d37; }
  .exercise-card.has-override { border-color: #22c55e; }
  .exercise-card.suspicious { border-color: #f59e0b; }
  .exercise-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px; }
  .exercise-name { font-size: 16px; font-weight: 600; }
  .exercise-score { font-size: 12px; padding: 2px 8px; border-radius: 12px; }
  .score-good { background: #166534; color: #86efac; }
  .score-ok { background: #854d0e; color: #fde047; }
  .score-bad { background: #991b1b; color: #fca5a5; }
  .override-badge { background: #166534; color: #86efac; font-size: 12px; padding: 2px 8px; border-radius: 12px; }
  .gif-row { display: flex; gap: 12px; overflow-x: auto; padding-bottom: 8px; }
  .gif-option { flex-shrink: 0; text-align: center; cursor: pointer; border: 2px solid transparent; border-radius: 8px; padding: 8px; transition: all 0.2s; min-width: 180px; }
  .gif-option:hover { border-color: #6366f1; background: #252836; }
  .gif-option.selected { border-color: #22c55e; background: #0f2a1a; }
  .gif-option.current { border-color: #6366f1; }
  .gif-option img { width: 160px; height: 160px; object-fit: contain; border-radius: 4px; background: #252836; }
  .gif-option .label { font-size: 11px; color: #aaa; margin-top: 4px; word-break: break-word; }
  .gif-option .id-tag { font-size: 10px; color: #6366f1; font-family: monospace; margin-top: 2px; cursor: pointer; }
  .gif-option .tag { font-size: 10px; padding: 1px 6px; border-radius: 8px; display: inline-block; margin-top: 4px; }
  .tag-current { background: #312e81; color: #a5b4fc; }
  .tag-candidate { background: #1e1e1e; color: #888; }
  .actions { position: fixed; bottom: 0; left: 0; right: 0; background: #1a1d27; border-top: 1px solid #2a2d37; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; z-index: 100; }
  .actions button { padding: 10px 24px; border-radius: 8px; border: none; cursor: pointer; font-size: 14px; font-weight: 600; }
  .btn-export { background: #6366f1; color: #fff; }
  .btn-export:hover { background: #4f46e5; }
  .counter { color: #aaa; font-size: 14px; }
  .filter-bar { display: flex; gap: 8px; justify-content: center; margin-bottom: 24px; flex-wrap: wrap; }
  .filter-btn { padding: 6px 16px; border-radius: 20px; border: 1px solid #2a2d37; background: transparent; color: #aaa; cursor: pointer; font-size: 13px; }
  .filter-btn.active { background: #6366f1; color: #fff; border-color: #6366f1; }
  body { padding-bottom: 80px; }
</style>
</head>
<body>
<h1>Exercise GIF Review</h1>
<p class="subtitle">Click on the correct GIF for each exercise. Export overrides when done.</p>
<div class="stats">
  <span>Total: ${entries.length}</span>
  <span id="selectedCount">Selected: 0</span>
  <span id="suspiciousCount">Suspicious: 0</span>
</div>
<div class="filter-bar">
  <button class="filter-btn active" onclick="filterExercises('all')">All</button>
  <button class="filter-btn" onclick="filterExercises('suspicious')">Suspicious Only</button>
  <button class="filter-btn" onclick="filterExercises('selected')">Selected</button>
  <button class="filter-btn" onclick="filterExercises('unreviewed')">Unreviewed</button>
</div>
<div id="exercises">
${Object.entries(groups)
  .map(
    ([group, items]) => `
  <div class="group-section" data-group="${group}">
    <div class="group-title">${group.toUpperCase()} (${items.length})</div>
    ${items
      .map((e, i) => {
        const scoreClass =
          e.currentMatch && e.currentMatch.score >= 0.9
            ? "score-good"
            : e.currentMatch && e.currentMatch.score >= 0.7
              ? "score-ok"
              : "score-bad";
        const isSuspicious =
          !e.currentMatch ||
          e.currentMatch.score < 0.70;
        const cardId = normalize(e.name).replace(/\\s+/g, "-");
        return `
    <div class="exercise-card ${isSuspicious ? "suspicious" : ""} ${e.overridden ? "has-override" : ""}" id="card-${cardId}" data-name="${e.name}" data-suspicious="${isSuspicious}">
      <div class="exercise-header">
        <span class="exercise-name">${e.name}</span>
        <span>
          ${e.overridden ? '<span class="override-badge">Override</span>' : ""}
          ${e.currentMatch ? `<span class="exercise-score ${scoreClass}">Score: ${e.currentMatch.score.toFixed(2)}</span>` : '<span class="exercise-score score-bad">No match</span>'}
        </span>
      </div>
      <div class="gif-row">
        ${
          e.currentMatch
            ? `<div class="gif-option current" data-exercise="${normalize(e.name)}" data-id="${e.currentMatch.id}" onclick="selectGif(this)">
            <img src="${e.currentMatch.gifUrl}" alt="${e.currentMatch.name}" loading="lazy" />
            <div class="label">${e.currentMatch.name}</div>
            <span class="tag tag-current">Current Match</span>
            <div class="id-tag" onclick="event.stopPropagation(); copyId('${e.currentMatch.id}')">${e.currentMatch.id}</div>
          </div>`
            : ""
        }
        ${e.candidates
          .filter((c) => c.id !== e.currentMatch?.id)
          .slice(0, 4)
          .map(
            (c) => `
          <div class="gif-option" data-exercise="${normalize(e.name)}" data-id="${c.id}" onclick="selectGif(this)">
            <img src="${c.gifUrl}" alt="${c.name}" loading="lazy" />
            <div class="label">${c.name}</div>
            <span class="tag tag-candidate">Score: ${c.score.toFixed(2)}</span>
            <div class="id-tag" onclick="event.stopPropagation(); copyId('${c.id}')">${c.id}</div>
          </div>`,
          )
          .join("")}
      </div>
    </div>`;
      })
      .join("")}
  </div>`,
  )
  .join("")}
</div>

<div class="actions">
  <span class="counter" id="actionCounter">0 overrides selected</span>
  <button class="btn-export" onclick="exportOverrides()">Export Overrides JSON</button>
</div>

<script>
const selections = {};

function selectGif(el) {
  const exercise = el.dataset.exercise;
  const id = el.dataset.id;
  const card = el.closest('.exercise-card');

  card.querySelectorAll('.gif-option').forEach(g => g.classList.remove('selected'));
  el.classList.add('selected');
  selections[exercise] = id;

  updateCounters();
}

function updateCounters() {
  const count = Object.keys(selections).length;
  document.getElementById('actionCounter').textContent = count + ' overrides selected';
  document.getElementById('selectedCount').textContent = 'Selected: ' + count;

  const suspicious = document.querySelectorAll('.exercise-card.suspicious').length;
  document.getElementById('suspiciousCount').textContent = 'Suspicious: ' + suspicious;
}

function filterExercises(mode) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');

  document.querySelectorAll('.exercise-card').forEach(card => {
    const name = card.dataset.name;
    const normalizedName = name.toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').replace(/[^a-z0-9\\s]/g, '').trim().replace(/\\s+/g, '-');
    const isSuspicious = card.dataset.suspicious === 'true';
    const isSelected = Object.keys(selections).some(k => k.replace(/\\s+/g, '-') === normalizedName);

    if (mode === 'all') card.style.display = '';
    else if (mode === 'suspicious') card.style.display = isSuspicious ? '' : 'none';
    else if (mode === 'selected') card.style.display = isSelected ? '' : 'none';
    else if (mode === 'unreviewed') card.style.display = !isSelected ? '' : 'none';
  });

  document.querySelectorAll('.group-section').forEach(section => {
    const visibleCards = section.querySelectorAll('.exercise-card:not([style*="display: none"])');
    section.style.display = visibleCards.length > 0 ? '' : 'none';
  });
}

function copyId(id) {
  navigator.clipboard.writeText(id);
}

function exportOverrides() {
  const json = JSON.stringify(selections, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'exerciseIdOverrides.json';
  a.click();
  URL.revokeObjectURL(url);
}

updateCounters();
</script>
</body>
</html>`;

  fs.writeFileSync(REVIEW_HTML_FILE, html, "utf-8");
  console.log(`\n📄 Review HTML saved to ${REVIEW_HTML_FILE}`);
  console.log("   Open it in your browser to review GIF matches visually.");
}

// -- Main ---------------------------------------------------------------------

async function main() {
  console.log("=== Coach OS — Exercise GIF Fetcher ===\n");
  console.log(
    `Config: DRY_RUN=${DRY_RUN}, SKIP_S3=${SKIP_S3}, REVIEW_HTML=${REVIEW_HTML}, THRESHOLD=${SIMILARITY_THRESHOLD}\n`,
  );

  // Load overrides from JSON file if it exists (exported from review HTML)
  if (fs.existsSync(OVERRIDES_JSON_FILE)) {
    try {
      const jsonOverrides = JSON.parse(fs.readFileSync(OVERRIDES_JSON_FILE, "utf-8"));
      let loadedCount = 0;
      for (const [name, id] of Object.entries(jsonOverrides)) {
        if (typeof id === "string" && id.trim()) {
          exerciseIdOverrides[name] = id;
          loadedCount++;
        }
      }
      if (loadedCount > 0) {
        console.log(`📂 Loaded ${loadedCount} overrides from ${OVERRIDES_JSON_FILE}\n`);
      }
    } catch {
      console.warn(`⚠️ Failed to parse ${OVERRIDES_JSON_FILE}, ignoring.\n`);
    }
  }

  // 1. Parse existing SQL file
  const sqlContent = fs.readFileSync(SQL_FILE, "utf-8");
  const { exercises: parsedExercises } = parseSqlFile(sqlContent);
  console.log(`Parsed ${parsedExercises.length} exercises from seed-exercises.sql\n`);

  // 2. Fetch from ExerciseDB API
  const apiExercises = await fetchExerciseDBExercises();

  if (apiExercises.length === 0) {
    console.log("No exercises fetched from API. Check your API key or network.");
    return;
  }

  // 2.5. REVIEW_HTML mode: generate visual review page and exit
  if (REVIEW_HTML) {
    console.log("Generating review HTML...\n");
    const reviewEntries: ReviewEntry[] = [];

    for (const ex of parsedExercises) {
      const { match, score, overridden } = findBestMatch(ex.name, apiExercises);
      const candidates = getTopCandidates(ex.name, apiExercises, 5);

      reviewEntries.push({
        name: ex.name,
        muscleGroup: ex.muscleGroup,
        currentMatch: match
          ? { name: match.name, id: match.exerciseId, gifUrl: match.gifUrl, score }
          : null,
        overridden,
        candidates: candidates.map((c) => ({
          name: c.match.name,
          id: c.match.exerciseId,
          gifUrl: c.match.gifUrl,
          score: c.score,
        })),
      });
    }

    generateReviewHtml(reviewEntries);
    console.log("\n=== Review HTML generated ===");
    console.log("1. Open review-exercises.html in your browser");
    console.log("2. Click on the correct GIF for each exercise");
    console.log("3. Click 'Export Overrides JSON' to download the file");
    console.log(`4. Save it as ${OVERRIDES_JSON_FILE}`);
    console.log("5. Re-run the script without REVIEW_HTML to apply overrides");
    return;
  }

  // 3. Match, download GIFs, upload to S3
  const s3 = !SKIP_S3 && !DRY_RUN ? getS3Client() : null;
  let matched = 0;
  let skipped = 0;
  let failed = 0;

  const results: Array<SqlExercise & { mediaUrl: string | null }> = [];

  for (const ex of parsedExercises) {
    const { match, score, overridden } = findBestMatch(ex.name, apiExercises);

    if (!match || score < SIMILARITY_THRESHOLD) {
      console.log(
        `❌ No match: "${ex.name}" (best score: ${score.toFixed(2)})`,
      );
      if (DRY_RUN) {
        const candidates = getTopCandidates(ex.name, apiExercises, 3);
        for (const c of candidates) {
          console.log(
            `   → candidate: "${c.match.name}" [id: ${c.match.exerciseId}] (score: ${c.score.toFixed(2)})`,
          );
        }
      }
      results.push({ ...ex, mediaUrl: null });
      skipped++;
      continue;
    }

    const matchSource = overridden ? "🔒 Override" : "🔍 Fuzzy";
    console.log(
      `✅ ${matchSource}: "${ex.name}" → "${match.name}" [id: ${match.exerciseId}] (score: ${score.toFixed(2)})`,
    );

    if (DRY_RUN) {
      results.push({ ...ex, mediaUrl: match.gifUrl });
      matched++;
      continue;
    }

    try {
      let mediaUrl: string;

      if (SKIP_S3) {
        mediaUrl = match.gifUrl;
      } else {
        const gifBuffer = await downloadGif(match.gifUrl);
        mediaUrl = await uploadGifToS3(s3!, gifBuffer, ex.name);
        await sleep(300);
      }

      results.push({ ...ex, mediaUrl });
      matched++;
    } catch (err) {
      console.error(
        `  ⚠️ Failed for "${ex.name}": ${(err as Error).message}`,
      );
      results.push({ ...ex, mediaUrl: null });
      failed++;
    }
  }

  // 4. Rewrite SQL file
  if (!DRY_RUN) {
    const newSql = buildSql(results);
    fs.writeFileSync(SQL_FILE, newSql, "utf-8");
    console.log(`\n📝 Rewrote ${SQL_FILE} with media_url populated`);
  }

  console.log("\n=== Summary ===");
  console.log(`Total exercises:   ${parsedExercises.length}`);
  console.log(`Matched:           ${matched}`);
  console.log(`No match found:    ${skipped}`);
  console.log(`Failed:            ${failed}`);

  if (DRY_RUN) {
    console.log("\n⚠️  DRY_RUN mode — no files were modified.");
    console.log("    Run without DRY_RUN=true to upload GIFs and rewrite SQL.");
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
