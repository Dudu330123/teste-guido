"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export interface TaskSwitcherOption {
  id: string;
  slug: string;
  title: string;
  availability?: string;
}

interface TaskSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (task: TaskSwitcherOption) => void;
  currentSlug: string;
  applicationName: string;
  applicationLogoPath?: string | null;
  tasks: TaskSwitcherOption[];
}

export function TaskSwitcherModal({
  isOpen,
  onClose,
  onSelect,
  currentSlug,
  applicationName,
  applicationLogoPath,
  tasks,
}: TaskSwitcherModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
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
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
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
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={modalRef}
      className="home-bank-modal-backdrop task-bank-modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-switcher-title"
        aria-describedby="task-switcher-desc"
        className="home-bank-modal task-bank-modal"
      >
        <header>
          <div>
            <h2 id="task-switcher-title">Trocar de tarefa</h2>
            <p id="task-switcher-desc">
              Escolha o que você quer fazer no <strong>{applicationName}</strong>.
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Fechar lista de tarefas"
            className="home-modal-close"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>
        </header>

        <div className="home-bank-modal-list">
          {tasks.map((task) => {
            const isSelected = task.slug === currentSlug;

            return (
              <button
                key={task.slug}
                type="button"
                onClick={() => onSelect(task)}
                className={`home-bank-modal-option ${isSelected ? "is-selected" : ""}`}
                aria-pressed={isSelected}
              >
                <span className="home-application-mark" aria-hidden="true">
                  {applicationLogoPath ? (
                    <Image
                      src={applicationLogoPath}
                      alt=""
                      width={44}
                      height={44}
                      unoptimized
                    />
                  ) : (
                    <span>{applicationName.slice(0, 2).toUpperCase()}</span>
                  )}
                </span>
                <span className="task-bank-modal-option-info">
                  <span className="task-bank-modal-option-name">{task.title}</span>
                  {isSelected && (
                    <span className="task-bank-modal-current-badge">Tarefa atual</span>
                  )}
                </span>
                {isSelected ? (
                  <span aria-hidden="true" className="task-bank-modal-check">
                    <svg viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                ) : (
                  <span aria-hidden="true" className="home-card-arrow">
                    →
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>
    </div>,
    document.body,
  );
}
