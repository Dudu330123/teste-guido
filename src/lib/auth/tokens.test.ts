import { describe, expect, it } from "vitest";
import { createCodeChallenge, createCodeVerifier, createOpaqueToken, hashOpaqueToken } from "./tokens";

describe("Guido auth tokens", () => {
  it("creates random opaque values and deterministic hashes", () => {
    const token = createOpaqueToken();
    expect(token.length).toBeGreaterThan(40);
    expect(hashOpaqueToken(token)).toHaveLength(64);
    expect(hashOpaqueToken(token)).toBe(hashOpaqueToken(token));
    expect(hashOpaqueToken(token)).not.toBe(hashOpaqueToken(createOpaqueToken()));
  });

  it("creates PKCE verifier and challenge", () => {
    const verifier = createCodeVerifier();
    expect(createCodeChallenge(verifier)).toMatch(/^[A-Za-z0-9_-]+$/);
  });
});
