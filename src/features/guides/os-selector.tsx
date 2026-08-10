"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { OperatingSystem } from "@/types/content";
import { detectOperatingSystem, readOperatingSystem, saveOperatingSystem } from "./device";

export function OsSelector() {
  const router = useRouter();
  const [operatingSystem, setOperatingSystem] = useState<OperatingSystem>("android");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const saved = readOperatingSystem(window.localStorage);
      const detected = detectOperatingSystem(window.navigator.userAgent);
      if (saved) {
        setOperatingSystem(saved);
      } else if (detected) {
        setOperatingSystem(detected);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <form
      className="glass-panel mt-7 rounded-3xl p-6 sm:p-7"
      onSubmit={(event) => {
        event.preventDefault();
        saveOperatingSystem(window.localStorage, operatingSystem);
        router.push(`/guias/pagar-boleto?os=${operatingSystem}`);
      }}
    >
      <fieldset>
        <legend className="text-2xl font-bold">Qual celular você usa?</legend>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {(["ios", "android"] as const).map((option) => (
            <label key={option} className={`glass-control flex min-h-20 cursor-pointer items-center gap-4 rounded-2xl p-5 text-xl font-bold ${operatingSystem === option ? "border-[var(--primary)]" : ""}`}>
              <input
                type="radio"
                name="operating-system"
                value={option}
                checked={operatingSystem === option}
                onChange={() => setOperatingSystem(option)}
                className="size-6 accent-[var(--primary)]"
              />
              {option === "ios" ? "iPhone" : "Outro"}
              {operatingSystem === option && <span className="ml-auto text-base text-[var(--primary)]">Selecionado</span>}
            </label>
          ))}
        </div>
      </fieldset>
      <button type="submit" className="primary-action mt-6 min-h-14 w-full px-6 py-3 text-xl font-bold sm:w-auto">
        Próximo
      </button>
    </form>
  );
}
