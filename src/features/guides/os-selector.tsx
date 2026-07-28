"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { OperatingSystem } from "@/types/content";
import { detectOperatingSystem, readOperatingSystem, saveOperatingSystem } from "./device";

export function OsSelector() {
  const router = useRouter();
  const [operatingSystem, setOperatingSystem] = useState<OperatingSystem>("android");
  const [suggestion, setSuggestion] = useState<"saved" | "detected" | "default">("default");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const saved = readOperatingSystem(window.localStorage);
      const detected = detectOperatingSystem(window.navigator.userAgent);
      if (saved) {
        setOperatingSystem(saved);
        setSuggestion("saved");
      } else if (detected) {
        setOperatingSystem(detected);
        setSuggestion("detected");
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const suggestionText = {
    saved: "Usamos a escolha salva neste navegador. Confirme ou altere abaixo.",
    detected: "Fizemos uma sugestão pelo navegador. Confirme ou altere abaixo.",
    default: "Não identificamos seu aparelho. Escolha uma opção abaixo.",
  }[suggestion];

  return (
    <form
      className="mt-7"
      onSubmit={(event) => {
        event.preventDefault();
        saveOperatingSystem(window.localStorage, operatingSystem);
        router.push(`/guias/pagar-boleto?os=${operatingSystem}`);
      }}
    >
      <fieldset>
        <legend className="text-2xl font-bold">Qual celular você usa?</legend>
        <p className="mt-2">{suggestionText}</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {(["android", "ios"] as const).map((option) => (
            <label key={option} className={`flex min-h-20 cursor-pointer items-center gap-4 rounded-2xl border-2 bg-white p-5 text-xl font-bold ${operatingSystem === option ? "border-[var(--primary)]" : "border-[var(--border)]"}`}>
              <input
                type="radio"
                name="operating-system"
                value={option}
                checked={operatingSystem === option}
                onChange={() => setOperatingSystem(option)}
                className="size-6 accent-[var(--primary)]"
              />
              {option === "android" ? "Android" : "iPhone (iOS)"}
              {operatingSystem === option && <span className="ml-auto text-base text-[var(--primary)]">Selecionado</span>}
            </label>
          ))}
        </div>
      </fieldset>
      <button type="submit" className="mt-6 min-h-14 w-full bg-[var(--primary)] px-6 py-3 text-xl font-bold text-white sm:w-auto">
        Confirmar e abrir o guia
      </button>
    </form>
  );
}
