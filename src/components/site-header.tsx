import { HomeToolbar, type HomeActivePage } from "@/features/theme/home-toolbar";

interface SiteHeaderProps {
  showAdmin?: boolean;
  activePage?: HomeActivePage;
}

export function SiteHeader({ showAdmin = false, activePage }: SiteHeaderProps = {}) {
  // Rotas internas exibem apenas a marca Guido, reservando o botão de áudio e de entrar para a página inicial
  return <HomeToolbar showAdmin={showAdmin} activePage={activePage} isInternal />;
}
