import { createHash, randomBytes } from "crypto";

/**
 * Generates a cryptographically secure random token.
 * Returns both the raw token (to be sent via email) and its SHA-256 hash (to be persisted).
 */
export function generateSetupToken(): { raw: string; hash: string } {
  const raw = randomBytes(32).toString("hex");
  const hash = createHash("sha256").update(raw).digest("hex");
  return { raw, hash };
}

/**
 * Hashes a raw token using SHA-256. Used to verify a token received from the client.
 */
export function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

/**
 * Returns a Date object set to `hours` from now.
 */
export function expiresInHours(hours: number): Date {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}
