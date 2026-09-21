/**
 * Restringe o retorno do OAuth a caminhos internos do Guido.
 * Essa validação impede que o callback seja usado como redirecionamento aberto.
 */
export function safeAuthReturnPath(value: string | null) {
  if (!value?.startsWith("/") || value.startsWith("//") || value.includes("\\")) return "/";
  try {
    const parsed = new URL(value, "https://guido.local");
    const normalized = `${parsed.pathname}${parsed.search}${parsed.hash}`;
    return parsed.origin === "https://guido.local" && normalized.startsWith("/") && !normalized.startsWith("//") && !normalized.includes("\\")
      ? normalized
      : "/";
  } catch {
    return "/";
  }
}
