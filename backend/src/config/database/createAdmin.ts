import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as argon2 from "argon2";
import { eq } from "drizzle-orm";

import { getDatabaseConfig } from "./database.config";
import { env } from "../env";
import { users, admins } from "./schema";

async function createAdmin() {
  const name = process.env.ADMIN_NAME;
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!name || !email || !password) {
    console.error("Missing required environment variables: ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD");
    process.exit(1);
  }

  if (password.length < 8) {
    console.error("ADMIN_PASSWORD must be at least 8 characters");
    process.exit(1);
  }

  const pool = new Pool(getDatabaseConfig());
  const db = drizzle(pool);

  try {
    // Check if email already exists
    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing) {
      console.error(`User with email "${email}" already exists`);
      process.exit(1);
    }

    // Hash password with argon2id + pepper
    const hashedPassword = await argon2.hash(password + env.HASH_PEPPER, {
      type: argon2.argon2id,
    });

    // Create user with ADMIN role
    const [adminUser] = await db
      .insert(users)
      .values({
        name,
        email,
        password: hashedPassword,
        role: "ADMIN",
      })
      .returning();

    // Create admin record
    await db.insert(admins).values({ userId: adminUser.id });

    console.log(`✓ Admin created successfully (email: ${email})`);
  } catch (error) {
    console.error("Failed to create admin:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

createAdmin();
