"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import type { OperatingSystem } from "@/types/content";
import { detectOperatingSystem, readOperatingSystem, saveOperatingSystem } from "./device";

interface ApplicationOption { slug: string; name: string; logoPath: string | null }
interface TaskGuideSetupProps {
  taskId: string;
  taskSlug: string;
  taskTitle: string;
  description: string;
  safetyWarning: string;
  application: ApplicationOption;
  applicationOptions?: ApplicationOption[];
}

const devices: Array<{ id: string; name: string; os: OperatingSystem; image: string; available: boolean }> = [
  { id: "samsung", name: "Samsung", os: "android", image: "/images/devices/samsung.png", available: true },
  { id: "iphone", name: "iPhone", os: "ios", image: "/images/devices/iphone.png", available: true },
];

export function TaskGuideSetup({ taskId, taskSlug, taskTitle, description, safetyWarning, application, applicationOptions = [] }: TaskGuideSetupProps) {
  const router = useRouter();
  const options = applicationOptions.length ? applicationOptions : [application];
  const [applicationSlug, setApplicationSlug] = useState(options[0]?.slug ?? application.slug);
  const [deviceId, setDeviceId] = useState("samsung");
  const [favorite, setFavorite] = useState(false);
  const selectedApplication = options.find((item) => item.slug === applicationSlug) ?? application;
  const device = devices.find((item) => item.id === deviceId) ?? devices[0]!;
  const safetyRules = useMemo(() => {
    const explicit = safetyWarning.match(/[^.!?]+[.!?]+/g)?.map((rule) => rule.trim()).filter(Boolean) ?? [];
    return [
      `Confira se está no aplicativo oficial do ${selectedApplication.name}.`,
      explicit[0] ?? "Nunca compartilhe sua senha ou código de autenticação, nem entregue o controle do celular a desconhecidos.",
    ];
  }, [safetyWarning, selectedApplication.name]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const saved = readOperatingSystem(window.localStorage) ?? detectOperatingSystem(window.navigator.userAgent);
      if (saved === "ios") setDeviceId("iphone");
      setFavorite(window.localStorage.getItem(`guido:favorite:${taskId}`) === "true");
    }, 0);
    return () => window.clearTimeout(timer);
  }, [taskId]);

  const toggleFavorite = () => {
    const next = !favorite;
    setFavorite(next);
    window.localStorage.setItem(`guido:favorite:${taskId}`, String(next));
  };

  const openGuide = () => {
    saveOperatingSystem(window.localStorage, device.os);
    const search = new URLSearchParams({ os: device.os });
    if (applicationOptions.length) search.set("app", applicationSlug);
    router.push(`/guias/${encodeURIComponent(taskSlug)}?${search}`);
  };

  // Mantém o padrão de radios com setas mesmo quando os controles recebem uma
  // apresentação visual grande, evitando que a pessoa precise voltar ao mouse.
  const moveDeviceSelection = (event: KeyboardEvent<HTMLInputElement>, currentIndex: number) => {
    const direction = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1
      : event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1
        : 0;
    if (!direction) return;

    event.preventDefault();
    const nextIndex = (currentIndex + direction + devices.length) % devices.length;
    const nextDevice = devices[nextIndex]!;
    setDeviceId(nextDevice.id);
    window.requestAnimationFrame(() => document.getElementById(`guide-device-${nextDevice.id}`)?.focus());
  };

  return (
    <main className="task-setup-page">
      <div className="task-setup-grid">
        <div className="task-setup-context">
          <section className="task-setup-hero" aria-labelledby="task-title">
            <div className="task-setup-app-row">
              <span className="task-setup-app-logo">
                {selectedApplication.logoPath ? <Image src={selectedApplication.logoPath} alt="" width={48} height={48} unoptimized /> : <span aria-hidden="true">G</span>}
              </span>
              <div>
                <p>{selectedApplication.name}</p>
                <span className="task-setup-available"><i aria-hidden="true">✓</i> Guia disponível</span>
              </div>
            </div>
            {applicationOptions.length > 0 && (
              <label className="task-setup-bank-label" htmlFor="guide-application">
                Aplicativo
                <select id="guide-application" value={applicationSlug} onChange={(event) => setApplicationSlug(event.target.value)}>
                  {options.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}
                </select>
              </label>
            )}
            <h1 id="task-title">{taskTitle}</h1>
            <p className="task-setup-description">{description}</p>
            <div className="task-setup-favorite-row">
              <button type="button" aria-pressed={favorite} onClick={toggleFavorite} className={favorite ? "is-favorite" : ""}>
                <svg aria-hidden="true" viewBox="0 0 24 24"><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" fill={favorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/></svg>
                {favorite ? "Favoritado" : "Favoritar"}
              </button>
            </div>
          </section>

          <section className="task-setup-safety" aria-labelledby="task-safety-title">
            <div className="task-setup-safety-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="M12 3 5.5 6v5.2c0 4.2 2.7 7.9 6.5 9.8 3.8-1.9 6.5-5.6 6.5-9.8V6L12 3Z" stroke="currentColor" strokeWidth="2"/><path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg></div>
            <div>
              <h2 id="task-safety-title">Use com segurança</h2>
              <ul>{safetyRules.map((rule) => <li key={rule}><span aria-hidden="true">✓</span>{rule}</li>)}</ul>
              <details><summary>Ver todas <span aria-hidden="true">⌄</span></summary><p>{safetyWarning}</p></details>
            </div>
          </section>
        </div>

        <section className="task-setup-device" aria-labelledby="device-title">
          <ol className="task-setup-journey" aria-label="Etapas antes de iniciar o guia">
            <li aria-current="step">
              <span aria-hidden="true">1</span>
              <div><strong>Agora</strong>Confirme o celular</div>
            </li>
            <li>
              <span aria-hidden="true">2</span>
              <div><strong>Depois</strong>Siga o guia</div>
            </li>
          </ol>
          <h2 id="device-title">Qual é o seu celular?</h2>
          <p>Escolha o aparelho que mais se parece com o seu. Assim, mostraremos as imagens certas para você.</p>
          <div className="task-setup-phone-stage"><Image src={device.image} alt={`Exemplo visual de um celular ${device.name}`} width={180} height={280} priority /></div>
          <h3>{device.name}</h3>
          <span className="task-setup-device-status" aria-live="polite"><i aria-hidden="true">✓</i> {device.name} selecionado</span>
          <div className="task-setup-chooser" role="radiogroup" aria-labelledby="device-choice-title">
            <p id="device-choice-title">Escolha seu celular</p>
            <div>
              {devices.map((item, index) => (
                <label key={item.id} className={item.id === device.id ? "is-selected" : undefined}>
                  <input id={`guide-device-${item.id}`} type="radio" name="guide-device" value={item.id} checked={item.id === device.id} onChange={() => setDeviceId(item.id)} onKeyDown={(event) => moveDeviceSelection(event, index)} />
                  <Image src={item.image} alt="" width={42} height={72}/>
                  <span>{item.name}<small>{item.id === device.id ? "Selecionado" : "Toque para escolher"}</small></span>
                  <i aria-hidden="true">✓</i>
                </label>
              ))}
            </div>
          </div>
          <p className="task-setup-open-hint">Tudo certo. Agora você pode começar com segurança.</p>
          <button type="button" className="task-setup-open" onClick={openGuide}>Abrir guia para {device.name}<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M5 12h14m-5-5 5 5-5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
        </section>
      </div>
    </main>
  );
}
