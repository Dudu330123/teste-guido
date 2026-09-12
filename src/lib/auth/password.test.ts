import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./password";

describe("Guido password hashing", () => {
  it("uses one-way hashes that verify only the original password", async () => {
    const hash = await hashPassword("senha-local-123");
    expect(hash).toContain("$argon2id$");
    await expect(verifyPassword(hash, "senha-local-123")).resolves.toBe(true);
    await expect(verifyPassword(hash, "senha-incorreta")).resolves.toBe(false);
  });
});
