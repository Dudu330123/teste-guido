"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { OperatingSystem } from "@/types/content";
import { detectOperatingSystem, readOperatingSystem, saveOperatingSystem } from "./device";

interface OsSelectorProps {
  taskSlug: string;
  applicationOptions?: Array<{ slug: string; name: string }>;
  returnTo?: string;
}

export function OsSelector({ taskSlug, applicationOptions = [], returnTo }: OsSelectorProps) {
  const router = useRouter();
  const [operatingSystem, setOperatingSystem] = useState<OperatingSystem>("android");
  const [applicationSlug, setApplicationSlug] = useState(applicationOptions[0]?.slug ?? "");

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
