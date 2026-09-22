import { applications } from "@/data/applications";
import { tasks } from "@/data/guides";
import { HomeSearch } from "@/features/search/home-search";
import { HomeToolbar } from "@/features/theme/home-toolbar";
import { getCatalogFromSupabase, mergeCatalogWithFallback } from "@/lib/catalog";

export default async function HomePage() {
  const remoteCatalog = await getCatalogFromSupabase();
  const catalog = mergeCatalogWithFallback(remoteCatalog, { applications, tasks });
  return (
    <main className="guido-home guido-home--landing relative min-h-screen text-[var(--foreground)]">
      <HomeToolbar showAdmin={false} activePage="home" />
      <div className="guido-home-content mx-auto w-full">
        <HomeSearch applications={catalog.applications} tasks={catalog.tasks} />
      </div>
    </main>
  );
}
