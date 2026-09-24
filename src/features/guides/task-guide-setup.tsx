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
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getLocalApplicationLogoPath } from "@/data/applications";
import { detectOperatingSystem, readOperatingSystem, saveOperatingSystem } from "./device";
import { DevicePickerCard } from "./device-picker-card";
import { deviceOptions, type DeviceOption } from "./device-options";
import { BankSwitcherModal } from "./bank-switcher-modal";
import { TaskSwitcherModal, type TaskSwitcherOption } from "./task-switcher-modal";

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
  taskOptions?:        TaskSwitcherOption[];
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
  taskOptions,
  canContinue = true,
  returnTo,
}: TaskGuideSetupProps) {
  const router = useRouter();

  /* ── State ─────────────────────────────────────────────────────────── */
  const options = applicationOptions.length ? applicationOptions : [application];
  const [selectedAppOverride, setSelectedAppOverride] = useState<string | null>(null);
  const [prevSelectedSlug, setPrevSelectedSlug] = useState(selectedApplicationSlug);

  if (prevSelectedSlug !== selectedApplicationSlug) {
    setPrevSelectedSlug(selectedApplicationSlug);
    setSelectedAppOverride(null);
  }

  const currentAppSlug =
    selectedAppOverride
    ?? options.find((item) => item.slug === selectedApplicationSlug)?.slug
    ?? options[0]?.slug
    ?? application.slug;
  const [bankModalOpen, setBankModalOpen] = useState(false);
  const crumbButtonRef = useRef<HTMLButtonElement>(null);
  const visibleDevices = deviceOptions.slice(0, 2);
  const [deviceId, setDeviceId] = useState("iphone");

  const selectedApplication =
    options.find((item) => item.slug === currentAppSlug) ?? application;
  const selectedLogoPath =
    selectedApplication.logoPath ?? getLocalApplicationLogoPath(selectedApplication.slug);
  const hasMultipleApplications = options.length > 1;
  const device = deviceOptions.find((item) => item.id === deviceId) ?? deviceOptions[0]!;

  const isWhatsAppOrGov = selectedApplication.slug === "whatsapp" || selectedApplication.slug === "gov-br";
  const hasTaskOptions = Boolean(taskOptions && taskOptions.length > 1 && isWhatsAppOrGov);
  const [selectedTaskOverride, setSelectedTaskOverride] = useState<TaskSwitcherOption | null>(null);
  const [taskModalOpen, setTaskModalOpen] = useState(false);

  const activeTask = selectedTaskOverride
    ?? taskOptions?.find((item) => item.slug === taskSlug)
    ?? { id: taskId, slug: taskSlug, title: taskTitle, availability: canContinue ? "available" : "preparing" };

  const currentTaskSlug = activeTask.slug;
  const currentTaskTitle = activeTask.title;
  const effectiveCanContinue = hasTaskOptions ? true : canContinue;

  /* ── Restore saved preference ──────────────────────────────────────── */
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const saved =
        readOperatingSystem(window.localStorage) ??
        detectOperatingSystem(window.navigator.userAgent);
      const preferredDevice = deviceOptions.find((item) => item.os === saved);
      setDeviceId(preferredDevice?.id ?? "iphone");
    }, 0);
    return () => window.clearTimeout(timer);
  }, [taskId]);

  /* ── Bank Selection ─────────────────────────────────────────────────── */
  const handleSelectBank = (bank: ApplicationOption) => {
    setSelectedAppOverride(bank.slug);
    setBankModalOpen(false);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("app", bank.slug);
      window.history.replaceState(null, "", url.toString());
    }
    crumbButtonRef.current?.focus({ preventScroll: true });
  };

  /* ── Task Selection ─────────────────────────────────────────────────── */
  const handleSelectTask = (task: TaskSwitcherOption) => {
    setSelectedTaskOverride(task);
    setTaskModalOpen(false);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.pathname = `/tarefas/${task.slug}`;
      window.history.replaceState(null, "", url.toString());
    }
    crumbButtonRef.current?.focus({ preventScroll: true });
  };

  /* ── Navigation ────────────────────────────────────────────────────── */
  const goBack = () => {
    router.push("/");
  };

  const openGuideForDevice = (selectedDevice: DeviceOption) => {
    if (!effectiveCanContinue) return;
    setDeviceId(selectedDevice.id);
    saveOperatingSystem(window.localStorage, selectedDevice.os);
    const search = new URLSearchParams({ os: selectedDevice.os });
    if (applicationOptions.length) search.set("app", currentAppSlug);
    if (returnTo) search.set("returnTo", returnTo);
    router.push(`/guias/${encodeURIComponent(currentTaskSlug)}?${search}`);
  };

  const openGuide = () => openGuideForDevice(device);

  /* ── Render ────────────────────────────────────────────────────────── */
  return (
    <main className="task-setup-page">
      <div className="task-setup-content">

        <div className="task-setup-context">
          {/* ── Compact breadcrumb ──────────────────────────────────── */}
          {hasMultipleApplications ? (
            <button
              ref={crumbButtonRef}
              type="button"
              className="task-setup-crumb task-setup-crumb--clickable"
              onClick={() => setBankModalOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={bankModalOpen}
              aria-label={`Banco atual: ${selectedApplication.name}. Tarefa: ${taskTitle}. Clique para trocar de banco`}
              title="Clique para trocar de banco"
            >
              {selectedLogoPath ? (
                <Image
                  src={selectedLogoPath}
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
              <span className="task-setup-crumb-badge" aria-hidden="true">
                <span>Trocar</span>
                <svg viewBox="0 0 20 20" fill="currentColor" width="13" height="13" aria-hidden="true">
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
              </span>
            </button>
          ) : hasTaskOptions ? (
            <button
              ref={crumbButtonRef}
              type="button"
              className="task-setup-crumb task-setup-crumb--clickable"
              onClick={() => setTaskModalOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={taskModalOpen}
              aria-label={`Aplicativo: ${selectedApplication.name}. Tarefa atual: ${currentTaskTitle}. Clique para trocar de tarefa`}
              title="Clique para trocar de tarefa"
            >
              {selectedLogoPath ? (
                <Image
                  src={selectedLogoPath}
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
              <span className="task-setup-crumb-task">{currentTaskTitle}</span>
              <span className="task-setup-crumb-badge" aria-hidden="true">
                <span>Trocar</span>
                <svg viewBox="0 0 20 20" fill="currentColor" width="13" height="13" aria-hidden="true">
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
              </span>
            </button>
          ) : (
            <nav className="task-setup-crumb" aria-label="Contexto da tarefa">
              {selectedLogoPath ? (
                <Image
                  src={selectedLogoPath}
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
          )}

          <button
            type="button"
            className="task-setup-back"
            onClick={goBack}
            aria-label="Voltar para a página inicial"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5m7 7-7-7 7-7" />
            </svg>
            Voltar
          </button>

        </div>

        {/* ── Main card: device selection ─────────────────────────── */}
        <DevicePickerCard
          devices={visibleDevices}
          selectedDeviceId={deviceId}
          onSelectDevice={setDeviceId}
          onContinue={openGuide}
          continueDisabled={!effectiveCanContinue}
        />

        {hasMultipleApplications && (
          <BankSwitcherModal
            isOpen={bankModalOpen}
            onClose={() => setBankModalOpen(false)}
            onSelect={handleSelectBank}
            currentSlug={currentAppSlug}
            taskTitle={taskTitle}
            banks={options}
          />
        )}

        {hasTaskOptions && taskOptions && (
          <TaskSwitcherModal
            isOpen={taskModalOpen}
            onClose={() => setTaskModalOpen(false)}
            onSelect={handleSelectTask}
            currentSlug={currentTaskSlug}
            applicationName={selectedApplication.name}
            applicationLogoPath={selectedLogoPath}
            tasks={taskOptions}
          />
        )}

      </div>
    </main>
  );
}
