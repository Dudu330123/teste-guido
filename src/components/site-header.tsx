import { HomeToolbar, type HomeActivePage } from "@/features/theme/home-toolbar";

interface SiteHeaderProps {
  showAdmin?: boolean;
  activePage?: HomeActivePage;
}

export function SiteHeader({ showAdmin = false, activePage }: SiteHeaderProps = {}) {
  // Todas as rotas usam o mesmo cabeçalho da home para manter orientação
  // espacial. A autorização continua sendo feita nas rotas administrativas;
  // páginas públicas não devem esperar uma consulta de permissão para abrir.
  return <HomeToolbar showAdmin={showAdmin} activePage={activePage} />;
}
