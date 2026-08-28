const SEARCH_ALIASES: Record<string, string> = {
  pok: "pix",
  poki: "pix",
};

export interface SearchDocument {
  title: string;
  aliases?: readonly string[];
  description?: string;
}

type SearchValue = string | SearchDocument;

/**
 * Keeps the user's original input untouched while making comparisons stable
 * across accents, punctuation, casing and accidental extra spaces.
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
    .map((term) => SEARCH_ALIASES[term] ?? term)
    .join(" ");
}

type MatchKind = "exact" | "starts" | "contains" | "terms" | "fuzzy";

function editDistance(left: string, right: string): number {
  if (left === right) return 0;
  if (left.length === 0) return right.length;
  if (right.length === 0) return left.length;

  let previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    const current = [leftIndex];
    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      const substitutionCost = left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1;
      current[rightIndex] = Math.min(
        current[rightIndex - 1] + 1,
        previous[rightIndex] + 1,
        previous[rightIndex - 1] + substitutionCost,
      );
    }
    previous = current;
  }
  return previous[right.length];
}

function fuzzyDistance(queryToken: string, candidateToken: string): number | null {
  const longestLength = Math.max(queryToken.length, candidateToken.length);
  if (longestLength < 3) return null;

  // A one-character slip is enough for short words; longer words may tolerate
  // two edits, but never an unbounded number of changes.
  const maximumDistance = longestLength >= 8 ? 2 : 1;
  const distance = editDistance(queryToken, candidateToken);
  // Do not turn a word that merely contains the query (for example, "usando"
  // for "sando") into a suggestion. Prefixes are handled explicitly below;
  // fuzzy matching is reserved for a genuine typo in the word itself.
  if (candidateToken.length === queryToken.length + 1 && candidateToken.slice(1) === queryToken) return null;
  return distance <= maximumDistance ? distance : null;
}

function matchToken(queryToken: string, candidateToken: string): "exact" | "prefix" | "fuzzy" | null {
  if (queryToken === candidateToken) return "exact";
  if (candidateToken.startsWith(queryToken) && queryToken.length >= 3) return "prefix";
  return fuzzyDistance(queryToken, candidateToken) === null ? null : "fuzzy";
}

function matchField(value: string, normalizedQuery: string): MatchKind | null {
  const normalizedValue = normalizeSearch(value);
  if (!normalizedValue || !normalizedQuery) return null;
  const queryTokens = normalizedQuery.split(" ").filter(Boolean);
  const candidateTokens = normalizedValue.split(" ").filter(Boolean);
  if (normalizedValue === normalizedQuery) return "exact";
  if (normalizedValue.startsWith(normalizedQuery)) return "starts";
  if (queryTokens.length === 1 && queryTokens[0].length >= 3 && candidateTokens.some((token) => token.startsWith(queryTokens[0]))) return "starts";
  if (` ${normalizedValue} `.includes(` ${normalizedQuery} `)) return "contains";

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
