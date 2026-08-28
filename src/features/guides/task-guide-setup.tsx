"use client";

/**
 * TaskGuideSetup
 *
 * Tela de configuração rápida antes de abrir o guia.
 *
 * Layout: coluna única centralizada.
 *   - Breadcrumb compacto acima do cartão (logo + app > tarefa)
 *   - DevicePickerCard como foco principal
 *   - Aplicativo já definido pela etapa anterior e exibido no breadcrumb
 *
 * Removidos intencionalmente desta tela:
 *   - Sidebar esquerda (logo, breadcrumb, seletor de banco como coluna separada)
 *   - Bloco "Use com segurança" (avisos existem no leitor do guia)
 *   - Botão de favorito
 *   - Indicadores "Agora"/"Depois" / "Etapa 1 de 2"
 *
 * Preservados:
 *   - Seleção Samsung/iPhone, saveOperatingSystem e contexto do aplicativo
 *   - Navegação por teclado (setas ←→↑↓), radiogroup, foco visível
 *   - Rota /guias/[slug]?os=...&app=...
 */

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { OperatingSystem } from "@/types/content";
import { detectOperatingSystem, readOperatingSystem, saveOperatingSystem } from "./device";
import { DevicePickerCard } from "./device-picker-card";

interface ApplicationOption { slug: string; name: string; logoPath: string | null }
interface TaskGuideSetupProps {
  taskId:              string;
  taskSlug:            string;
  taskTitle:           string;
  /** Passed by page.tsx — not displayed here (single focus: pick a device). */
  description:         string;
  /** Passed by page.tsx — safety tips live in the guide reader, not here. */
  safetyWarning:       string;
  application:         ApplicationOption;
  applicationOptions?: ApplicationOption[];
  selectedApplicationSlug?: string;
  canContinue?: boolean;
  returnTo?: string;
}

/** Supported devices. Order determines visual position. */
const DEVICES: Array<{ id: string; name: string; os: OperatingSystem; image: string }> = [
  { id: "samsung", name: "Samsung", os: "android", image: "/images/devices/samsung.png" },
  { id: "iphone",  name: "iPhone",  os: "ios",     image: "/images/devices/iphone.png"  },
];

export function TaskGuideSetup({
  taskId,
  taskSlug,
  taskTitle,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  description: _description,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  safetyWarning: _safetyWarning,
  application,
  applicationOptions = [],
  selectedApplicationSlug,
  canContinue = true,
  returnTo,
}: TaskGuideSetupProps) {
  const router = useRouter();

  /* ── State ─────────────────────────────────────────────────────────── */
  const options = applicationOptions.length ? applicationOptions : [application];
  const applicationSlug = options.find((item) => item.slug === selectedApplicationSlug)?.slug ?? options[0]?.slug ?? application.slug;
  const [deviceId, setDeviceId] = useState("samsung");

  const selectedApplication =
    options.find((item) => item.slug === applicationSlug) ?? application;
  const device = DEVICES.find((item) => item.id === deviceId) ?? DEVICES[0]!;

  /* ── Restore saved preference ──────────────────────────────────────── */
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const saved =
        readOperatingSystem(window.localStorage) ??
        detectOperatingSystem(window.navigator.userAgent);
      if (saved === "ios") setDeviceId("iphone");
    }, 0);
    return () => window.clearTimeout(timer);
  }, [taskId]);

  /* ── Navigation ────────────────────────────────────────────────────── */
  const openGuide = () => {
    if (!canContinue) return;
    saveOperatingSystem(window.localStorage, device.os);
    const search = new URLSearchParams({ os: device.os });
    if (applicationOptions.length) search.set("app", applicationSlug);
    if (returnTo) search.set("returnTo", returnTo);
    router.push(`/guias/${encodeURIComponent(taskSlug)}?${search}`);
  };

  /* ── Render ────────────────────────────────────────────────────────── */
  return (
    <main className="task-setup-page">
      <div className="task-setup-content">

        {/* ── Compact breadcrumb ──────────────────────────────────── */}
        <nav className="task-setup-crumb" aria-label="Contexto da tarefa">
          {selectedApplication.logoPath ? (
            <Image
              src={selectedApplication.logoPath}
              alt=""
              width={28}
              height={28}
              unoptimized
              className="task-setup-crumb-icon"
            />
          ) : (
            <span className="task-setup-crumb-icon task-setup-crumb-icon--fallback" aria-hidden="true">G</span>
          )}
          <span className="task-setup-crumb-app">{selectedApplication.name}</span>
          <span className="task-setup-crumb-sep" aria-hidden="true">›</span>
          <span className="task-setup-crumb-task">{taskTitle}</span>
        </nav>

        {/* ── Main card: device selection ─────────────────────────── */}
        <DevicePickerCard
          devices={DEVICES}
          selectedDeviceId={deviceId}
          onSelectDevice={setDeviceId}
          onContinue={openGuide}
          continueDisabled={!canContinue}
        />

      </div>
    </main>
  );
}
