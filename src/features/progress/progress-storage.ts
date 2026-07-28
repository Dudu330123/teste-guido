import { userProgressSchema } from "@/lib/validation/progress";
import type { UserProgress } from "@/types/progress";

const STORAGE_PREFIX = "guido:progress:";

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
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
