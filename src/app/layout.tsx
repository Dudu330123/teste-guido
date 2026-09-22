import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Guido — Ajuda digital passo a passo",
    template: "%s | Guido",
  },
  description: "Guias visuais simples para usar aplicativos com mais segurança.",
  applicationName: "Guido",
  appleWebApp: {
    capable: true,
    title: "Guido",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#eef7ff" },
    { media: "(prefers-color-scheme: dark)", color: "#01040c" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <Script src="/theme-init.js" strategy="beforeInteractive" />
        {children}
      </body>
    </html>
  );
}
