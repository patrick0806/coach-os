import "dotenv/config";

export const env = {
  PORT: process.env.PORT || 3001,
  NODE_ENV: process.env.NODE_ENV || "development",

  JWT_SECRET: process.env.JWT_SECRET || "jwt_secret_change_in_production",
  JWT_EXPIRATION: (process.env.JWT_EXPIRATION || "15m") as string,
  JWT_REFRESH_SECRET:
    process.env.JWT_REFRESH_SECRET || "jwt_refresh_secret_change_in_production",
  JWT_REFRESH_EXPIRATION: (
    process.env.JWT_REFRESH_EXPIRATION || "7d"
  ) as string,

  DATABASE_HOST: process.env.DATABASE_HOST || "localhost",
  DATABASE_PORT: parseInt(process.env.DATABASE_PORT || "5432", 10),
  DATABASE_USER: process.env.DATABASE_USER || "postgres",
  DATABASE_PASSWORD: process.env.DATABASE_PASSWORD || "123",
  DATABASE_NAME: process.env.DATABASE_NAME || "my-personal-db",
  DATABASE_SSL: process.env.DATABASE_SSL === "true",

  HASH_PEPPER: process.env.HASH_PEPPER || "hash_pepper_change_in_production",

  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || "",
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || "",
  AWS_REGION: process.env.AWS_REGION || "us-east-1",
  AWS_S3_BUCKET: process.env.AWS_S3_BUCKET || "",

  RESEND_API_KEY: process.env.RESEND_API_KEY || "",
  APP_URL: process.env.APP_URL || "http://localhost:3000",

  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || "",
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || "",
  STRIPE_PRICE_BASICO: process.env.STRIPE_PRICE_BASICO || "",
  STRIPE_PRICE_PRO: process.env.STRIPE_PRICE_PRO || "",
  STRIPE_PRICE_EMPRESARIAL: process.env.STRIPE_PRICE_EMPRESARIAL || "",
};
