"use client";

/**
 * DevicePickerCard
 *
 * Cartão branco centralizado para a tela de escolha do celular.
 * Exibe as plataformas suportadas com ícones grandes, área de toque confortável,
 * estado selecionado explícito (borda azul + check) e um único botão
 * "Continuar" que abre o guia no leitor.
 *
 * Design otimizado para o público idoso, com grade responsiva para as duas
 * plataformas suportadas.
 */

import Image from "next/image";
import { type KeyboardEvent } from "react";
import type { DevicePlatform } from "./device-options";

interface Device {
  id:    string;
  name:  string;
  platform: DevicePlatform;
}

function PlatformIcon({ platform }: { platform: DevicePlatform }) {
  if (platform === "android") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
        <path d="M7.4 9.4h9.2a1.5 1.5 0 0 1 1.5 1.5v6.2a1.5 1.5 0 0 1-1.5 1.5H7.4a1.5 1.5 0 0 1-1.5-1.5v-6.2a1.5 1.5 0 0 1 1.5-1.5Z" />
        <path d="M5.1 10h13.8v1.8H5.1zM8.2 7.6h7.6a1.6 1.6 0 0 1 1.6 1.6H6.6a1.6 1.6 0 0 1 1.6-1.6ZM8.1 6.7 6.8 4.5l.9-.5L9 6.2l-.9.5Zm7.8 0-.9-.5 1.3-2.2.9.5-1.3 2.2Z" />
        <circle cx="9.4" cy="10.4" r=".65" fill="currentColor" />
        <circle cx="14.6" cy="10.4" r=".65" fill="currentColor" />
        <path d="M3.9 11.4h1.5v4.4a.75.75 0 0 1-1.5 0v-4.4Zm14.7 0h1.5v4.4a.75.75 0 0 1-1.5 0v-4.4ZM8.2 18.2h1.7v2.1a.85.85 0 0 1-1.7 0v-2.1Zm5.9 0h1.7v2.1a.85.85 0 0 1-1.7 0v-2.1Z" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
      <path d="M15.4 4.7c.5-.6.8-1.4.8-2.2-.8.1-1.7.5-2.2 1.1-.5.5-.9 1.4-.8 2.2.9.1 1.7-.4 2.2-1.1Zm3.1 7.8c0-2 1.6-3 1.7-3.1-.9-1.4-2.4-1.5-2.9-1.5-1.2-.1-2.3.7-2.9.7-.6 0-1.5-.7-2.5-.7-1.3 0-2.5.8-3.2 2-1.4 2.4-.4 6 1 8 .7 1 1.5 2 2.5 2 .9 0 1.3-.6 2.4-.6 1.1 0 1.4.6 2.4.6s1.7-.9 2.4-1.9c.8-1.1 1.1-2.2 1.1-2.3-.1 0-2-.8-2-3.2Z" />
    </svg>
  );
}

interface DevicePickerCardProps {
  devices:         Device[];
  selectedDeviceId: string;
  onSelectDevice:  (id: string) => void;
  /** Disparado ao clicar em "Continuar". */
  onContinue:      () => void;
  continueDisabled?: boolean;
  title?:            string;
  subtitle?:         string;
  headingId?:        string;
  inputIdPrefix?:    string;
  inputName?:        string;
}

export function DevicePickerCard({
  devices,
  selectedDeviceId,
  onSelectDevice,
  onContinue,
  continueDisabled = false,
  title = "Qual é o seu celular?",
  subtitle = "Escolha o tipo do seu aparelho.",
  headingId = "device-picker-heading",
  inputIdPrefix = "device-picker",
  inputName = "device-picker",
}: DevicePickerCardProps) {
  /**
   * Navegação por teclado no radiogroup conforme ARIA APG:
   * ←/↑ vai para o anterior, →/↓ vai para o próximo.
   */
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    const dir =
      e.key === "ArrowRight" || e.key === "ArrowDown" ? 1
      : e.key === "ArrowLeft" || e.key === "ArrowUp"  ? -1
      : 0;
    if (!dir) return;

    e.preventDefault();
    const next = devices[(index + dir + devices.length) % devices.length];
    if (!next) return;

    onSelectDevice(next.id);
    // Mover foco após a re-renderização do React.
    window.requestAnimationFrame(() => {
      document.getElementById(`${inputIdPrefix}-${next.id}`)?.focus();
    });
  };

  return (
    <div className="device-picker-card">

      {/* ── Cabeçalho ─────────────────────────────────────────────── */}
      <h1 className="device-picker-title" id={headingId}>
        {title}
      </h1>
      <p className="device-picker-subtitle">
        {subtitle}
      </p>

      {/* ── Opções ────────────────────────────────────────────────── */}
      <div
        className="device-picker-options"
        role="radiogroup"
        aria-labelledby={headingId}
      >
        {devices.map((device, index) => {
          const selected = device.id === selectedDeviceId;
          return (
            <label
              key={device.id}
              className={`device-picker-option${selected ? " is-selected" : ""}`}
              htmlFor={`${inputIdPrefix}-${device.id}`}
            >
              {/* Input visualmente oculto, presente para a.11y */}
              <input
                id={`${inputIdPrefix}-${device.id}`}
                type="radio"
                name={inputName}
                value={device.id}
                checked={selected}
                onChange={() => onSelectDevice(device.id)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                aria-label={device.name}
              />

              {/* Check / círculo no canto superior direito */}
              <span className="device-picker-check" aria-hidden="true">
                {selected ? (
                  <svg viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="12" fill="#1559c7" />
                    <path d="M7 12.5l3.5 3.5 6.5-7" stroke="white" strokeWidth="2"
                      strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="11" stroke="#c5d0de" strokeWidth="2" />
                  </svg>
                )}
              </span>

              {/* Ícone da plataforma */}
              <div className="device-picker-platform-wrap">
                <div
                  className={`device-picker-platform-icon device-picker-platform-icon--${device.platform}`}
                  role="img"
                  aria-label={`Sistema ${device.platform === "android" ? "Android" : "iOS"}`}
                >
                  {device.platform === "android" ? (
                    <Image
                      src="/images/platform/android.png"
                      alt=""
                      width={96}
                      height={96}
                      className="device-picker-platform-image"
                    />
                  ) : (
                    <PlatformIcon platform={device.platform} />
                  )}
                </div>
              </div>

              {/* Nome */}
              <span className="device-picker-name">{device.name}</span>
            </label>
          );
        })}
      </div>

      {/* ── Botão Continuar ───────────────────────────────────────── */}
      <button
        type="button"
        className="device-picker-continue"
        onClick={onContinue}
        disabled={continueDisabled}
        aria-label={`Continuar com ${devices.find((device) => device.id === selectedDeviceId)?.name ?? "celular selecionado"}`}
      >
        Continuar
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14m-5-5 5 5-5 5" />
        </svg>
      </button>

    </div>
  );
}
