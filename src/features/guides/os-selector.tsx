"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { OperatingSystem } from "@/types/content";
import { detectOperatingSystem, readOperatingSystem, saveOperatingSystem } from "./device";

interface OsSelectorProps {
  taskSlug: string;
  applicationOptions?: Array<{ slug: string; name: string }>;
}

const deviceOptions: Array<{
  operatingSystem: OperatingSystem;
  label: string;
  description: string;
  imagePath: string;
  imageWidth: number;
  imageHeight: number;
}> = [
  {
    operatingSystem: "ios",
    label: "iPhone",
    description: "Celulares Apple",
    imagePath: "/images/devices/iphone-frame.png",
    imageWidth: 1024,
    imageHeight: 1536,
  },
  {
    operatingSystem: "android",
    label: "Android",
    description: "Samsung, Motorola, Xiaomi e outros",
    imagePath: "/images/devices/android-frame.png",
    imageWidth: 1000,
    imageHeight: 2000,
  },
];

export function OsSelector({ taskSlug, applicationOptions = [] }: OsSelectorProps) {
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
          {deviceOptions.map((option) => (
            <label
              key={option.operatingSystem}
              className={`glass-control flex min-h-52 cursor-pointer flex-col items-center rounded-2xl p-5 text-center transition-colors focus-within:outline focus-within:outline-4 focus-within:outline-[var(--primary)] focus-within:outline-offset-3 sm:min-h-56 ${operatingSystem === option.operatingSystem ? "border-2 border-[var(--primary)] bg-[var(--surface-soft)]" : ""}`}
            >
              <input
                type="radio"
                name="operating-system"
                value={option.operatingSystem}
                checked={operatingSystem === option.operatingSystem}
                onChange={() => setOperatingSystem(option.operatingSystem)}
                aria-describedby={`operating-system-${option.operatingSystem}-description`}
                className="sr-only"
              />
              {/* A moldura orienta visualmente sem substituir o texto ou a escolha acessível. */}
              <Image
                src={option.imagePath}
                alt=""
                width={option.imageWidth}
                height={option.imageHeight}
                sizes="(max-width: 640px) 7rem, 8rem"
                className="h-28 w-auto object-contain sm:h-32"
              />
              <span className="mt-3 text-xl font-bold">{option.label}</span>
              <span id={`operating-system-${option.operatingSystem}-description`} className="mt-1 text-base font-medium text-[var(--muted)]">
                {option.description}
              </span>
              {operatingSystem === option.operatingSystem && <span className="mt-3 text-base font-bold text-[var(--primary)]">Selecionado</span>}
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
