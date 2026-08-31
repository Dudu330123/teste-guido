"use client";

/**
 * TaskGuideSetup
 *
 * Tela de configuração rápida antes de abrir o guia.
 *
 * Layout: coluna única centralizada.
 *   - Seletor de tarefa compacto acima do cartão (logo + app > tarefa)
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
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { TaskAvailability } from "@/types/content";
import { detectOperatingSystem, readOperatingSystem, saveOperatingSystem } from "./device";
import { DevicePickerCard } from "./device-picker-card";
import { deviceOptions, pairWithDevice, randomDevicePair, type DeviceOption } from "./device-options";

interface ApplicationOption { slug: string; name: string; logoPath: string | null }
interface TaskOption { id: string; slug: string; title: string; availability: TaskAvailability }
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
  taskOptions?:       TaskOption[];
  selectedApplicationSlug?: string;
  canContinue?: boolean;
  returnTo?: string;
}

function TaskPickerIcon({ slug }: { slug: string }) {
  if (slug.includes("audio")) {
    return <svg viewBox="0 0 24 24" className="task-setup-task-option-svg"><path d="M12 4a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V7a3 3 0 0 0-3-3Z" /><path d="M6.5 11.5a5.5 5.5 0 0 0 11 0M12 17v3M9.5 20h5" /></svg>;
  }

  if (slug.includes("chamada")) {
    return <svg viewBox="0 0 24 24" className="task-setup-task-option-svg"><path d="M7.5 4.5 5 6c-.7.4-.9 1.3-.6 2 1.8 4.7 5.1 8.1 9.8 9.8.7.3 1.6 0 2-.6l1.5-2.5-3-2-1.6 1.6a12.6 12.6 0 0 1-4.5-4.5l1.6-1.6-2.7-3.7Z" /></svg>;
  }

  if (slug.includes("bloquear")) {
    return <svg viewBox="0 0 24 24" className="task-setup-task-option-svg"><circle cx="9" cy="8" r="3" /><path d="M4 18c.7-2.5 2.4-3.8 5-3.8 1.2 0 2.2.2 3 .7M15 15v-1a2 2 0 0 1 4 0v1M14 15h6v5h-6z" /></svg>;
  }

  return <svg viewBox="0 0 24 24" className="task-setup-task-option-svg"><path d="M12 3 5 6v5c0 4.6 2.8 8.2 7 10 4.2-1.8 7-5.4 7-10V6l-7-3Z" /><path d="m9 12 2 2 4-4" /></svg>;
}

function taskAvailabilityLabel(availability: TaskAvailability) {
  if (availability === "preparing") return "Em preparação";
  if (availability === "demo") return "Demonstração educativa";
  return "Guia disponível";
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
  taskOptions = [],
  selectedApplicationSlug,
  canContinue = true,
  returnTo,
}: TaskGuideSetupProps) {
  const router = useRouter();

  /* ── State ─────────────────────────────────────────────────────────── */
  const options = applicationOptions.length ? applicationOptions : [application];
  const applicationSlug = options.find((item) => item.slug === selectedApplicationSlug)?.slug ?? options[0]?.slug ?? application.slug;
  const fallbackTask: TaskOption = {
    id: taskId,
    slug: taskSlug,
    title: taskTitle,
    availability: canContinue ? "available" : "preparing",
  };
  const taskChoices = taskOptions.length ? taskOptions : [fallbackTask];
  const [visibleDevices, setVisibleDevices] = useState<DeviceOption[]>(() => deviceOptions.slice(0, 2));
  const [deviceId, setDeviceId] = useState("samsung");
  const [selectedTaskId, setSelectedTaskId] = useState(taskId);
  const [isTaskMenuOpen, setIsTaskMenuOpen] = useState(false);
  const taskPickerButtonRef = useRef<HTMLButtonElement>(null);

  const selectedApplication =
    options.find((item) => item.slug === applicationSlug) ?? application;
  const selectedTask = taskChoices.find((item) => item.id === selectedTaskId)
    ?? taskChoices.find((item) => item.slug === taskSlug)
    ?? fallbackTask;
  const selectedTaskCanContinue = selectedTask.availability !== "preparing";
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

  useEffect(() => {
    if (!isTaskMenuOpen) return;
    const closeWithEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsTaskMenuOpen(false);
        taskPickerButtonRef.current?.focus();
      }
    };
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (event.target instanceof Node && !taskPickerButtonRef.current?.parentElement?.contains(event.target)) {
        setIsTaskMenuOpen(false);
      }
    };
    window.addEventListener("keydown", closeWithEscape);
    window.addEventListener("mousedown", closeOnOutsideClick);
    return () => {
      window.removeEventListener("keydown", closeWithEscape);
      window.removeEventListener("mousedown", closeOnOutsideClick);
    };
  }, [isTaskMenuOpen]);

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
    if (!selectedTaskCanContinue) return;
    setDeviceId(selectedDevice.id);
    saveOperatingSystem(window.localStorage, selectedDevice.os);
    const search = new URLSearchParams({ os: selectedDevice.os });
    if (applicationOptions.length) search.set("app", applicationSlug);
    if (returnTo) search.set("returnTo", returnTo);
    router.push(`/guias/${encodeURIComponent(selectedTask.slug)}?${search}`);
  };

  const openGuide = () => openGuideForDevice(device);

  /* ── Render ────────────────────────────────────────────────────────── */
  return (
    <main className="task-setup-page">
      <div className="task-setup-content">

        <div className="task-setup-context">
          {/* ── Task picker ──────────────────────────────────────────── */}
          <button
            type="button"
            ref={taskPickerButtonRef}
            className="task-setup-crumb"
            onClick={() => setIsTaskMenuOpen((open) => !open)}
            aria-expanded={isTaskMenuOpen}
            aria-haspopup="menu"
            aria-controls="task-setup-task-menu"
            aria-label={`Selecionar tarefa. ${selectedApplication.name}: ${selectedTask.title}`}
          >
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
            <span className="task-setup-crumb-task">{selectedTask.title}</span>
            <span className={`task-setup-crumb-toggle${isTaskMenuOpen ? " is-open" : ""}`} aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
                <path d="m7 10 5 5 5-5" />
              </svg>
            </span>
          </button>

          {isTaskMenuOpen ? (
            <div id="task-setup-task-menu" className="task-setup-task-menu" role="menu" aria-label={`Tarefas de ${selectedApplication.name}`}>
              <div className="task-setup-task-menu-heading">
                <strong>Trocar de tarefa</strong>
                <span>Escolha outra opção de {selectedApplication.name}.</span>
              </div>
              <div className="task-setup-task-options">
                {taskChoices.map((task) => {
                  const isSelected = task.id === selectedTask.id;
                  return (
                    <button
                      key={task.id}
                      type="button"
                      role="menuitemradio"
                      aria-checked={isSelected}
                      className={`task-setup-task-option${isSelected ? " is-selected" : ""}`}
                      onClick={() => {
                        setSelectedTaskId(task.id);
                        setIsTaskMenuOpen(false);
                        taskPickerButtonRef.current?.focus();
                      }}
                    >
                      <span className={`task-setup-task-option-icon task-setup-task-option-icon--${selectedApplication.slug}`} aria-hidden="true">
                        <TaskPickerIcon slug={task.slug} />
                      </span>
                      <span className="task-setup-task-option-copy">
                        <strong>{task.title}</strong>
                        <small>{taskAvailabilityLabel(task.availability)}</small>
                      </span>
                      <span className="task-setup-task-option-check" aria-hidden="true">
                        {isSelected ? (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5">
                            <path d="m5 12 4 4L19 6" />
                          </svg>
                        ) : null}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

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
          continueDisabled={!selectedTaskCanContinue}
        />

      </div>
    </main>
  );
}
