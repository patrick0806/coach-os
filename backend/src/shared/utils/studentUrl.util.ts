import { env } from "@config/env";

/**
 * Builds a student-facing URL for a given coach slug and path.
 *
 * Production (STUDENT_BASE_DOMAIN set):
 *   buildStudentUrl("joao", "/accept-invite?token=abc") → "https://joao.coachos.com.br/accept-invite?token=abc"
 *
 * Development (STUDENT_BASE_DOMAIN empty):
 *   buildStudentUrl("joao", "/accept-invite?token=abc") → "http://localhost:3000/coach/joao/accept-invite?token=abc"
 */
export function buildStudentUrl(slug: string, path: string): string {
  if (env.STUDENT_BASE_DOMAIN) {
    return `https://${slug}.${env.STUDENT_BASE_DOMAIN}${path}`;
  }
  return `${env.APP_URL}/coach/${slug}${path}`;
}
