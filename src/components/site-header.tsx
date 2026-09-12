import { HomeToolbar, type HomeActivePage } from "@/features/theme/home-toolbar";
import { getSuperadminAccess } from "@/lib/auth/admin";

interface SiteHeaderProps {
  showAdmin?: boolean;
  activePage?: HomeActivePage;
}

export async function SiteHeader({ showAdmin, activePage }: SiteHeaderProps = {}) {
  // Uma página já protegida pode informar o resultado e evitar uma segunda
  // consulta; todas as demais confirmam o papel no servidor antes de renderizar.
  const canAccessAdmin = showAdmin ?? Boolean(await getSuperadminAccess());

  // Todas as rotas usam o mesmo cabeçalho da home para manter orientação
  // espacial, tema e ações principais consistentes para o público idoso.
  return <HomeToolbar showAdmin={canAccessAdmin} activePage={activePage} />;
}
