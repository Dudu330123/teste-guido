import { applications } from "@/data/applications";
import { tasks } from "@/data/guides";
import { HomeDeviceView } from "@/features/device-picker/home-device-view";
import { getCatalogFromSupabase, mergeCatalogWithFallback } from "@/lib/catalog";

export default async function HomePage() {
  const remoteCatalog = await getCatalogFromSupabase();
  const catalog = mergeCatalogWithFallback(remoteCatalog, { applications, tasks });
  return (
    <main className="guido-home relative min-h-screen text-[var(--foreground)]">
      <HomeDeviceView applications={catalog.applications} tasks={catalog.tasks} />
    </main>
  );
}
