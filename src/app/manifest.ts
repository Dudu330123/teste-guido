import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Guido — Ajuda digital passo a passo",
    short_name: "Guido",
    description: "Guias visuais simples para usar aplicativos com mais segurança.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f4ed",
    theme_color: "#155f45",
    lang: "pt-BR",
  };
}
