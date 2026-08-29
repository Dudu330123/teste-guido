import { z } from "zod";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const GUIDE_STEP_MIN = 1;
export const GUIDE_STEP_MAX = 50;

const guideStepFields = {
  title: z.string().trim().min(1, "Informe o título do passo.").max(160, "O título do passo deve ter no máximo 160 caracteres."),
  instruction: z.string().trim().min(1, "Informe a instrução do passo.").max(2000, "A instrução deve ter no máximo 2.000 caracteres."),
  imageAlt: z.string().trim().min(1, "Descreva a imagem esperada.").max(1000, "A descrição da imagem deve ter no máximo 1.000 caracteres."),
  warning: z.string().trim().max(2000, "O aviso deve ter no máximo 2.000 caracteres.").default(""),
  confirmationMessage: z.string().trim().max(1000, "A confirmação deve ter no máximo 1.000 caracteres.").default(""),
};

export const guideCreationStepSchema = z.object(guideStepFields);

/**
 * O editor de rascunho reaproveita exatamente as regras editoriais da criação.
 * Os identificadores são opcionais porque uma etapa nova ainda não existe no
 * banco; quando presentes, servem apenas para preservar o vínculo do print.
 */
export const guideEditStepSchema = z.object({
  ...guideStepFields,
  id: z.string().uuid().optional(),
  pairedId: z.string().uuid().optional(),
});

export const guideCreationSchema = z.object({
  applicationSlug: z.string().trim().regex(slugPattern, "Escolha um aplicativo válido."),
  title: z.string().trim().min(1, "Informe o título do guia.").max(160, "O título deve ter no máximo 160 caracteres."),
  slug: z.string().trim().min(1, "Informe um identificador para o guia.").max(80).regex(slugPattern, "Use apenas letras minúsculas, números e hífens."),
  description: z.string().trim().min(1, "Informe uma descrição.").max(1000, "A descrição deve ter no máximo 1.000 caracteres."),
  difficulty: z.enum(["easy", "medium", "advanced"]),
  safetyWarning: z.string().trim().max(1500, "O aviso de segurança deve ter no máximo 1.500 caracteres.").default(""),
  appVersion: z.string().trim().min(1, "Informe a versão do aplicativo.").max(80, "A versão do aplicativo deve ter no máximo 80 caracteres."),
  guideVersion: z.string().trim().min(1, "Informe a versão do guia.").max(80, "A versão do guia deve ter no máximo 80 caracteres."),
  estimatedMinutes: z.number().int("Informe um número inteiro de minutos.").min(1, "A duração mínima é 1 minuto.").max(120, "A duração máxima é 120 minutos."),
  searchTerms: z.array(z.string().trim().min(1).max(120)).max(30, "Use no máximo 30 termos de busca.").default([]),
  steps: z.array(guideCreationStepSchema)
    .min(GUIDE_STEP_MIN, "Adicione pelo menos um passo.")
    .max(GUIDE_STEP_MAX, "Use no máximo 50 passos."),
});

export type GuideCreationInput = z.infer<typeof guideCreationSchema>;

export const guideEditSchema = z.object({
  expectedUpdatedAt: z.string().trim().min(1, "A versão do rascunho não foi informada."),
  title: guideCreationSchema.shape.title,
  description: guideCreationSchema.shape.description,
  difficulty: guideCreationSchema.shape.difficulty,
  safetyWarning: guideCreationSchema.shape.safetyWarning,
  appVersion: guideCreationSchema.shape.appVersion,
  guideVersion: guideCreationSchema.shape.guideVersion,
  estimatedMinutes: guideCreationSchema.shape.estimatedMinutes,
  searchTerms: guideCreationSchema.shape.searchTerms,
  steps: z.array(guideEditStepSchema)
    .min(GUIDE_STEP_MIN, "Adicione pelo menos um passo.")
    .max(GUIDE_STEP_MAX, "Use no máximo 50 passos."),
});

export type GuideEditInput = z.infer<typeof guideEditSchema>;

/** Normaliza termos repetidos sem alterar o conteúdo editorial enviado pelo admin. */
export function normalizeGuideCreationInput(input: unknown) {
  const parsed = guideCreationSchema.safeParse(input);
  if (!parsed.success) return parsed;

  return {
    success: true as const,
    data: {
      ...parsed.data,
      searchTerms: [...new Set(parsed.data.searchTerms.map((term) => term.trim()).filter(Boolean))],
      steps: parsed.data.steps.map((step) => ({
        ...step,
        warning: step.warning || "",
        confirmationMessage: step.confirmationMessage || "",
      })),
    },
  };
}

export function normalizeGuideEditInput(input: unknown) {
  const parsed = guideEditSchema.safeParse(input);
  if (!parsed.success) return parsed;

  return {
    success: true as const,
    data: {
      ...parsed.data,
      searchTerms: [...new Set(parsed.data.searchTerms.map((term) => term.trim()).filter(Boolean))],
      steps: parsed.data.steps.map((step) => ({
        ...step,
        warning: step.warning || "",
        confirmationMessage: step.confirmationMessage || "",
      })),
    },
  };
}

export function slugifyGuideTitle(value: string) {
  const slug = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
  return slug || "novo-guia";
}
