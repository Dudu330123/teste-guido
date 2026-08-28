const SEARCH_ALIASES: Record<string, string> = {
  pok: "pix",
  poki: "pix",
};

export function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((term) => SEARCH_ALIASES[term] ?? term)
    .join(" ");
}

export function scoreSearch(value: string, query: string) {
  const normalizedValue = normalizeSearch(value);
  const normalizedQuery = normalizeSearch(query);
  if (!normalizedQuery) return 0;
  if (normalizedValue.includes(normalizedQuery)) return 100 + normalizedQuery.length;

  const terms = normalizedQuery.split(/\s+/).filter(Boolean);
  if (!terms.every((term) => normalizedValue.includes(term))) return 0;
  return terms.reduce((score, term) => score + 10 + term.length, 0);
}

export function rankSearch<T>(items: T[], query: string, getText: (item: T) => string, limit: number) {
  return items
    .map((item, index) => ({ item, index, score: scoreSearch(getText(item), query) }))
    .filter((result) => result.score > 0)
    .sort((first, second) => second.score - first.score || first.index - second.index)
    .slice(0, limit)
    .map((result) => result.item);
}
