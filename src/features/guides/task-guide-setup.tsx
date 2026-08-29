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
 *   - Seleção de aparelho, saveOperatingSystem e contexto do aplicativo
 *   - Navegação por teclado (setas ←→↑↓), radiogroup, foco visível
 *   - Rota /guias/[slug]?os=...&app=...
 */

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { detectOperatingSystem, readOperatingSystem, saveOperatingSystem } from "./device";
import { DevicePickerCard } from "./device-picker-card";
import { deviceOptions, pairWithDevice, randomDevicePair, type DeviceOption } from "./device-options";

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
  const [visibleDevices, setVisibleDevices] = useState<DeviceOption[]>(() => deviceOptions.slice(0, 2));
  const [deviceId, setDeviceId] = useState("samsung");

  const selectedApplication =
    options.find((item) => item.slug === applicationSlug) ?? application;
  const device = deviceOptions.find((item) => item.id === deviceId) ?? deviceOptions[0]!;

  /* ── Restore saved preference ──────────────────────────────────────── */
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const saved =
        readOperatingSystem(window.localStorage) ??
        detectOperatingSystem(window.navigator.userAgent);
      const preferredDevice = saved === "ios" ? deviceOptions.find((item) => item.os === saved) : undefined;
      const pair = preferredDevice ? pairWithDevice(preferredDevice) : randomDevicePair();
      setVisibleDevices(pair.length === 2 ? pair : deviceOptions.slice(0, 2));
      setDeviceId(preferredDevice?.id ?? pair[0]?.id ?? "samsung");
    }, 0);
    return () => window.clearTimeout(timer);
  }, [taskId]);

  /* ── Navigation ────────────────────────────────────────────────────── */
  const goBack = () => {
    if (returnTo) {
      router.push(returnTo);
      return;
    }

    const hasInternalReferrer = (() => {
      if (!window.document.referrer) return false;
      try {
        return new URL(window.document.referrer).origin === window.location.origin;
      } catch {
        return false;
      }
    })();

    if (hasInternalReferrer && window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/");
  };

  const openGuideForDevice = (selectedDevice: DeviceOption) => {
    if (!canContinue) return;
    setDeviceId(selectedDevice.id);
    saveOperatingSystem(window.localStorage, selectedDevice.os);
    const search = new URLSearchParams({ os: selectedDevice.os });
    if (applicationOptions.length) search.set("app", applicationSlug);
    if (returnTo) search.set("returnTo", returnTo);
    router.push(`/guias/${encodeURIComponent(taskSlug)}?${search}`);
  };

  const openGuide = () => openGuideForDevice(device);

  /* ── Render ────────────────────────────────────────────────────────── */
  return (
    <main className="task-setup-page">
      <div className="task-setup-content">

        <div className="task-setup-context">
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

          <button type="button" className="task-setup-back" onClick={goBack}>
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5m7 7-7-7 7-7" />
            </svg>
            Voltar para a página anterior
          </button>

        </div>

        {/* ── Main card: device selection ─────────────────────────── */}
        <DevicePickerCard
          devices={visibleDevices}
          selectedDeviceId={deviceId}
          onSelectDevice={setDeviceId}
          onContinue={openGuide}
          continueDisabled={!canContinue}
        />

      </div>
    </main>
  );
}
