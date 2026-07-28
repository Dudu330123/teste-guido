import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Guido — Ajuda digital passo a passo",
    template: "%s | Guido",
  },
  description: "Guias visuais simples para usar aplicativos com mais segurança.",
  applicationName: "Guido",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#155f45",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
