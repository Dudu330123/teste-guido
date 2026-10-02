"use client";

import Image from "next/image";
import { useEffect, useState, type CSSProperties } from "react";
import {
  guidoBicolorPositionImages,
  isGuidoColorPreference,
  guidoPositionImages,
  readGuidoColorPreference,
  isGuidoPositionPreference,
  readGuidoPositionPreference,
  type GuidoColorPreference,
  type GuidoPositionPreference,
} from "./guido-preferences";

interface GuidoMascotProps {
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
  style?: CSSProperties;
}

export function GuidoMascot({ alt, className, priority = false, sizes, style }: GuidoMascotProps) {
  // Mantém a primeira renderização igual no servidor e no navegador. A preferência
  // salva é aplicada depois da hidratação para evitar o aviso do React.
  const [position, setPosition] = useState<GuidoPositionPreference>("padrao");
  const [color, setColor] = useState<GuidoColorPreference>("blue");

  useEffect(() => {
    const preferenceFrame = window.requestAnimationFrame(() => {
      setPosition(readGuidoPositionPreference());
      setColor(readGuidoColorPreference());
    });

    const handlePositionChange = (event: Event) => {
      const nextPosition = (event as CustomEvent<string>).detail;
      if (isGuidoPositionPreference(nextPosition)) {
        setPosition(nextPosition);
      }
    };

    const handleColorChange = (event: Event) => {
      const nextColor = (event as CustomEvent<string>).detail;
      if (isGuidoColorPreference(nextColor)) {
        setColor(nextColor);
      }
    };

    window.addEventListener("guido-position-change", handlePositionChange);
    window.addEventListener("guido-color-change", handleColorChange);
    return () => {
      window.cancelAnimationFrame(preferenceFrame);
      window.removeEventListener("guido-position-change", handlePositionChange);
      window.removeEventListener("guido-color-change", handleColorChange);
    };
  }, []);

  const imageSrc = (color === "bicolor" ? guidoBicolorPositionImages[position] : guidoPositionImages[position])
    ?? guidoPositionImages.padrao;
  const imageClassName = [
    className,
    position === "padrao" ? null : "guido-position-image",
    color === "bicolor" ? "guido-bicolor-image" : null,
  ]
    .filter(Boolean)
    .join(" ") || undefined;

  return (
    <Image
      src={imageSrc}
      alt={alt}
      width={2048}
      height={2048}
      priority={priority}
      sizes={sizes}
      className={imageClassName}
      style={style}
    />
  );
}
