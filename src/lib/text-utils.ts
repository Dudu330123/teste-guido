/**
 * Utilitários de higienização de texto para garantir legibilidade e acessibilidade.
 */

/**
 * Corrige sequências de caracteres com codificação mojibake (ex: UTF-8 interpretado como ISO-8859-1).
 * Comum em dados legados ou importações remotas com strings como "Ã¡" em vez de "á".
 */
export function fixMojibake(text: string | null | undefined): string {
  if (!text || typeof text !== "string") return "";
  if (/[\u00C2\u00C3]/.test(text)) {
    try {
      return decodeURIComponent(escape(text));
    } catch {
      return text;
    }
  }
  return text;
}
