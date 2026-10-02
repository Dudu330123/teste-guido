"use client";

export type GuidoPositionPreference = "padrao" | "acenando" | "comemorando" | "lendo";
export type GuidoColorPreference = "blue" | "purple" | "green" | "yellow" | "red" | "orange" | "bicolor";

export const guidoPositionStorageKey = "guido-position";
export const guidoColorStorageKey = "guido-color";

export const guidoPositionLabels: Record<GuidoPositionPreference, string> = {
  padrao: "Pose padrão",
  acenando: "Guido acenando",
  comemorando: "Guido comemorando",
  lendo: "Guido lendo",
};

export const guidoPositionImages: Record<GuidoPositionPreference, string> = {
  padrao: "/images/home/mascote-guido-dark.webp",
  acenando: "/images/home/guido-poses/guido-acenando-transparent.webp",
  comemorando: "/images/home/guido-poses/guido-comemorando-transparent.webp",
  lendo: "/images/home/guido-poses/guido-lendo-transparent.webp",
};

export const guidoBicolorImage = "/images/home/mascote-guido-bicolor.webp";

export const guidoBicolorPositionImages: Record<GuidoPositionPreference, string> = {
  padrao: guidoBicolorImage,
  acenando: "/images/home/guido-poses/guido-acenando-bicolor.webp",
  comemorando: "/images/home/guido-poses/guido-comemorando-bicolor.webp",
  lendo: "/images/home/guido-poses/guido-lendo-bicolor.webp",
};

export function isGuidoColorPreference(value: string | null | undefined): value is GuidoColorPreference {
  return value === "blue" || value === "purple" || value === "green" || value === "yellow" || value === "red" || value === "orange" || value === "bicolor";
}

export function readGuidoColorPreference(): GuidoColorPreference {
  if (typeof window === "undefined") return "blue";
  const stored = window.localStorage.getItem(guidoColorStorageKey);
  return isGuidoColorPreference(stored) ? stored : "blue";
}

export function isGuidoPositionPreference(value: string | null | undefined): value is GuidoPositionPreference {
  return value === "padrao" || value === "acenando" || value === "comemorando" || value === "lendo";
}

export function readGuidoPositionPreference(): GuidoPositionPreference {
  if (typeof window === "undefined") return "padrao";
  const stored = window.localStorage.getItem(guidoPositionStorageKey);
  return isGuidoPositionPreference(stored) ? stored : "padrao";
}

export function applyGuidoPositionPreference(position: GuidoPositionPreference) {
  document.documentElement.dataset.guidoPosition = position;
  window.localStorage.setItem(guidoPositionStorageKey, position);
  window.dispatchEvent(new CustomEvent("guido-position-change", { detail: position }));
}
