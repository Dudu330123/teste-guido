import { applications } from "@/data/applications";
import { tasks } from "@/data/guides";
import { HomeSearch } from "@/features/search/home-search";
import { HomeToolbar } from "@/features/theme/home-toolbar";
import { getSuperadminAccess } from "@/lib/supabase/admin";
import { getCatalogFromSupabase, mergeCatalogWithFallback } from "@/lib/supabase/catalog";

export default async function HomePage() {
  const [remoteCatalog, superadminAccess] = await Promise.all([
    getCatalogFromSupabase(),
    getSuperadminAccess(),
  ]);
  const catalog = mergeCatalogWithFallback(remoteCatalog, { applications, tasks });
  return (
    <main className="guido-home relative min-h-screen px-5 text-[var(--foreground)]">
      <HomeToolbar showAdmin={Boolean(superadminAccess)} />
      <div className="mx-auto flex min-h-screen w-full max-w-3xl items-start justify-center pb-16 pt-[18vh] sm:pt-[23vh]">
        <HomeSearch applications={catalog.applications} tasks={catalog.tasks} />
      </div>
    </main>
  );
}
