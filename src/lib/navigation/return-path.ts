/**
 * Mantém o retorno dentro do próprio Guido para que links recebidos por query
 * string não possam redirecionar o usuário para um site externo.
 */
export function safeReturnPath(value: string | undefined, fallback: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return fallback;
  return value;
}

/** Anexa o contexto de navegação a um link interno sem perder seus parâmetros. */
export function withReturnPath(href: string, returnTo?: string) {
  if (!returnTo) return href;
  const separator = href.includes("?") ? "&" : "?";
  return `${href}${separator}returnTo=${encodeURIComponent(returnTo)}`;
}
