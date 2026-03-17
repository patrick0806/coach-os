// Shared cookie names — imported by both client (authStore) and server (serverFetch)
// No browser or Node.js APIs here — safe to import from any context.

export const AUTH_TOKEN_COOKIE = "coach_os_at";
export const AUTH_USER_COOKIE = "coach_os_user";

// Must match backend JWT expiry
export const TOKEN_TTL_MINUTES = 15;
