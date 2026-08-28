import type { OperatingSystem } from "@/types/content";

export type DevicePlatform = "android" | "ios";

export interface DeviceOption {
  id: string;
  name: string;
  os: OperatingSystem;
  platform: DevicePlatform;
  image: string;
}

/**
 * Opções de aparelho que possuem fluxo de guia suportado pelo produto.
 *
 * O conteúdo dos guias varia por sistema operacional, não por fabricante.
 * Enquanto não houver imagens específicas para cada modelo, os aparelhos
 * Android usam a silhueta local já aprovada para Android.
 */
export const deviceOptions: DeviceOption[] = [
  { id: "samsung", name: "Samsung", os: "android", platform: "android", image: "/images/devices/samsung.png" },
  { id: "moto-g", name: "Moto G", os: "android", platform: "android", image: "/images/devices/samsung.png" },
  { id: "lg", name: "LG", os: "android", platform: "android", image: "/images/devices/samsung.png" },
  { id: "xiaomi", name: "Xiaomi", os: "android", platform: "android", image: "/images/devices/samsung.png" },
  { id: "realme", name: "Realme", os: "android", platform: "android", image: "/images/devices/samsung.png" },
  { id: "iphone", name: "iPhone", os: "ios", platform: "ios", image: "/images/devices/iphone.png" },
];

/** Escolhe dois aparelhos sem executar aleatoriedade durante o SSR. */
export function randomDevicePair(options: readonly DeviceOption[] = deviceOptions): DeviceOption[] {
  const shuffled = [...options];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const current = shuffled[index];
    const replacement = shuffled[swapIndex];
    if (!current || !replacement) continue;
    shuffled[index] = replacement;
    shuffled[swapIndex] = current;
  }
  return shuffled.slice(0, 2);
}

/** Mantém o aparelho escolhido e sorteia um companheiro para a tela principal. */
export function pairWithDevice(selected: DeviceOption, options: readonly DeviceOption[] = deviceOptions): DeviceOption[] {
  const companion = randomDevicePair(options.filter((option) => option.id !== selected.id))[0];
  return companion ? [selected, companion] : [selected];
}
