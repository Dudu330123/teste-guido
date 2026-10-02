import type { Task } from "@/types/content";

/**
 * Regra única para navegação local: conteúdo real precisa estar explicitamente
 * publicado; a única exceção é a demonstração bancária marcada no catálogo.
 */
export function canNavigateLocalTask(task: Task) {
  const isApprovedDemo = task.slug === "pagar-boleto" && task.availability === "demo";
  return isApprovedDemo || (task.status === "published" && task.availability === "available");
}

export function guideStatusForLocalTask(task: Task) {
  return task.slug === "pagar-boleto" ? "draft" as const : task.status;
}
