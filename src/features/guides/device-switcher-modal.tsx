"use client";

import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { OperatingSystem } from "@/types/content";
import { DevicePickerCard } from "./device-picker-card";
import { deviceOptions, type DeviceOption } from "./device-options";

interface DeviceSwitcherModalProps {
  currentOperatingSystem: OperatingSystem;
  currentDeviceId?: string;
  taskSlug: string;
  applicationSlug?: string;
  returnTo?: string;
  onContinue?: (device: DeviceOption) => void;
  continueDisabled?: boolean;
  onClose: () => void;
}

function guideHref(taskSlug: string, operatingSystem: OperatingSystem, applicationSlug?: string, returnTo?: string) {
  const search = new URLSearchParams({ os: operatingSystem });
  if (applicationSlug && applicationSlug !== "banco-demonstracao") search.set("app", applicationSlug);
  if (returnTo) search.set("returnTo", returnTo);
  return `/guias/${encodeURIComponent(taskSlug)}?${search.toString()}`;
}

export function DeviceSwitcherModal({
  currentOperatingSystem,
  currentDeviceId,
  taskSlug,
  applicationSlug,
  returnTo,
  onContinue,
  continueDisabled = false,
  onClose,
}: DeviceSwitcherModalProps) {
  const router = useRouter();
  const modalRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [selectedDeviceId, setSelectedDeviceId] = useState(() => {
    const currentDevice = deviceOptions.find((option) => option.id === currentDeviceId);
    return currentDevice?.os === currentOperatingSystem
      ? currentDevice.id
      : currentOperatingSystem === "ios" ? "iphone" : "samsung";
  });

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus({ preventScroll: true });

    const closeWithEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const modal = modalRef.current;
      if (!modal) return;
      const focusable = Array.from(modal.querySelectorAll<HTMLElement>("button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex='-1'])"));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", closeWithEscape);
    return () => {
      document.removeEventListener("keydown", closeWithEscape);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus({ preventScroll: true });
    };
  }, [onClose]);

  const continueWithSelectedDevice = () => {
    const device = deviceOptions.find((option) => option.id === selectedDeviceId);
    if (!device) return;
    if (onContinue) {
      onContinue(device);
      return;
    }
    router.push(guideHref(taskSlug, device.os, applicationSlug, returnTo));
  };

  return createPortal(
    <div
      className="device-switcher-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        ref={modalRef}
        className="device-switcher-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="device-switcher-heading"
      >
        <button ref={closeRef} type="button" className="device-switcher-close" onClick={onClose} aria-label="Fechar escolha de celular">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="m6 6 12 12M18 6 6 18" />
          </svg>
        </button>
        <DevicePickerCard
          devices={deviceOptions}
          selectedDeviceId={selectedDeviceId}
          onSelectDevice={setSelectedDeviceId}
          onContinue={continueWithSelectedDevice}
          continueDisabled={continueDisabled}
          title="Escolha o seu celular"
          subtitle="Selecione o aparelho para continuar com o guia apropriado."
          headingId="device-switcher-heading"
          inputIdPrefix="device-switcher"
          inputName="device-switcher"
        />
      </section>
    </div>,
    document.body,
  );
}
