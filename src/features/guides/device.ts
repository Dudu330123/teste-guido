import type { OperatingSystem } from "@/types/content";

export const OS_STORAGE_KEY = "guido:preferred-os";

export function detectOperatingSystem(userAgent: string): OperatingSystem | null {
  const normalized = userAgent.toLowerCase();
  if (normalized.includes("android")) return "android";
  if (/iphone|ipad|ipod/.test(normalized)) return "ios";
  return null;
}

export function readOperatingSystem(storage: Pick<Storage, "getItem">): OperatingSystem | null {
  try {
    const value = storage.getItem(OS_STORAGE_KEY);
    return value === "android" || value === "ios" ? value : null;
  } catch {
    return null;
  }
}

export function saveOperatingSystem(storage: Pick<Storage, "setItem">, value: OperatingSystem) {
  try {
    storage.setItem(OS_STORAGE_KEY, value);
    return true;
  } catch {
    return false;
  }
}
