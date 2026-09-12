export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  preferredPlatform: "android" | "ios" | null;
  emailVerified: boolean;
}

export class AuthError extends Error {
  constructor(public readonly code: string, message: string, public readonly status = 400) {
    super(message);
    this.name = "AuthError";
  }
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}
