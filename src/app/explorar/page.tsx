import type { Metadata } from "next";
import Link from "next/link";
import { applications } from "@/data/applications";
import { tasks } from "@/data/guides";
import {
  buildExploreItems,
  filterExploreItems,
  getExploreCategories,
  getExplorePresentationItems,
  groupFinancialExploreItems,
  removeExploreItems,
  selectPopularItems,
} from "@/features/explore/explore-content";
import { ExploreGuideCard } from "@/features/explore/explore-guide-card";
import { HomeToolbar } from "@/features/theme/home-toolbar";
import { getSuperadminAccess } from "@/lib/supabase/admin";
import {
  getCatalogFromSupabase,
  getGuidePopularityFromSupabase,
  mergeCatalogWithFallback,
} from "@/lib/catalog";

interface ExplorePageProps {
  searchParams: Promise<{ q?: string; categoria?: string }>;
}

export const metadata: Metadata = {
  title: "Explorar guias",
  description: "Encontre guias do Guido por assunto, aplicativo ou categoria.",
};

function categoryHref(category: string, query: string) {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (category) params.set("categoria", category);
  const suffix = params.toString();
  return suffix ? `/explorar?${suffix}` : "/explorar";
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const [{ q = "", categoria = "" }, remoteCatalog, accessCounts, superadminAccess] = await Promise.all([
    searchParams,
    getCatalogFromSupabase(),
    getGuidePopularityFromSupabase(),
    getSuperadminAccess(),
  ]);
  const catalog = mergeCatalogWithFallback(remoteCatalog, { applications, tasks });
  const allItems = buildExploreItems(catalog.applications, catalog.tasks);
  const categories = getExploreCategories(allItems);
  const filteredItems = filterExploreItems(allItems, q, categoria);
  const isGeneralView = !q && !categoria;
  const popularSelection = isGeneralView ? selectPopularItems(allItems, accessCounts, 6) : null;
  const popular = popularSelection ? groupFinancialExploreItems(popularSelection.items) : [];
  const displayItems = getExplorePresentationItems(filteredItems, q);
  const visibleItems = isGeneralView ? removeExploreItems(displayItems, popular) : displayItems;
  const popularMeasured = popularSelection?.measured ?? false;
  const exploreReturnTo = categoryHref(categoria, q);
  return (
    <main className="guido-home guido-explore min-h-screen">
      <HomeToolbar showAdmin={Boolean(superadminAccess)} activePage="explore" />
      <div className="explore-content">
        <section className="explore-hero" aria-labelledby="explore-page-title">
          <header className="explore-intro">
            <p className="home-eyebrow">Biblioteca de guias</p>
            <h1 id="explore-page-title">Explore no seu ritmo.</h1>
            <p>Pesquise uma tarefa ou escolha um assunto. Os guias disponíveis mostram cada passo com calma.</p>
          </header>
          <form action="/explorar" method="get" role="search" className="explore-search-form">
            <label htmlFor="explore-search">O que você quer aprender?</label>
            <div className="explore-search-control">
              <svg aria-hidden="true" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2.2">
                <circle cx="10.5" cy="10.5" r="6.5" />
                <path d="m15.5 15.5 5 5" strokeLinecap="round" />
              </svg>
              <input id="explore-search" name="q" type="search" defaultValue={q} placeholder="Ex.: banco, Gov.br ou WhatsApp" />
              {categoria && <input type="hidden" name="categoria" value={categoria} />}
              <button type="submit">Pesquisar</button>
            </div>
          </form>

          <nav aria-label="Filtrar guias por categoria" className="explore-filters">
            <Link href={categoryHref("", q)} aria-current={!categoria ? "page" : undefined}>Todos</Link>
            {categories.map((category) => (
              <Link key={category} href={categoryHref(category, q)} aria-current={categoria === category ? "page" : undefined}>
                {category}
              </Link>
            ))}
          </nav>
          {(q || categoria) && <Link href="/explorar" className="explore-clear-link">Limpar pesquisa e filtros</Link>}
        </section>

        {isGeneralView && popular.length > 0 && (
          <section aria-labelledby="popular-guides-title" className="explore-section">
            <div className="explore-section-heading">
              <div>
                <p className="explore-kicker">Comece por aqui</p>
                <h2 id="popular-guides-title">{popularMeasured ? "Mais acessados" : "Em destaque"}</h2>
              </div>
              <p>{popularMeasured ? "Guias mais abertos pela comunidade." : "Guias disponíveis para conhecer o Guido."}</p>
            </div>
            <div className="explore-guide-grid explore-popular-grid">
              {popular.map((item) => <ExploreGuideCard key={`popular-${item.task.id}`} item={item} variant="featured" returnTo={exploreReturnTo} />)}
            </div>
          </section>
        )}

        <section aria-labelledby="all-guides-title" className="explore-section">
          <div className="explore-section-heading">
            <div>
              <p className="explore-kicker">Em ordem alfabética</p>
              <h2 id="all-guides-title">{q || categoria ? "Resultados" : "Todos os guias"}</h2>
            </div>
            <p aria-live="polite">{visibleItems.length} {visibleItems.length === 1 ? "opção encontrada" : "opções encontradas"}</p>
          </div>
          {visibleItems.length > 0 ? (
            <div className="explore-guide-grid">
              {visibleItems.map((item) => <ExploreGuideCard key={item.action ? `action-${item.action.id}` : item.task.id} item={item} returnTo={exploreReturnTo} />)}
            </div>
          ) : (
            <div className="explore-empty" role="status">
              <h3>Nenhum guia encontrado</h3>
              <p>Tente pesquisar com menos palavras ou escolha outra categoria.</p>
              <Link href="/explorar">Limpar pesquisa e filtros</Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
