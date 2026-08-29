import { z } from "zod";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Dados editoriais do aplicativo; a API converte categoryId em category_id. */
export const applicationCreationSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome do aplicativo.").max(100, "O nome deve ter no máximo 100 caracteres."),
  slug: z.string().trim().min(1, "Informe um identificador para o aplicativo.").max(100, "O slug deve ter no máximo 100 caracteres.").regex(slugPattern, "Use apenas letras minúsculas, números e hífens."),
  categoryId: z.string().uuid("Escolha um nicho existente."),
  description: z.string().trim().min(1, "Informe uma descrição do aplicativo.").max(500, "A descrição deve ter no máximo 500 caracteres."),
});

export type ApplicationCreationInput = z.infer<typeof applicationCreationSchema>;

export function normalizeApplicationCreationInput(input: unknown) {
  const parsed = applicationCreationSchema.safeParse(input);
  if (!parsed.success) return parsed;

  return {
    success: true as const,
    data: {
      ...parsed.data,
      name: parsed.data.name.trim(),
      slug: parsed.data.slug.trim(),
      description: parsed.data.description.trim(),
    },
  };
}

