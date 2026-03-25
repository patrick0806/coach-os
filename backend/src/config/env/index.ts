import "dotenv/config";
import { z } from "zod";

const isProduction = process.env.NODE_ENV === "production";

const INSECURE_DEFAULTS = [
  "jwt_secret_change_in_production",
  "jwt_refresh_secret_change_in_production",
  "hash_pepper_change_in_production",
];

const secureSecret = (fieldName: string) =>
  z
    .string()
    .min(1, `${fieldName} é obrigatório`)
    .refine(
      (val) => !isProduction || !INSECURE_DEFAULTS.includes(val),
      `${fieldName} está usando valor padrão inseguro em produção`,
    )
    .refine(
      (val) => !isProduction || val.length >= 32,
      `${fieldName} deve ter ao menos 32 caracteres em produção`,
    );

const envSchema = z.object({
  PORT: z.coerce.number().default(3001),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  JWT_SECRET: secureSecret("JWT_SECRET").default(
    "jwt_secret_change_in_production",
  ),
  JWT_EXPIRATION: z.string().default("15m"),
  JWT_REFRESH_SECRET: secureSecret("JWT_REFRESH_SECRET").default(
    "jwt_refresh_secret_change_in_production",
  ),
  JWT_REFRESH_EXPIRATION: z.string().default("7d"),

  DATABASE_HOST: z.string().default("localhost"),
  DATABASE_PORT: z.coerce.number().default(5432),
  DATABASE_USER: z.string().default("postgres"),
  DATABASE_PASSWORD: z.string().default("123"),
  DATABASE_NAME: z.string().default("my-personal-db"),
  DATABASE_SSL: z
    .string()
    .transform((val) => val === "true")
    .default(false),

  HASH_PEPPER: secureSecret("HASH_PEPPER").default(
    "hash_pepper_change_in_production",
  ),

  AWS_ACCESS_KEY_ID: z.string().default(""),
  AWS_SECRET_ACCESS_KEY: z.string().default(""),
  AWS_REGION: z.string().default("us-east-1"),
  AWS_S3_BUCKET: z.string().default(""),

  RESEND_API_KEY: z.string().default(""),
  APP_URL: z.string().default("http://localhost:3000"),
  STUDENT_BASE_DOMAIN: z.string().default(""),
  SUPPORT_EMAIL: z.string().default("suporte@coachos.com.br"),

  STRIPE_SECRET_KEY: z.string().default(""),
  STRIPE_WEBHOOK_SECRET: z.string().default(""),
  STRIPE_PRICE_BASICO: z.string().default(""),
  STRIPE_PRICE_PRO: z.string().default(""),
  STRIPE_PRICE_EMPRESARIAL: z.string().default(""),

  COOKIE_DOMAIN: z.string().default(""),

  CAN_CREATE_ADMIN: z
    .string()
    .transform((val) => val === "true")
    .default(false),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const errors = parsed.error.flatten().fieldErrors;
  console.error("❌ Variáveis de ambiente inválidas:", JSON.stringify(errors, null, 2));
  process.exit(1);
}

export const env = parsed.data;
