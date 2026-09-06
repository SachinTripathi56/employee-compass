import { apiRequest } from "./client";
import type { CurrentUser } from "./types";

/** The backend is the source of truth for the application role. */
export const getCurrentUser = () => apiRequest<CurrentUser>("/api/v1/me");
