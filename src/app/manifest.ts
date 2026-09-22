import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Guido — Ajuda digital passo a passo",
    short_name: "Guido",
    description: "Guias visuais simples para usar aplicativos com mais segurança.",
    start_url: "/",
    display: "standalone",
    background_color: "#eef7ff",
    theme_color: "#eef7ff",
    lang: "pt-BR",
  };
}
