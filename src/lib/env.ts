/**
 * Frontend-safe environment variables only.
 * Never place backend secrets, database credentials, Cloudinary secrets
 * or Clerk secret keys in this file.
 */
export const API_BASE_URL: string =
  (import.meta.env['VITE_API_BASE_URL'] as string | undefined)?.replace(/\/$/, "") ?? "";

export const CLERK_PUBLISHABLE_KEY: string =
  (import.meta.env['VITE_CLERK_PUBLISHABLE_KEY'] as string | undefined) ?? "";

/** True when no FastAPI backend is configured yet: UI falls back to demo data. */
export const USE_DEMO_DATA = API_BASE_URL === "";

/** True when Clerk is configured. Otherwise a local demo session is used. */
export const CLERK_ENABLED = CLERK_PUBLISHABLE_KEY !== "";
