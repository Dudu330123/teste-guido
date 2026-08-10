import { applications } from "@/data/applications";
import { tasks } from "@/data/guides";
import { HomeSearch } from "@/features/search/home-search";
import { HomeToolbar } from "@/features/theme/home-toolbar";

export default function HomePage() {
  return (
    <main className="guido-home relative min-h-screen px-5 text-[var(--foreground)]">
      <HomeToolbar />
      <div className="mx-auto flex min-h-screen w-full max-w-3xl items-start justify-center pb-16 pt-[18vh] sm:pt-[23vh]">
        <HomeSearch applications={applications} tasks={tasks} />
      </div>
    </main>
  );
}
