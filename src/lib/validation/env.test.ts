import { afterEach, describe, expect, it } from "vitest";
import { getRuntimeConfig } from "@/lib/validation/env";

const originalDatabaseUrl = process.env.DATABASE_URL;
const originalGoogleClientId = process.env.GOOGLE_CLIENT_ID;
const originalGoogleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const originalGoogleRedirectUri = process.env.GOOGLE_REDIRECT_URI;

function restore(name: string, value: string | undefined) {
  if (value === undefined) delete process.env[name];
  else process.env[name] = value;
}

afterEach(() => {
  restore("DATABASE_URL", originalDatabaseUrl);
  restore("GOOGLE_CLIENT_ID", originalGoogleClientId);
  restore("GOOGLE_CLIENT_SECRET", originalGoogleClientSecret);
  restore("GOOGLE_REDIRECT_URI", originalGoogleRedirectUri);
});

describe("getRuntimeConfig", () => {
  it("detects database and complete Google configuration", () => {
    process.env.DATABASE_URL = "postgresql://localhost/guido";
    process.env.GOOGLE_CLIENT_ID = "client";
    process.env.GOOGLE_CLIENT_SECRET = "secret";
    process.env.GOOGLE_REDIRECT_URI = "http://localhost:3000/api/auth/google/callback";
    expect(getRuntimeConfig()).toEqual({ databaseConfigured: true, googleConfigured: true });
  });

  it("keeps Google optional", () => {
    delete process.env.DATABASE_URL;
    delete process.env.GOOGLE_CLIENT_ID;
    delete process.env.GOOGLE_CLIENT_SECRET;
    delete process.env.GOOGLE_REDIRECT_URI;
    expect(getRuntimeConfig()).toEqual({ databaseConfigured: false, googleConfigured: false });
  });
});
