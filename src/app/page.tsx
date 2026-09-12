import { applications } from "@/data/applications";
import { tasks } from "@/data/guides";
import { HomeSearch } from "@/features/search/home-search";
import { HomeToolbar } from "@/features/theme/home-toolbar";
import { getSuperadminAccess } from "@/lib/auth/admin";
import { getCatalogFromSupabase, mergeCatalogWithFallback } from "@/lib/catalog";

export default async function HomePage() {
  const [remoteCatalog, superadminAccess] = await Promise.all([
    getCatalogFromSupabase(),
    getSuperadminAccess(),
  ]);
  const catalog = mergeCatalogWithFallback(remoteCatalog, { applications, tasks });
  return (
    <main className="guido-home guido-home--landing relative min-h-screen text-[var(--foreground)]">
      <HomeToolbar compactHome showAdmin={Boolean(superadminAccess)} activePage="home" />
      <div className="guido-home-content mx-auto w-full">
        <HomeSearch applications={catalog.applications} tasks={catalog.tasks} />
      </div>
    </main>
  );
}
