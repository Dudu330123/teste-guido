import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Informe um e-mail válido."),
  password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres."),
});

export const signUpSchema = loginSchema
  .extend({
    name: z.string().trim().min(2, "Informe seu nome."),
    confirmPassword: z.string(),
    preferredOperatingSystem: z.enum(["android", "ios"]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não são iguais.",
    path: ["confirmPassword"],
  });

export const recoverySchema = z.object({
  email: z.string().trim().email("Informe um e-mail válido."),
});
