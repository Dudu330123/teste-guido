import { userProgressSchema } from "@/lib/validation/progress";
import type { UserProgress } from "@/types/progress";

const STORAGE_PREFIX = "guido:progress:";

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface EnumerableStorageLike extends StorageLike {
  readonly length: number;
  key(index: number): string | null;
}

function keyFor(guideId: string) {
  return `${STORAGE_PREFIX}${guideId}`;
}

export function saveProgress(storage: StorageLike, progress: UserProgress): boolean {
  const parsed = userProgressSchema.safeParse(progress);
  if (!parsed.success) return false;

  try {
    storage.setItem(keyFor(progress.guideId), JSON.stringify(parsed.data));
    return true;
  } catch {
    return false;
  }
}

export function loadProgress(storage: StorageLike, guideId: string): UserProgress | null {
  try {
    const raw = storage.getItem(keyFor(guideId));
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    const result = userProgressSchema.safeParse(parsed);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

export function clearProgress(storage: StorageLike, guideId: string): boolean {
  try {
    storage.removeItem(keyFor(guideId));
    return true;
  } catch {
    return false;
  }
}

/**
 * Recupera somente registros pertencentes ao Guido e validados pelo mesmo
 * contrato usado no salvamento. Isso evita exibir conteúdo arbitrário que
 * outro script ou uma extensão tenha colocado no armazenamento do navegador.
 */
export function listProgress(storage: EnumerableStorageLike): UserProgress[] {
  const progressEntries: UserProgress[] = [];

  try {
    for (let index = 0; index < storage.length; index += 1) {
      const storageKey = storage.key(index);
      if (!storageKey?.startsWith(STORAGE_PREFIX)) continue;

      const guideId = storageKey.slice(STORAGE_PREFIX.length);
      const progress = loadProgress(storage, guideId);
      if (progress?.guideId === guideId) progressEntries.push(progress);
    }
  } catch {
    return [];
  }

  return progressEntries.sort((first, second) =>
    second.lastAccessedAt.localeCompare(first.lastAccessedAt),
  );
}
