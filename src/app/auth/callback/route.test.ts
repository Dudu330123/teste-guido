import { describe, expect, it } from "vitest";
import { safeAuthReturnPath } from "@/lib/validation/auth-return-path";

describe("retorno da autenticação", () => {
  it("aceita somente caminhos internos", () => {
    expect(safeAuthReturnPath("/conta?origem=google")).toBe("/conta?origem=google");
    expect(safeAuthReturnPath("https://example.com")).toBe("/");
    expect(safeAuthReturnPath("//example.com")).toBe("/");
    expect(safeAuthReturnPath("/\\example.com")).toBe("/");
    expect(safeAuthReturnPath("/%2e%2e//example.com")).toBe("/");
  });
});
