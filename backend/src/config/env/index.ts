export const env = {
  PORT: process.env.PORT || 3001,
  NODE_ENV: process.env.NODE_ENV || "development",
  JWT_SECRET: process.env.JWT_SECRET || "secret",
  JWT_EXPIRATION: (process.env.JWT_EXPIRATION || "1d") as string,

  DATABASE_HOST: process.env.DATABASE_HOST || "localhost",
  DATABASE_PORT: parseInt(process.env.DATABASE_PORT || "5432", 10),
  DATABASE_USER: process.env.DATABASE_USER || "postgres",
  DATABASE_PASSWORD: process.env.DATABASE_PASSWORD || "123",
  DATABASE_NAME: process.env.DATABASE_NAME || "my-personal-db",
  DATABASE_SSL: process.env.DATABASE_SSL === "true",
};
