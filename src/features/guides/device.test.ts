import { beforeEach, describe, expect, it } from "vitest";
import { detectOperatingSystem, readOperatingSystem, saveOperatingSystem } from "./device";

describe("seleção de sistema operacional", () => {
  beforeEach(() => localStorage.clear());

  it("sugere Android e iOS a partir do navegador", () => {
    expect(detectOperatingSystem("Mozilla/5.0 (Linux; Android 15)")) .toBe("android");
    expect(detectOperatingSystem("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0)")) .toBe("ios");
    expect(detectOperatingSystem("Desktop browser")).toBeNull();
  });

  it("salva e permite alternar manualmente entre Android e iOS", () => {
    expect(saveOperatingSystem(localStorage, "android")).toBe(true);
    expect(readOperatingSystem(localStorage)).toBe("android");
    expect(saveOperatingSystem(localStorage, "ios")).toBe(true);
    expect(readOperatingSystem(localStorage)).toBe("ios");
  });

  it("ignora uma preferência local inválida", () => {
    localStorage.setItem("guido:preferred-os", "windows-phone");
    expect(readOperatingSystem(localStorage)).toBeNull();
  });
});
