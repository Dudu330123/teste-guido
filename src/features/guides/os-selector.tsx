"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { OperatingSystem } from "@/types/content";
import { detectOperatingSystem, readOperatingSystem, saveOperatingSystem } from "./device";

interface OsSelectorProps {
  taskSlug: string;
  applicationOptions?: Array<{ slug: string; name: string }>;
  initialApplicationSlug?: string;
  /**
   * Permite dividir a escolha em duas telas. O roteiro salva o aparelho e
   * entrega a próxima etapa (por exemplo, a seleção do banco) para a rota
   * informada, sem duplicar a lógica de detecção e persistência do aparelho.
   */
  nextPath?: string;
  returnTo?: string;
}

function DeviceIcon({ operatingSystem }: { operatingSystem: OperatingSystem }) {
  if (operatingSystem === "ios") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="size-8 fill-current">
        <path d="M17.05 12.54c-.02-2.27 1.85-3.36 1.94-3.41a4.18 4.18 0 0 0-3.29-1.78c-1.39-.15-2.73.83-3.44.83-.71 0-1.81-.81-2.98-.79a4.4 4.4 0 0 0-3.7 2.25c-1.6 2.77-.4 6.84 1.14 9.08.77 1.1 1.68 2.32 2.88 2.28 1.16-.05 1.6-.74 3-.74 1.39 0 1.79.74 3 .71 1.25-.02 2.04-1.1 2.78-2.2a9 9 0 0 0 1.27-2.55 3.94 3.94 0 0 1-2.6-3.68ZM14.79 5.88a3.9 3.9 0 0 0 .9-2.8 4.04 4.04 0 0 0-2.6 1.35 3.76 3.76 0 0 0-.93 2.7 3.33 3.33 0 0 0 2.63-1.25Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-8 fill-none stroke-current stroke-2">
      <rect x="6" y="2.5" width="12" height="19" rx="2.5" />
      <path d="M10 5h4M11 18.5h2" strokeLinecap="round" />
    </svg>
  );
}

export function OsSelector({ taskSlug, applicationOptions = [], initialApplicationSlug, nextPath, returnTo }: OsSelectorProps) {
  const router = useRouter();
  const [operatingSystem, setOperatingSystem] = useState<OperatingSystem>("android");
  const [applicationSlug, setApplicationSlug] = useState(initialApplicationSlug ?? applicationOptions[0]?.slug ?? "");

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
        const search = new URLSearchParams({ os: operatingSystem });
        if (nextPath) {
          if (returnTo) search.set("returnTo", returnTo);
          router.push(`${nextPath}?${search}`);
          return;
        }
        if (applicationSlug) search.set("app", applicationSlug);
        if (returnTo) search.set("returnTo", returnTo);
        router.push(`/guias/${encodeURIComponent(taskSlug)}?${search}`);
      }}
    >
      {applicationOptions.length > 0 && (
        <label htmlFor="guide-application" className="block text-2xl font-bold">
          Qual aplicativo você usa?
          <select
            id="guide-application"
            value={applicationSlug}
            onChange={(event) => setApplicationSlug(event.target.value)}
            required
            className="glass-control mt-3 min-h-14 w-full rounded-xl px-4 text-lg"
          >
            {applicationOptions.map((application) => (
              <option key={application.slug} value={application.slug}>{application.name}</option>
            ))}
          </select>
        </label>
      )}
      <fieldset>
        <legend className={`${applicationOptions.length ? "mt-7" : ""} text-2xl font-bold`}>Qual celular você usa?</legend>
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
              <span className="text-[var(--primary)]" aria-hidden="true"><DeviceIcon operatingSystem={option} /></span>
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
