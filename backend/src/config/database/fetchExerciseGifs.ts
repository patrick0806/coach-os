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
  "supino reto com barra": ["barbell bench press", "bench press"],
  "supino inclinado com barra": ["incline barbell bench press"],
  "supino declinado com barra": ["decline barbell bench press"],
  "supino reto com halteres": ["dumbbell bench press"],
  "supino inclinado com halteres": ["incline dumbbell bench press"],
  "supino declinado com halteres": ["decline dumbbell bench press"],
  "crucifixo com halteres": ["dumbbell fly", "dumbbell flyes"],
  "crucifixo inclinado com halteres": ["incline dumbbell fly"],
  "flexao de braco": ["push up", "push-up"],
  "flexao de braco diamante": ["diamond push up"],
  "flexao de braco com pes elevados": ["decline push up", "feet elevated push up"],
  "flexao de braco aberta": ["wide grip push up"],
  "flexao de braco fechada": ["close grip push up"],
  "cross over no cabo": ["cable crossover", "cable fly"],
  "peck deck voador": ["pec deck", "pec deck fly", "butterfly"],
  "supino na maquina chest press": ["chest press machine", "machine chest press"],
  "pullover com halter": ["dumbbell pullover"],
  "chest press inclinado na maquina": ["incline chest press machine"],
  "cross over baixo low cable fly": ["low cable fly", "low cable crossover"],
  "supino reto no smith": ["smith machine bench press"],
  "crucifixo no cabo cable fly": ["cable fly"],
  "puxada na barra fixa pullup": ["pull up", "pull-up"],
  "puxada na barra fixa supinada chinup": ["chin up", "chin-up"],
  "puxada no pulley frontal": ["lat pulldown", "cable lat pulldown"],
  "puxada no pulley triangulo": ["close grip lat pulldown", "v-bar pulldown"],
  "puxada aberta no pulley": ["wide grip lat pulldown"],
  "puxada unilateral no cabo": ["single arm lat pulldown"],
  "puxada no pulley com barra v": ["v-bar lat pulldown"],
  "remada curvada com barra": ["barbell bent over row", "barbell row"],
  "remada curvada com barra supinada": ["reverse grip barbell row"],
  "remada unilateral com halter": ["dumbbell row", "one arm dumbbell row"],
  "remada cavalinho tbar row": ["t-bar row", "lever t-bar row"],
  "remada sentado no cabo seated row": ["seated cable row", "cable seated row"],
  "remada na maquina": ["machine row", "lever seated row"],
  "remada alta com barra": ["barbell upright row", "upright row"],
  "remada no smith": ["smith machine row"],
  "remada pendlay": ["pendlay row"],
  "remada gorilla": ["gorilla row"],
  "remada alta com halteres": ["dumbbell upright row"],
  "pullover no cabo": ["cable pullover", "straight arm pulldown"],
  "levantamento terra": ["deadlift", "barbell deadlift"],
  "good morning": ["good morning"],
  "hiperextensao back extension": ["back extension", "hyperextension"],
  "desenvolvimento com halteres": ["dumbbell shoulder press"],
  "desenvolvimento com barra": ["barbell shoulder press", "overhead press"],
  "desenvolvimento arnold": ["arnold press"],
  "desenvolvimento na maquina shoulder press": ["machine shoulder press"],
  "desenvolvimento com kettlebell": ["kettlebell press"],
  "desenvolvimento no smith": ["smith machine shoulder press"],
  "elevacao lateral com halteres": ["dumbbell lateral raise"],
  "elevacao lateral no cabo": ["cable lateral raise"],
  "elevacao lateral na maquina": ["machine lateral raise"],
  "elevacao lateral inclinado": ["incline lateral raise"],
  "elevacao frontal com halteres": ["dumbbell front raise"],
  "elevacao frontal com barra": ["barbell front raise"],
  "elevacao frontal com disco": ["plate front raise"],
  "crucifixo inverso com halteres": ["reverse fly", "dumbbell reverse fly"],
  "crucifixo inverso no peck deck": ["reverse pec deck", "reverse machine fly"],
  "face pull no cabo": ["face pull", "cable face pull"],
  "remada alta com halteres trapezio": ["dumbbell upright row"],
  "y raise com halteres": ["dumbbell y raise"],
  "rosca direta com barra": ["barbell curl"],
  "rosca direta com barra w": ["ez barbell curl", "ez bar curl"],
  "rosca alternada com halteres": ["alternate dumbbell curl", "dumbbell curl"],
  "rosca simultanea com halteres": ["dumbbell curl"],
  "rosca martelo": ["hammer curl", "dumbbell hammer curl"],
  "rosca martelo alternada": ["alternate hammer curl"],
  "rosca concentrada": ["concentration curl"],
  "rosca scott com barra w": ["preacher curl", "ez bar preacher curl"],
  "rosca scott com halter": ["dumbbell preacher curl"],
  "rosca no cabo pulley": ["cable curl", "cable bicep curl"],
  "rosca martelo no cabo rope curl": ["cable rope curl", "rope hammer curl"],
  "rosca inclinada com halteres": ["incline dumbbell curl"],
  "rosca 21": ["21s curl", "barbell 21 curl"],
  "rosca spider": ["spider curl"],
  "rosca inversa com barra": ["reverse barbell curl"],
  "rosca no cross over": ["cable curl high pulley"],
  "rosca concentrada no cabo": ["cable concentration curl"],
  "rosca zottman": ["zottman curl"],
  "triceps pulley com barra": ["triceps pushdown", "cable pushdown"],
  "triceps pulley com corda": ["triceps rope pushdown", "cable rope pushdown"],
  "triceps pulley inverso": ["reverse grip pushdown"],
  "triceps testa com barra w": ["skull crusher", "lying triceps extension"],
  "triceps testa com halteres": ["dumbbell skull crusher"],
  "triceps frances com halter": ["overhead triceps extension", "dumbbell overhead extension"],
  "triceps frances com barra w": ["ez bar overhead extension"],
  "triceps coice kickback": ["triceps kickback", "dumbbell kickback"],
  "mergulho no banco": ["bench dip", "triceps dip bench"],
  "mergulho nas paralelas": ["parallel bar dip", "chest dip", "tricep dip"],
  "triceps no cross over overhead": ["cable overhead extension"],
  "supino fechado com barra": ["close grip bench press"],
  "triceps na maquina": ["machine triceps extension"],
  "triceps unilateral no cabo": ["single arm cable pushdown"],
  "triceps testa no cabo": ["cable lying triceps extension"],
  "triceps mergulho assistido na maquina": ["assisted dip machine"],
  "agachamento livre com barra": ["barbell squat", "barbell full squat"],
  "agachamento frontal": ["front squat", "barbell front squat"],
  "agachamento goblet": ["goblet squat", "dumbbell goblet squat"],
  "agachamento no smith": ["smith machine squat"],
  "agachamento bulgaro": ["bulgarian split squat"],
  "agachamento sumo": ["sumo squat", "barbell sumo squat"],
  "agachamento com kettlebell": ["kettlebell squat"],
  "agachamento pistol": ["pistol squat"],
  "agachamento no sissy squat": ["sissy squat"],
  "leg press 45": ["leg press", "sled 45 leg press"],
  "leg press horizontal": ["horizontal leg press"],
  "hack squat": ["hack squat", "sled hack squat"],
  "cadeira extensora": ["leg extension", "lever leg extension"],
  "mesa flexora": ["leg curl", "lying leg curl"],
  "cadeira flexora": ["seated leg curl"],
  "cadeira adutora": ["hip adduction machine", "adductor machine"],
  "cadeira abdutora": ["hip abduction machine", "abductor machine"],
  "stiff com barra": ["stiff leg deadlift", "barbell stiff leg deadlift"],
  "stiff com halteres": ["dumbbell stiff leg deadlift"],
  "stiff unilateral": ["single leg deadlift"],
  "avanco passada com halteres": ["dumbbell lunge", "dumbbell walking lunge"],
  "avanco passada com barra": ["barbell lunge"],
  "avanco caminhando": ["walking lunge"],
  "avanco reverso": ["reverse lunge"],
  "levantamento terra sumo": ["sumo deadlift"],
  "levantamento terra romeno": ["romanian deadlift"],
  "step up com halteres": ["dumbbell step up"],
  "prensa de pernas leg press vertical": ["vertical leg press"],
  "hip thrust com barra": ["barbell hip thrust", "hip thrust"],
  "hip thrust na maquina": ["machine hip thrust"],
  "elevacao pelvica glute bridge": ["glute bridge", "barbell glute bridge"],
  "elevacao pelvica unilateral": ["single leg glute bridge"],
  "abducao de quadril na maquina": ["hip abduction machine"],
  "abducao de quadril no cabo": ["cable hip abduction"],
  "extensao de quadril no cabo": ["cable hip extension", "cable kickback"],
  "kickback na maquina gluteo": ["machine glute kickback"],
  "agachamento sumo com halter": ["dumbbell sumo squat"],
  "passada lateral com elastico": ["lateral band walk"],
  "coice de gluteo donkey kick": ["donkey kick"],
  "fire hydrant": ["fire hydrant"],
  "frog pump": ["frog pump"],
  "step up lateral": ["lateral step up"],
  "prancha frontal": ["plank", "front plank"],
  "prancha lateral": ["side plank"],
  "prancha com toque no ombro": ["plank shoulder tap"],
  "prancha com elevacao de perna": ["plank leg raise"],
  "abdominal crunch": ["crunch", "floor crunch"],
  "abdominal crunch na maquina": ["machine crunch"],
  "abdominal infra elevacao de pernas": ["lying leg raise", "leg raise"],
  "abdominal bicicleta": ["bicycle crunch"],
  "abdominal obliquo": ["oblique crunch"],
  "elevacao de pernas na barra fixa": ["hanging leg raise"],
  "elevacao de joelhos na barra fixa": ["hanging knee raise"],
  "abdominal na roda ab wheel": ["ab wheel rollout"],
  "russian twist": ["russian twist"],
  "mountain climber": ["mountain climber"],
  "dead bug": ["dead bug"],
  "abdominal canivete": ["v-up", "jackknife"],
  "pallof press no cabo": ["pallof press"],
  "panturrilha em pe na maquina": ["standing calf raise", "machine calf raise"],
  "panturrilha sentado na maquina": ["seated calf raise"],
  "panturrilha no leg press": ["leg press calf raise"],
  "panturrilha no smith": ["smith machine calf raise"],
  "panturrilha com halter": ["dumbbell calf raise"],
  "panturrilha unilateral": ["single leg calf raise"],
  "panturrilha no hack squat": ["hack squat calf raise"],
  "panturrilha com peso corporal escada": ["bodyweight calf raise"],
  "panturrilha no donkey calf raise": ["donkey calf raise"],
  "rosca de punho com barra": ["barbell wrist curl", "wrist curl"],
  "rosca de punho inversa com barra": ["barbell reverse wrist curl"],
  "rosca de punho com halter": ["dumbbell wrist curl"],
  "farmer walk caminhada do fazendeiro": ["farmer walk", "farmers walk"],
  "pegada no halter dead hang": ["dead hang"],
  "pronacao e supinacao com halter": ["forearm pronation supination"],
  "roller de punho wrist roller": ["wrist roller"],
  "encolhimento com halteres": ["dumbbell shrug"],
  "encolhimento com barra": ["barbell shrug"],
  "encolhimento na maquina": ["machine shrug"],
  "encolhimento no smith": ["smith machine shrug"],
  "remada alta com barra trapezio": ["barbell upright row"],
  "face pull trapezio medio": ["face pull"],
  "ytw no banco inclinado": ["y raise", "prone y raise"],
  "encolhimento com kettlebell": ["kettlebell shrug"],
  "farmer walk com trap bar": ["trap bar farmer walk"],
  "burpee": ["burpee"],
  "kettlebell swing": ["kettlebell swing"],
  "turkish get up": ["turkish get up"],
  "clean and press com barra": ["clean and press", "barbell clean and press"],
  "snatch com kettlebell": ["kettlebell snatch"],
  "thruster com barra": ["barbell thruster", "thruster"],
  "thruster com halteres": ["dumbbell thruster"],
  "wall ball": ["wall ball"],
  "box jump": ["box jump"],
  "battle rope corda naval": ["battle rope"],
  "sled push treno": ["sled push"],
  "bear crawl": ["bear crawl"],
  "medicine ball slam": ["medicine ball slam", "ball slam"],
  "rowing remo ergometrico": ["rowing machine"],
  "escalada na corda rope climb": ["rope climb"],
  "salto em profundidade depth jump": ["depth jump"],
  "kettlebell clean": ["kettlebell clean"],
  "man maker com halteres": ["man maker"],
  "pulo com agachamento jump squat": ["jump squat"],
  "swing com halter": ["dumbbell swing"],
  "inchworm": ["inchworm"],
};

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

function findBestMatch(
  exerciseName: string,
  apiExercises: ExerciseDBEntry[],
): { match: ExerciseDBEntry | null; score: number } {
  const normalizedName = normalize(exerciseName);

  const hints = translationHints[normalizedName] || [];
  let bestMatch: ExerciseDBEntry | null = null;
  let bestScore = 0;

  for (const apiEx of apiExercises) {
    const apiName = normalize(apiEx.name);

    let score = similarity(normalizedName, apiName);

    for (const hint of hints) {
      const hintScore = similarity(normalize(hint), apiName);
      if (hintScore > score) score = hintScore;
    }

    for (const hint of hints) {
      const hintWords = normalize(hint).split(/\s+/);
      const apiWords = apiName.split(/\s+/);
      const matchCount = hintWords.filter((w) =>
        apiWords.some((aw) => similarity(w, aw) > 0.85),
      ).length;
      const wordBonus = (matchCount / Math.max(hintWords.length, 1)) * 0.3;
      score = Math.max(score, score + wordBonus);
    }

    score = Math.min(1, score);

    if (score > bestScore) {
      bestScore = score;
      bestMatch = apiEx;
    }
  }

  return { match: bestMatch, score: bestScore };
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

  // Match each INSERT value tuple
  const tupleRegex = /\(gen_random_uuid\(\),\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*NULL,\s*NOW\(\),\s*NOW\(\)\)/g;

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
    const testRes = await fetch(
      `${EXERCISEDB_BASE}/exercises?limit=1&offset=0`,
    );
    if (testRes.ok) {
      console.log("Using open-source ExerciseDB API (v1)");

      while (true) {
        const res = await fetch(
          `${EXERCISEDB_BASE}/exercises?limit=${limit}&offset=${offset}`,
        );
        if (!res.ok) break;

        const data = await res.json();
        const items = data.data?.exercises || data.data || data || [];
        if (!Array.isArray(items) || items.length === 0) break;

        allExercises.push(...items);
        offset += limit;

        if (items.length < limit) break;
        await sleep(200);
      }

      if (allExercises.length > 0) {
        console.log(
          `Fetched ${allExercises.length} exercises from open-source API\n`,
        );
        return allExercises;
      }
    }
  } catch {
    console.log("Open-source API not available, trying RapidAPI...\n");
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

// -- Main ---------------------------------------------------------------------

async function main() {
  console.log("=== Coach OS — Exercise GIF Fetcher ===\n");
  console.log(
    `Config: DRY_RUN=${DRY_RUN}, SKIP_S3=${SKIP_S3}, THRESHOLD=${SIMILARITY_THRESHOLD}\n`,
  );

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

  // 3. Match, download GIFs, upload to S3
  const s3 = !SKIP_S3 && !DRY_RUN ? getS3Client() : null;
  let matched = 0;
  let skipped = 0;
  let failed = 0;

  const results: Array<SqlExercise & { mediaUrl: string | null }> = [];

  for (const ex of parsedExercises) {
    const { match, score } = findBestMatch(ex.name, apiExercises);

    if (!match || score < SIMILARITY_THRESHOLD) {
      console.log(
        `❌ No match: "${ex.name}" (best score: ${score.toFixed(2)})`,
      );
      results.push({ ...ex, mediaUrl: null });
      skipped++;
      continue;
    }

    console.log(
      `✅ Match: "${ex.name}" → "${match.name}" (score: ${score.toFixed(2)})`,
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
