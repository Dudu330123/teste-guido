import { describe, expect, it } from "vitest";
import { getSessionDisplayName } from "./session-navigation";

describe("nome exibido na sessão", () => {
  it("normaliza e limita o nome informado no cadastro", () => {
    expect(getSessionDisplayName({ name: "  Maria   da Silva  " })).toBe("Maria da Silva");
    expect(getSessionDisplayName({ name: "A".repeat(80) })).toHaveLength(60);
  });

  it("não usa metadados inválidos como nome", () => {
    expect(getSessionDisplayName(null)).toBeNull();
    expect(getSessionDisplayName({ name: 123 })).toBeNull();
    expect(getSessionDisplayName({ name: "   " })).toBeNull();
  });
});
