"use client";

/**
 * DevicePickerCard
 *
 * Cartão branco centralizado para a tela de escolha do celular.
 * Exibe Samsung e iPhone lado a lado com imagens grandes, área de toque
 * confortável, estado selecionado explícito (borda azul + check) e um único
 * botão "Continuar" que abre o guia no leitor.
 *
 * Design otimizado para o público idoso e para caber em 1366×768 sem scroll.
 */

import Image from "next/image";
import { type KeyboardEvent } from "react";

interface Device {
  id:    string;
  name:  string;
  image: string;
}

interface DevicePickerCardProps {
  devices:         Device[];
  selectedDeviceId: string;
  onSelectDevice:  (id: string) => void;
  /** Disparado ao clicar em "Continuar". */
  onContinue:      () => void;
  continueDisabled?: boolean;
}

export function DevicePickerCard({
  devices,
  selectedDeviceId,
  onSelectDevice,
  onContinue,
  continueDisabled = false,
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
      document.getElementById(`device-picker-${next.id}`)?.focus();
    });
  };

  return (
    <div className="device-picker-card">

      {/* ── Cabeçalho ─────────────────────────────────────────────── */}
      <h1 className="device-picker-title" id="device-picker-heading">
        Qual é o seu celular?
      </h1>
      <p className="device-picker-subtitle">
        Escolha o tipo do seu aparelho.
      </p>

      {/* ── Opções ────────────────────────────────────────────────── */}
      <div
        className="device-picker-options"
        role="radiogroup"
        aria-labelledby="device-picker-heading"
      >
        {devices.map((device, index) => {
          const selected = device.id === selectedDeviceId;
          return (
            <label
              key={device.id}
              className={`device-picker-option${selected ? " is-selected" : ""}`}
              htmlFor={`device-picker-${device.id}`}
            >
              {/* Input visualmente oculto, presente para a.11y */}
              <input
                id={`device-picker-${device.id}`}
                type="radio"
                name="device-picker"
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

              {/* Imagem */}
              <div className="device-picker-image-wrap">
                <Image
                  src={device.image}
                  alt={`Celular ${device.name}`}
                  width={140}
                  height={220}
                  priority={index === 0}
                  className="device-picker-image"
                />
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
