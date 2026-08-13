import { describe, expect, it } from "vitest";
import { loginSchema, profileSchema, resetPasswordSchema, signUpSchema } from "@/lib/validation/auth";

describe("validação da autenticação", () => {
  it("rejeita login com e-mail inválido e senha curta", () => {
    expect(loginSchema.safeParse({ email: "invalido", password: "123" }).success).toBe(false);
  });

  it("exige confirmação de senha igual no cadastro e na recuperação", () => {
    expect(signUpSchema.safeParse({
      name: "Pessoa",
      email: "pessoa@example.com",
      password: "senha-segura",
      confirmPassword: "outra-senha",
      preferredOperatingSystem: "android",
    }).success).toBe(false);
    expect(resetPasswordSchema.safeParse({
      password: "senha-segura",
      confirmPassword: "outra-senha",
    }).success).toBe(false);
  });

  it("aceita apenas os dados mínimos permitidos no perfil", () => {
    expect(profileSchema.parse({ displayName: "  Maria  ", preferredPlatform: "ios" })).toEqual({
      displayName: "Maria",
      preferredPlatform: "ios",
    });
    expect(profileSchema.safeParse({ displayName: "M", preferredPlatform: "windows" }).success).toBe(false);
  });
});
