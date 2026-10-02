"use client";

import Image from "next/image";
import Link from "next/link";
import { createPortal } from "react-dom";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Accessibility, ArrowLeft, BookOpen, Brush, CircleHelp, Contrast, Mic, Move, Palette, Settings, Sparkles, X } from "lucide-react";
import { SessionNavigation } from "@/features/auth/session-navigation";
import { useAccessibility } from "@/features/accessibility/accessibility-context";
import { GuidoVoiceModal } from "@/features/ai/guido-voice-modal";
import { GuideRequestModal } from "@/features/ai/guide-request-modal";
import {
  applyGuidoPositionPreference,
  guidoBicolorImage,
  guidoColorStorageKey,
  guidoPositionImages,
  guidoPositionLabels,
  readGuidoPositionPreference,
  isGuidoColorPreference,
  type GuidoColorPreference,
  type GuidoPositionPreference,
} from "./guido-preferences";

type ThemePreference = "light" | "dark" | "system";
type GuideAccentPreference = "blue" | "purple" | "green" | "orange" | "yellow" | "red" | "cyan" | "gold" | "turquoise";

const storageKey = "guido-theme";
const guideAccentStorageKey = "guido-accent";

function isThemePreference(value: string | undefined | null): value is ThemePreference {
  return value === "light" || value === "dark" || value === "system";
}

function resolveTheme(preference: ThemePreference) {
  if (preference !== "system") return preference;
  return typeof window.matchMedia === "function" && window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyThemePreference(preference: ThemePreference, save = true) {
  const resolved = resolveTheme(preference);
  document.documentElement.dataset.themePreference = preference;
  document.documentElement.dataset.theme = resolved;
  document.documentElement.style.colorScheme = resolved;
  document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach((meta) => {
    meta.content = resolved === "dark" ? "#01040c" : "#eaf3fc";
    meta.removeAttribute("media");
  });
  if (save) window.localStorage.setItem(storageKey, preference);
}

function isGuideAccentPreference(value: string | undefined | null): value is GuideAccentPreference {
  return value === "blue" || value === "purple" || value === "green" || value === "orange" || value === "yellow" || value === "red" || value === "cyan" || value === "gold" || value === "turquoise";
}

function applyVisualPreference(attribute: "guidoColor" | "guideAccent", value: string, storage: string) {
  document.documentElement.dataset[attribute] = value;
  try {
    window.localStorage.setItem(storage, value);
  } catch {
    // A preferência visual também funciona quando o navegador bloqueia o armazenamento local.
  }
  if (attribute === "guidoColor") {
    window.dispatchEvent(new CustomEvent("guido-color-change", { detail: value }));
  }
}

export type HomeActivePage = "home" | "explore" | "guides";

interface HomeToolbarProps {
  activePage?: HomeActivePage;
  showAdmin?: boolean;
  /** Compact toolbar used by the step-by-step guide reader. */
  variant?: "home" | "guide";
  guideLeft?: ReactNode;
  guideActions?: ReactNode;
  onOpenVoiceAssistant?: () => void;
  onOpenGuideRequest?: () => void;
  isInternal?: boolean;
}

function ThemeToggleButton({
  onClick,
  className = "home-icon-button",
  showLabel = false,
}: {
  onClick: () => void;
  className?: string;
  showLabel?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Alternar entre modo claro e escuro"
      className={className}
      title="Alternar entre modo claro e escuro"
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="home-theme-sun size-5 fill-none" stroke="currentColor" strokeWidth="2">
        <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.64 5.64l1.42 1.42M16.94 16.94l1.42 1.42M18.36 5.64l-1.42 1.42M7.06 16.94l-1.42 1.42" strokeLinecap="round" />
        <circle cx="12" cy="12" r="4" />
      </svg>
      <svg aria-hidden="true" viewBox="0 0 24 24" className="home-theme-moon size-5 fill-none" stroke="currentColor" strokeWidth="2">
        <path d="M20.5 14.6A8.5 8.5 0 0 1 9.4 3.5 8.5 8.5 0 1 0 20.5 14.6Z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {showLabel && <span className="home-theme-bottom-text">Modo claro / escuro</span>}
    </button>
  );
}

interface HomeSettingsModalProps {
  onClose: () => void;
  onOpenHelp: () => void;
  onRequestGuide: () => void;
  onToggleTheme: () => void;
  onSetGuidoColor: (color: GuidoColorPreference) => void;
  onSetGuidoPosition: (position: GuidoPositionPreference) => void;
  onSetGuideAccent: (accent: GuideAccentPreference) => void;
  onSetEasyReading: () => void;
  guidoColor: GuidoColorPreference;
  guidoPosition: GuidoPositionPreference;
  guideAccent: GuideAccentPreference;
  easyReading: boolean;
}

const guidoColorLabels: Record<GuidoColorPreference, string> = {
  blue: "Azul",
  purple: "Roxo",
  green: "Verde",
  yellow: "Amarelo",
  red: "Vermelho",
  orange: "Laranja",
  bicolor: "Azul + Dourado",
};

const guideAccentLabels: Record<GuideAccentPreference, string> = {
  blue: "Azul",
  purple: "Roxo",
  green: "Verde",
  orange: "Laranja",
  yellow: "Amarelo",
  red: "Vermelho",
  cyan: "Ciano",
  gold: "Dourado",
  turquoise: "Turquesa",
};

function HomeSettingsModal({
  onClose,
  onOpenHelp,
  onRequestGuide,
  onToggleTheme,
  onSetGuidoColor,
  onSetGuidoPosition,
  onSetGuideAccent,
  onSetEasyReading,
  guidoColor,
  guidoPosition,
  guideAccent,
  easyReading,
}: HomeSettingsModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const backRef = useRef<HTMLButtonElement>(null);
  const appearanceOptionRef = useRef<HTMLButtonElement>(null);
  const accentOptionRef = useRef<HTMLButtonElement>(null);
  const appearanceColorRef = useRef<HTMLButtonElement>(null);
  const appearancePositionRef = useRef<HTMLButtonElement>(null);
  const [view, setView] = useState<"root" | "guidoAppearance" | "guidoColor" | "guidoPosition" | "guideAccent">("root");

  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;
    const backgroundElements = Array.from(document.body.children).filter((element) => element !== modal) as HTMLElement[];
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
        modal.querySelectorAll<HTMLElement>('button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'),
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

  useEffect(() => {
    if (view === "root") return;
    window.requestAnimationFrame(() => backRef.current?.focus({ preventScroll: true }));
  }, [view]);

  const settingOptions = [
    {
      icon: CircleHelp,
      title: "Como usar o Guido",
      description: "Aprenda a usar o Guido.",
      onClick: onOpenHelp,
    },
    {
      icon: BookOpen,
      title: "Pedir um guia",
      description: "Peça um passo a passo.",
      onClick: onRequestGuide,
    },
    {
      icon: Palette,
      title: "Mudar a aparência do Guido",
      description: "Cor atual",
      onClick: () => setView("guidoAppearance"),
    },
    {
      icon: Brush,
      title: "Mudar a cor dos destaques dos passos",
      description: "Cor atual",
      onClick: () => setView("guideAccent"),
    },
    {
      icon: Accessibility,
      title: "Ativar modo fácil de ler",
      description: "Aumenta as letras.",
      onClick: onSetEasyReading,
      active: easyReading,
    },
    {
      icon: Contrast,
      title: "Alternar tema claro e escuro",
      description: "Tema atual",
      onClick: onToggleTheme,
    },
  ];

  return createPortal(
    <div ref={modalRef} className="home-settings-backdrop" role="presentation" onMouseDown={(event) => event.stopPropagation()}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={
          view === "root"
            ? "home-settings-title"
            : view === "guideAccent" ? "home-guide-accent-title" : "home-guido-appearance-title"
        }
        className="home-settings-modal"
      >
        <header className="home-settings-header">
          <div>
            {view !== "root" && (
              <button
                ref={backRef}
                type="button"
                onClick={() => {
                  const previousView = view;
                  const nextView = previousView === "guidoColor" || previousView === "guidoPosition"
                    ? "guidoAppearance"
                    : "root";
                  setView(nextView);
                  window.requestAnimationFrame(() => {
                    const returnRef = previousView === "guideAccent"
                      ? accentOptionRef
                      : previousView === "guidoColor"
                        ? appearanceColorRef
                        : previousView === "guidoPosition"
                          ? appearancePositionRef
                          : appearanceOptionRef;
                    returnRef.current?.focus({ preventScroll: true });
                  });
                }}
                className="home-settings-back"
                aria-label="Voltar para configurações"
              >
                <ArrowLeft aria-hidden="true" />
                <span>Voltar</span>
              </button>
            )}
            <p className="home-settings-eyebrow">
              {view === "root"
                ? "PERSONALIZE SUA EXPERIÊNCIA"
                : view === "guidoAppearance"
                  ? "APARÊNCIA DO GUIDO"
                  : view === "guidoColor"
                    ? "COR DO GUIDO"
                    : view === "guidoPosition"
                      ? "POSIÇÃO DO GUIDO"
                      : "DESTAQUES DOS PASSOS"}
            </p>
            <h2 id={view === "root" || view === "guideAccent" ? (view === "root" ? "home-settings-title" : "home-guide-accent-title") : "home-guido-appearance-title"}>
              {view === "root"
                ? "Configurações do Guido"
                : view === "guidoAppearance"
                  ? "Aparência do Guido"
                  : view === "guidoColor"
                    ? "Cor do Guido"
                    : view === "guidoPosition"
                      ? "Posição do Guido"
                      : "Cor dos destaques dos passos"}
            </h2>
            {(view === "guidoColor" || view === "guidoPosition") && (
              <p>
                {view === "guidoColor"
                  ? "Escolha uma cor."
                  : "Escolha uma pose."}
              </p>
            )}
          </div>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Fechar configurações" className="home-settings-close">
            <X aria-hidden="true" />
          </button>
        </header>

        <div className="home-settings-scroll">
          {view === "root" ? (
            <>
              <div className="home-settings-grid">
                {settingOptions.map(({ icon: Icon, title, description, onClick, active }) => (
                  <button
                    key={title}
                    ref={title === "Mudar a aparência do Guido" ? appearanceOptionRef : title === "Mudar a cor dos destaques dos passos" ? accentOptionRef : undefined}
                    type="button"
                    className={`home-settings-option${active ? " is-active" : ""}`}
                    onClick={onClick}
                  >
                    <span className="home-settings-option-icon" aria-hidden="true"><Icon /></span>
                    <span className="home-settings-option-copy">
                      <strong>{title}</strong>
                      <span>{description}</span>
                    </span>
                    <span className="home-settings-option-arrow" aria-hidden="true">→</span>
                  </button>
                ))}
              </div>

              <div className="home-settings-safety">
                <strong>Segurança primeiro</strong>
                <p>O Guido nunca pede sua senha, código de segurança ou dados bancários.</p>
              </div>
            </>
          ) : view === "guidoAppearance" ? (
            <div className="home-appearance-options">
              <button ref={appearanceColorRef} type="button" className="home-appearance-option" onClick={() => setView("guidoColor")}>
                <span className="home-appearance-option-icon" aria-hidden="true"><Palette /></span>
                <span className="home-appearance-option-copy">
                  <strong>Cor</strong>
                  <span>Cor atual</span>
                </span>
                <span className="home-settings-option-arrow" aria-hidden="true">→</span>
              </button>
              <button ref={appearancePositionRef} type="button" className="home-appearance-option" onClick={() => setView("guidoPosition")}>
                <span className="home-appearance-option-icon" aria-hidden="true"><Move /></span>
                <span className="home-appearance-option-copy">
                  <strong>Posição</strong>
                  <span>Posição atual</span>
                </span>
                <span className="home-settings-option-arrow" aria-hidden="true">→</span>
              </button>
              <button type="button" className="home-appearance-option is-disabled" disabled aria-disabled="true">
                <span className="home-appearance-option-icon" aria-hidden="true"><Sparkles /></span>
                <span className="home-appearance-option-copy">
                  <strong>Em desenvolvimento</strong>
                  <span>Novas formas de personalizar o Guido chegarão em breve.</span>
                </span>
                <span className="home-appearance-option-badge">Em breve</span>
              </button>
            </div>
          ) : view === "guidoColor" ? (
            <div className="home-guido-appearance">
              <div className="home-guido-appearance-preview" aria-label={`Prévia do Guido na cor ${guidoColorLabels[guidoColor]}`}>
                {guidoColor === "bicolor" ? (
                  <Image
                    src={guidoBicolorImage}
                    alt={`Guido ${guidoColorLabels[guidoColor].toLowerCase()}`}
                    width={2048}
                    height={2048}
                    className="home-settings-guido-image guido-color-image"
                    sizes="(max-width: 640px) 210px, 280px"
                  />
                ) : (
                  <>
                    <Image
                      src="/images/home/mascote-guido-dark.webp"
                      alt={`Guido ${guidoColorLabels[guidoColor].toLowerCase()}`}
                      width={1199}
                      height={1312}
                      className="home-settings-guido-image home-settings-guido-dark guido-color-image"
                      sizes="(max-width: 640px) 210px, 280px"
                    />
                    <Image
                      src="/images/home/mascote-guido-lendo.webp"
                      alt={`Guido ${guidoColorLabels[guidoColor].toLowerCase()}`}
                      width={1106}
                      height={1295}
                      className="home-settings-guido-image home-settings-guido-light guido-color-image"
                      sizes="(max-width: 640px) 210px, 280px"
                    />
                  </>
                )}
              </div>
              <p className="home-guido-appearance-current" aria-live="polite">
                Cor atual: <strong>{guidoColorLabels[guidoColor]}</strong>
              </p>
              <div className="home-guido-color-options" role="radiogroup" aria-label="Escolha a cor do Guido">
                {(Object.keys(guidoColorLabels) as GuidoColorPreference[]).map((color) => (
                  <button
                    key={color}
                    type="button"
                    role="radio"
                    aria-checked={guidoColor === color}
                    aria-label={`${guidoColorLabels[color]}${guidoColor === color ? " (selecionado)" : ""}`}
                    className={`home-guido-color-option home-guido-color-option--${color}${guidoColor === color ? " is-selected" : ""}`}
                    onClick={() => onSetGuidoColor(color)}
                  >
                    <span className={`home-guido-color-preview home-guido-color-preview--${color}`} aria-hidden="true">
                      <Image src={color === "bicolor" ? guidoBicolorImage : "/images/home/mascote-guido-dark.webp"} alt="" width={color === "bicolor" ? 2048 : 1199} height={color === "bicolor" ? 2048 : 1312} className="home-guido-color-preview-image" sizes="74px" />
                    </span>
                    <span className="home-guido-color-name">{guidoColorLabels[color]}</span>
                    <span className="home-guido-color-check" aria-hidden="true">{guidoColor === color ? "✓" : ""}</span>
                  </button>
                ))}
              </div>
              <p className="home-guido-appearance-note">Troque a cor quando quiser.</p>
            </div>
          ) : view === "guidoPosition" ? (
            <div className="home-guido-position">
              <div className="home-guido-appearance-preview home-guido-position-current" aria-label={`Prévia da ${guidoPositionLabels[guidoPosition]}`}>
                {guidoPosition === "padrao" ? (
                  <Image
                    src="/images/home/mascote-guido-dark.webp"
                    alt={guidoPositionLabels[guidoPosition]}
                    width={1199}
                    height={1312}
                    className="home-settings-guido-image home-settings-guido-dark"
                    sizes="(max-width: 640px) 210px, 280px"
                  />
                ) : (
                  <Image
                    src={guidoPositionImages[guidoPosition]}
                    alt={guidoPositionLabels[guidoPosition]}
                    width={2048}
                    height={2048}
                    className="home-guido-position-current-image home-guido-position-static-image"
                    sizes="(max-width: 640px) 250px, 320px"
                  />
                )}
              </div>
              <p className="home-guido-appearance-current" aria-live="polite">
                Posição atual: <strong>{guidoPositionLabels[guidoPosition]}</strong>
              </p>
              <div className="home-guido-position-options" role="radiogroup" aria-label="Escolha a posição do Guido">
                {(Object.keys(guidoPositionImages) as GuidoPositionPreference[]).map((position) => (
                  <button
                    key={position}
                    type="button"
                    role="radio"
                    aria-checked={guidoPosition === position}
                    aria-label={`${guidoPositionLabels[position]}${guidoPosition === position ? " (selecionado)" : ""}`}
                    className={`home-guido-position-option${guidoPosition === position ? " is-selected" : ""}`}
                    onClick={() => onSetGuidoPosition(position)}
                  >
                    <span className="home-guido-position-preview" aria-hidden="true">
                      <Image src={guidoPositionImages[position]} alt="" width={2048} height={2048} className={`home-guido-position-image${position === "padrao" ? "" : " home-guido-position-static-image"}`} sizes="120px" />
                    </span>
                    <span className="home-guido-position-name">{guidoPositionLabels[position]}</span>
                    <span className="home-guido-color-check" aria-hidden="true">{guidoPosition === position ? "✓" : ""}</span>
                  </button>
                ))}
              </div>
              <p className="home-guido-appearance-note">Troque a pose quando quiser.</p>
            </div>
          ) : (
            <div className="home-guide-accent">
              <div
                className={`home-guide-accent-preview home-guide-accent-preview--${guideAccent}`}
                aria-label={`Prévia dos destaques na cor ${guideAccentLabels[guideAccent]}`}
              >
                <div className="home-guide-accent-preview-header">
                  <strong>Trilha do guia</strong>
                  <span>Passo 2 de 3</span>
                </div>
                <div className="home-guide-accent-preview-track" aria-hidden="true">
                  <span className="is-complete" />
                  <span className="is-current" />
                  <span />
                </div>
                <div className="home-guide-accent-preview-card">
                  <span className="home-guide-accent-preview-number">2</span>
                  <div>
                    <strong>O que fazer agora</strong>
                    <span>Toque para continuar</span>
                  </div>
                </div>
              </div>
              <p className="home-guide-accent-current" aria-live="polite">
                Cor atual: <strong>{guideAccentLabels[guideAccent]}</strong>
              </p>
              <div className="home-guide-accent-options" role="radiogroup" aria-label="Escolha a cor dos destaques dos passos">
                {(Object.keys(guideAccentLabels) as GuideAccentPreference[]).map((accent) => (
                  <button
                    key={accent}
                    type="button"
                    role="radio"
                    aria-checked={guideAccent === accent}
                    aria-label={`${guideAccentLabels[accent]}${guideAccent === accent ? " (selecionado)" : ""}`}
                    className={`home-guide-accent-option home-guide-accent-option--${accent}${guideAccent === accent ? " is-selected" : ""}`}
                    onClick={() => onSetGuideAccent(accent)}
                  >
                    <span className="home-guide-accent-option-preview" aria-hidden="true">
                      <span className="home-guide-accent-option-track"><i /><i /><i /></span>
                      <span className="home-guide-accent-option-number">2</span>
                    </span>
                    <span className="home-guide-accent-option-name">{guideAccentLabels[accent]}</span>
                    <span className="home-guide-accent-option-check" aria-hidden="true">{guideAccent === accent ? "✓" : ""}</span>
                  </button>
                ))}
              </div>
              <p className="home-guide-accent-note">Essa cor será usada nos próximos guias e nos guias que você já abriu.</p>
            </div>
          )}
        </div>
      </section>
    </div>,
    document.body,
  );
}

export function HomeToolbar({
  activePage = "home",
  showAdmin = false,
  variant = "home",
  guideLeft,
  guideActions,
  onOpenVoiceAssistant,
  onOpenGuideRequest,
  isInternal = false,
}: HomeToolbarProps) {
  const isHome = (activePage === "home" || !activePage) && !isInternal;
  const [helpOpen, setHelpOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [voiceAssistantOpen, setVoiceAssistantOpen] = useState(false);
  const [guideRequestOpen, setGuideRequestOpen] = useState(false);
  const [guideRequestDraft, setGuideRequestDraft] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [guidoColor, setGuidoColor] = useState<GuidoColorPreference>(() => {
    if (typeof window === "undefined") return "blue";
    const stored = window.localStorage.getItem(guidoColorStorageKey);
    return isGuidoColorPreference(stored) ? stored : "blue";
  });
  const [guidoPosition, setGuidoPosition] = useState<GuidoPositionPreference>(readGuidoPositionPreference);
  const [guideAccent, setGuideAccent] = useState<GuideAccentPreference>(() => {
    if (typeof window === "undefined") return "blue";
    const stored = window.localStorage.getItem(guideAccentStorageKey);
    return isGuideAccentPreference(stored) ? stored : "blue";
  });
  const { fontSize, setFontSize, cycleFontSize, toggleContrast } = useAccessibility();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const helpButtonRef = useRef<HTMLButtonElement>(null);
  const helpCloseRef = useRef<HTMLButtonElement>(null);
  const settingsButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const storedPreference = window.localStorage.getItem(storageKey);
    const documentPreference = document.documentElement.dataset.themePreference;
    const initialPreference = isThemePreference(storedPreference)
      ? storedPreference
      : isThemePreference(documentPreference) ? documentPreference : "system";
    applyThemePreference(initialPreference, false);

    const storedGuidoColor = window.localStorage.getItem(guidoColorStorageKey);
    const initialGuidoColor = isGuidoColorPreference(storedGuidoColor) ? storedGuidoColor : "blue";
    applyVisualPreference("guidoColor", initialGuidoColor, guidoColorStorageKey);

    const storedGuideAccent = window.localStorage.getItem(guideAccentStorageKey);
    const initialGuideAccent = isGuideAccentPreference(storedGuideAccent) ? storedGuideAccent : "blue";
    applyVisualPreference("guideAccent", initialGuideAccent, guideAccentStorageKey);

    const initialGuidoPosition = readGuidoPositionPreference();
    document.documentElement.dataset.guidoPosition = initialGuidoPosition;

    if (typeof window.matchMedia !== "function") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const followSystem = () => {
      if (document.documentElement.dataset.themePreference === "system") {
        applyThemePreference("system", false);
      }
    };
    media.addEventListener?.("change", followSystem);
    return () => media.removeEventListener?.("change", followSystem);
  }, []);

  useEffect(() => {
    if (!settingsOpen) return;
    const closeWithEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSettingsOpen(false);
        settingsButtonRef.current?.focus({ preventScroll: true });
      }
    };
    window.addEventListener("keydown", closeWithEscape);
    return () => window.removeEventListener("keydown", closeWithEscape);
  }, [settingsOpen]);

  useEffect(() => {
    if (!helpOpen) return;

    helpCloseRef.current?.focus();

    const closeWithEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setHelpOpen(false);
        helpButtonRef.current?.focus();
      }
    };

    window.addEventListener("keydown", closeWithEscape);
    return () => window.removeEventListener("keydown", closeWithEscape);
  }, [helpOpen]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const closeWithEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    window.addEventListener("keydown", closeWithEscape);
    return () => window.removeEventListener("keydown", closeWithEscape);
  }, [mobileMenuOpen]);

  const toggleTheme = () => {
    const currentTheme = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
    const nextTheme = currentTheme === "dark" ? "light" : "dark";
    applyThemePreference(nextTheme);
  };

  const closeSettings = () => {
    setSettingsOpen(false);
    window.requestAnimationFrame(() => settingsButtonRef.current?.focus({ preventScroll: true }));
  };

  const setGuidoColorPreference = (next: GuidoColorPreference) => {
    setGuidoColor(next);
    applyVisualPreference("guidoColor", next, guidoColorStorageKey);
  };

  const setGuidoPositionPreference = (next: GuidoPositionPreference) => {
    setGuidoPosition(next);
    applyGuidoPositionPreference(next);
  };

  const setGuideAccentPreference = (next: GuideAccentPreference) => {
    setGuideAccent(next);
    applyVisualPreference("guideAccent", next, guideAccentStorageKey);
  };

  const requestGuide = () => {
    closeSettings();
    if (onOpenGuideRequest) onOpenGuideRequest();
    else setGuideRequestOpen(true);
  };

  const openHelpFromSettings = () => {
    closeSettings();
    setHelpOpen(true);
  };

  if (variant === "guide") {
    return (
      <header className="guide-toolbar">
        <div className="guide-toolbar-left">{guideLeft}</div>
        <div className="guide-toolbar-actions flex items-center gap-2">
          <button
            type="button"
            onClick={cycleFontSize}
            className="guide-theme-toggle guide-theme-toggle--font flex items-center justify-center font-black text-sm"
            aria-label="Ajustar tamanho da letra"
            title="Ajustar tamanho da letra"
          >
            {fontSize === "normal" ? "A" : fontSize === "large" ? "A+" : "A++"}
          </button>
          <button
            type="button"
            onClick={toggleContrast}
            className="guide-theme-toggle guide-theme-toggle--contrast flex items-center justify-center font-black text-sm"
            aria-label="Alternar alto contraste"
            title="Alternar alto contraste"
          >
            ◐
          </button>
          {guideActions}
        </div>
      </header>
    );
  }

  return (
    <>
      <header className="home-header">
        <Link href="/" className="home-brand" aria-label="Guido, página inicial">
          <span className="home-brand-logo">
            <Image
              src="/images/home/logo-guido-azul-marinho.png"
              alt="Guido"
              width={2076}
              height={757}
              className="home-logo-light"
              sizes="(max-width: 640px) 115px, 145px"
              priority
            />
            <Image
              src="/images/home/logo-guido-branca-dark.png"
              alt="Guido"
              width={1184}
              height={308}
              className="home-logo-dark"
              sizes="(max-width: 640px) 115px, 145px"
              priority
            />
          </span>
        </Link>

        {/* Menu central com apenas: Início, Explorar, Criar e editar guias, Sobre */}
        <nav id="home-main-navigation" aria-label="Navegação principal" className={`home-main-nav${mobileMenuOpen ? " is-open" : ""}`}>
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            aria-current={activePage === "home" ? "page" : undefined}
          >
            Início
          </Link>
          <Link
            href="/explorar"
            onClick={() => setMobileMenuOpen(false)}
            aria-current={activePage === "explore" ? "page" : undefined}
          >
            Explorar
          </Link>
          <Link
            href="/admin/guias/preview"
            onClick={() => setMobileMenuOpen(false)}
            aria-current={activePage === "guides" ? "page" : undefined}
          >
            Criar e editar guias
          </Link>
          <button
            ref={helpButtonRef}
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              setHelpOpen(true);
            }}
            className="home-nav-button"
            aria-current={helpOpen ? "page" : undefined}
            aria-expanded={helpOpen}
          >
            Sobre
          </button>
          {showAdmin && (
            <Link href="/admin/guias/preview" className="home-admin-tool-link">
              Tarefas automáticas
            </Link>
          )}
        </nav>

        {/* Lado direito: Botão Guido no Cabeçalho e Botão Entrar (somente na página inicial) */}
        {(isHome || showAdmin) && (
          <nav id="home-account-navigation" aria-label="Acesso à conta e assistente" className={`home-account-nav${mobileMenuOpen ? " is-open" : ""}`}>
            {/* Botão Guido no Cabeçalho - somente na página inicial */}
            {isHome && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onOpenVoiceAssistant) {
                    onOpenVoiceAssistant();
                  } else {
                    setVoiceAssistantOpen(true);
                  }
                }}
                className="home-ask-button"
                aria-label="Falar com o Guido por voz"
                title="Falar com o Guido por voz"
              >
                <span className="home-ask-icon-badge" aria-hidden="true">
                  <Mic className="size-3.5 text-white animate-pulse" />
                </span>
                <span className="home-ask-full-label">Falar com o Guido</span>
                <span className="home-ask-short-label">Guido</span>
              </button>
            )}

            {/* Botão Entrar (somente na home) ou Admin (quando showAdmin é true) */}
            {(isHome || showAdmin) && (
              <SessionNavigation loginLabel="Entrar" showAdmin={showAdmin} showUpload={false} />
            )}
          </nav>
        )}

        {/* Botão Hambúrguer Mobile: não exibe em páginas internas */}
        {!isInternal && (
          <button
            type="button"
            ref={menuButtonRef}
            className="home-mobile-menu-button"
            aria-label={mobileMenuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls="home-main-navigation home-account-navigation"
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </button>
        )}
      </header>

      {/* Botão de alternar tema claro/escuro - somente na página inicial */}
      {isHome && (
        <>
          <div className="home-bottom-theme-dock">
            <ThemeToggleButton onClick={toggleTheme} className="home-theme-bottom-btn" showLabel />
          </div>
          <div className="home-settings-dock">
            <button
              ref={settingsButtonRef}
              type="button"
              className="home-settings-button"
              onClick={() => setSettingsOpen(true)}
              aria-label="Abrir configurações"
              title="Abrir configurações"
            >
              <Settings aria-hidden="true" />
            </button>
          </div>
        </>
      )}

      {settingsOpen && isHome && (
        <HomeSettingsModal
          onClose={closeSettings}
          onOpenHelp={openHelpFromSettings}
          onRequestGuide={requestGuide}
          onToggleTheme={toggleTheme}
          onSetGuidoColor={setGuidoColorPreference}
          onSetGuidoPosition={setGuidoPositionPreference}
          onSetGuideAccent={setGuideAccentPreference}
          onSetEasyReading={() => setFontSize("large")}
          guidoColor={guidoColor}
          guidoPosition={guidoPosition}
          guideAccent={guideAccent}
          easyReading={fontSize !== "normal"}
        />
      )}

      {helpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-5" role="presentation">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="home-help-title"
            className="home-bank-modal w-full max-w-lg rounded-3xl p-6 text-[var(--foreground)] sm:p-8"
          >
            <h2 id="home-help-title" className="text-2xl font-bold">Como usar o Guido</h2>
            <p className="mt-4 text-slate-200">
              Escolha uma categoria na tela inicial para ver os guias passo a passo de cada aplicativo.
            </p>
            <p className="mt-4 font-bold text-blue-300">
              O Guido nunca solicita senhas, códigos de segurança ou dados bancários.
            </p>
            <button
              ref={helpCloseRef}
              type="button"
              onClick={() => {
                setHelpOpen(false);
                helpButtonRef.current?.focus();
              }}
              className="primary-action mt-6 min-h-12 w-full rounded-full px-5 font-bold"
            >
              Fechar ajuda
            </button>
          </section>
        </div>
      )}

      {!onOpenVoiceAssistant && voiceAssistantOpen && (
        <GuidoVoiceModal
          isOpen={voiceAssistantOpen}
          onClose={() => setVoiceAssistantOpen(false)}
          onUseText={(text) => {
            setGuideRequestDraft(text);
            setVoiceAssistantOpen(false);
            setGuideRequestOpen(true);
          }}
        />
      )}

      {!onOpenGuideRequest && guideRequestOpen && (
        <GuideRequestModal
          isOpen={guideRequestOpen}
          initialPrompt={guideRequestDraft}
          onClose={() => setGuideRequestOpen(false)}
        />
      )}
    </>
  );
}
