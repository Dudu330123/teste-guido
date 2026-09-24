const SEARCH_ALIASES: Record<string, string> = {
  // Pix variations and keyboard slips
  pok: "pix",
  poki: "pix",
  pox: "pix",
  pux: "pix",
  pics: "pix",
  pisc: "pix",
  piks: "pix",
  piki: "pix",
  piquis: "pix",
  pixe: "pix",

  // WhatsApp variations
  zap: "whatsapp",
  zapzap: "whatsapp",
  wpp: "whatsapp",
  whats: "whatsapp",
  wats: "whatsapp",
  watssap: "whatsapp",
  watsap: "whatsapp",
  whatapp: "whatsapp",
  uatsap: "whatsapp",
  uatisap: "whatsapp",
  uazap: "whatsapp",
  watsapp: "whatsapp",

  // Gov.br variations
  govbr: "gov",
  governo: "gov",
  meugov: "gov",

  // Boleto variations
  boletu: "boleto",
  boleta: "boleto",
  fatura: "boleto",

  // Extrato, saldo and comprovante variations
  estrato: "extrato",
  comprovanti: "comprovante",
  conprovante: "comprovante",
  comprovamte: "comprovante",
  limiti: "limite",
  saldu: "saldo",
};

export interface SearchDocument {
  title: string;
  aliases?: readonly string[];
  description?: string;
}

type SearchValue = string | SearchDocument;

/**
 * Portuguese stop words that users commonly include in natural queries
 * (e.g. "como fazer pix", "quero pagar boleto", "como ver meu saldo").
 */
const STOP_WORDS = new Set([
  "como", "para", "de", "do", "da", "dos", "das",
  "um", "uma", "uns", "umas", "o", "a", "os", "as",
  "no", "na", "nos", "nas", "em", "por", "com",
  "quero", "onde", "qual", "quais", "meu", "minha",
  "meus", "minhas", "seu", "sua", "seus", "suas",
  "ajuda", "sobre",
]);

/**
 * Collapses accidental repeated keystrokes (e.g. "pixxxx" -> "pix", "boleeeto" -> "boleto").
 * In Brazilian Portuguese, characters are never repeated 3+ times consecutively.
 * For characters other than 'r' and 's' (which are the only legitimate double consonants),
 * runs of 2+ can also be safely collapsed to match user typing slips.
 */
function collapseRepeatedChars(text: string): string {
  return text
    .replace(/(.)\1{2,}/gu, "$1")
    .replace(/([^rs])\1+/gu, "$1");
}

/**
 * Keeps the user's original input untouched while making comparisons stable
 * across accents, punctuation, casing, repeated keystrokes and common typos.
 */
export function normalizeSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((term) => {
      const alias = SEARCH_ALIASES[term];
      if (alias) return alias;
      const collapsed = collapseRepeatedChars(term);
      return SEARCH_ALIASES[collapsed] ?? collapsed;
    })
    .join(" ");
}

type MatchKind = "exact" | "starts" | "contains" | "terms" | "fuzzy";

/**
 * Damerau-Levenshtein distance supporting insertion, deletion, substitution
 * and transposition of adjacent characters (e.g. "boleot" -> "boleto", "senah" -> "senha").
 */
function damerauLevenshtein(left: string, right: string): number {
  if (left === right) return 0;
  if (left.length === 0) return right.length;
  if (right.length === 0) return left.length;

  const leftLength = left.length;
  const rightLength = right.length;

  const matrix: number[][] = Array.from({ length: leftLength + 1 }, () =>
    new Array(rightLength + 1).fill(0),
  );

  for (let i = 0; i <= leftLength; i += 1) matrix[i][0] = i;
  for (let j = 0; j <= rightLength; j += 1) matrix[0][j] = j;

  for (let i = 1; i <= leftLength; i += 1) {
    for (let j = 1; j <= rightLength; j += 1) {
      const cost = left[i - 1] === right[j - 1] ? 0 : 1;
      let minCost = Math.min(
        matrix[i - 1][j] + 1,        // deletion
        matrix[i][j - 1] + 1,        // insertion
        matrix[i - 1][j - 1] + cost,  // substitution
      );

      // Transposition
      if (
        i > 1 &&
        j > 1 &&
        left[i - 1] === right[j - 2] &&
        left[i - 2] === right[j - 1]
      ) {
        minCost = Math.min(minCost, matrix[i - 2][j - 2] + cost);
      }

      matrix[i][j] = minCost;
    }
  }

  return matrix[leftLength][rightLength];
}

function fuzzyDistance(queryToken: string, candidateToken: string): number | null {
  const collapsedQuery = collapseRepeatedChars(queryToken);
  const collapsedCandidate = collapseRepeatedChars(candidateToken);

  // Exact match after repeated characters collapsed (e.g. "pixxxx" -> "pix", "boleeeto" -> "boleto")
  if (collapsedQuery === candidateToken || collapsedQuery === collapsedCandidate) {
    return 0;
  }

  const longestLength = Math.max(queryToken.length, candidateToken.length);
  if (longestLength < 3) return null;

  // Adaptive threshold based on token length:
  // Short words (3-6 chars) tolerate 1 edit.
  // Medium words (7-9 chars) tolerate 2 edits.
  // Long words (10+ chars) tolerate 3 edits (e.g. "comprovante", "transferencia").
  const maximumDistance = longestLength >= 10 ? 3 : longestLength >= 7 ? 2 : 1;

  const distanceDirect = damerauLevenshtein(queryToken, candidateToken);
  const distanceCollapsed = damerauLevenshtein(collapsedQuery, candidateToken);
  const distance = Math.min(distanceDirect, distanceCollapsed);

  // Do not turn a word that merely contains the query (e.g. "usando" for "sando")
  // into a suggestion. Prefixes are handled explicitly; fuzzy is reserved for typos.
  if (candidateToken.length === queryToken.length + 1 && candidateToken.slice(1) === queryToken) {
    return null;
  }

  // Guard for 3-letter words: do not match completely unrelated words like "pao" with "pix"
  if (longestLength === 3 && distance > 0) {
    if (queryToken[0] !== candidateToken[0] && collapsedQuery[0] !== candidateToken[0]) {
      return null;
    }
  }

  if (distance <= maximumDistance) {
    const similarity = 1 - distance / longestLength;
    if (similarity >= 0.65) {
      return distance;
    }
  }

  return null;
}

function matchToken(queryToken: string, candidateToken: string): "exact" | "prefix" | "fuzzy" | null {
  if (queryToken === candidateToken) return "exact";
  if (candidateToken.startsWith(queryToken) && queryToken.length >= 3) return "prefix";

  const collapsedQuery = collapseRepeatedChars(queryToken);
  const collapsedCandidate = collapseRepeatedChars(candidateToken);
  if (collapsedQuery === candidateToken || collapsedQuery === collapsedCandidate) {
    return "fuzzy";
  }

  return fuzzyDistance(queryToken, candidateToken) === null ? null : "fuzzy";
}

function matchField(value: string, normalizedQuery: string): MatchKind | null {
  const normalizedValue = normalizeSearch(value);
  if (!normalizedValue || !normalizedQuery) return null;

  const allQueryTokens = normalizedQuery.split(" ").filter(Boolean);
  const candidateTokens = normalizedValue.split(" ").filter(Boolean);

  if (normalizedValue === normalizedQuery) return "exact";
  if (normalizedValue.startsWith(normalizedQuery)) return "starts";
  if (` ${normalizedValue} `.includes(` ${normalizedQuery} `)) return "contains";

  // Filter stop words if query contains other meaningful words
  const meaningfulTokens = allQueryTokens.filter((token) => !STOP_WORDS.has(token));
  const queryTokens = meaningfulTokens.length > 0 ? meaningfulTokens : allQueryTokens;

  if (queryTokens.length === 1 && queryTokens[0].length >= 3 && candidateTokens.some((token) => token.startsWith(queryTokens[0]))) {
    return "starts";
  }

  const tokenMatches = queryTokens.map((queryToken) => {
    const matches = candidateTokens.map((candidateToken) => matchToken(queryToken, candidateToken)).filter(Boolean);
    if (matches.includes("exact")) return "exact" as const;
    if (matches.includes("prefix")) return "prefix" as const;
    if (matches.includes("fuzzy")) return "fuzzy" as const;
    return null;
  });

  if (tokenMatches.some((match) => match === null)) return null;
  if (tokenMatches.every((match) => match === "exact")) return "terms";
  return "fuzzy";
}

function scoreField(value: string, normalizedQuery: string, field: "title" | "alias" | "description"): number {
  const match = matchField(value, normalizedQuery);
  if (!match) return 0;

  const scores = {
    title: { exact: 7000, starts: 6000, contains: 4000, terms: 3500, fuzzy: 2000 },
    alias: { exact: 5000, starts: 4500, contains: 3000, terms: 2800, fuzzy: 1800 },
    description: { exact: 1200, starts: 1100, contains: 1000, terms: 800, fuzzy: 500 },
  } as const;

  return scores[field][match] + normalizedQuery.length;
}

function scoreDocument(document: SearchDocument, normalizedQuery: string): number {
  const titleScore = scoreField(document.title, normalizedQuery, "title");
  const aliasScore = (document.aliases ?? []).reduce(
    (best, alias) => Math.max(best, scoreField(alias, normalizedQuery, "alias")),
    0,
  );
  const descriptionScore = document.description ? scoreField(document.description, normalizedQuery, "description") : 0;
  return Math.max(titleScore, aliasScore, descriptionScore);
}

function scoreSearchValue(value: SearchValue, normalizedQuery: string): number {
  if (typeof value === "string") return scoreField(value, normalizedQuery, "title");
  return scoreDocument(value, normalizedQuery);
}

export function scoreSearch(value: string, query: string): number {
  const normalizedQuery = normalizeSearch(query);
  if (!normalizedQuery) return 0;
  return scoreSearchValue(value, normalizedQuery);
}

export function rankSearch<T>(
  items: T[],
  query: string,
  getText: (item: T) => SearchValue,
  limit: number,
): T[] {
  const normalizedQuery = normalizeSearch(query);
  if (!normalizedQuery || limit <= 0) return [];

  return items
    .map((item, index) => ({ item, index, score: scoreSearchValue(getText(item), normalizedQuery) }))
    .filter((result) => result.score > 0)
    .sort((first, second) => second.score - first.score || first.index - second.index)
    .slice(0, limit)
    .map((result) => result.item);
}
