"use client";

import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { otherApps, type OtherApp } from "@/data/other-apps";

interface OtherAppsModalProps {
  onClose: () => void;
  onSelectApp: (app: OtherApp) => void;
}

export function OtherAppsModal({ onClose, onSelectApp }: OtherAppsModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;

    const backgroundElements = Array.from(document.body.children).filter(
      (element) => element !== modal
    ) as HTMLElement[];

    const previousStates = backgroundElements.map((element) => ({
      element,
      ariaHidden: element.getAttribute("aria-hidden"),
      inert: element.inert,
    }));

    backgroundElements.forEach((element) => {
      element.inert = true;
      element.setAttribute("aria-hidden", "true");
    });

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus({ preventScroll: true });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = Array.from(
        modal.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
        )
      );
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

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousStates.forEach(({ element, ariaHidden, inert }) => {
        element.inert = inert;
        if (ariaHidden === null) element.removeAttribute("aria-hidden");
        else element.setAttribute("aria-hidden", ariaHidden);
      });
    };
  }, [onClose]);

  return createPortal(
    <div
      ref={modalRef}
      className="home-bank-modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="other-apps-modal-title"
        className="home-bank-modal"
      >
        <header>
          <div>
            <h2 id="other-apps-modal-title">Escolha seu aplicativo</h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Fechar lista de aplicativos"
            className="home-modal-close"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>
        </header>

        <div className="home-bank-modal-list">
          {otherApps.map((app) => (
            <button
              key={app.id}
              type="button"
              onClick={() => onSelectApp(app)}
              className="home-bank-modal-option"
            >
              <span className="home-application-mark flex items-center justify-center" aria-hidden="true">
                {app.icon}
              </span>
              <span className="font-extrabold text-lg">{app.name}</span>
              <span aria-hidden="true" className="home-card-arrow">
                →
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>,
    document.body
  );
}
