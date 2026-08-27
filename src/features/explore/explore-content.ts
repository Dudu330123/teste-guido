import type { Application, Task } from "@/types/content";
import { normalizeSearch, scoreSearch } from "@/features/search/search-content";

export interface ExploreGuideItem {
  application: Application;
  task: Task;
}

/** Une tarefas e aplicativos uma única vez para manter busca, filtros e cards consistentes. */
export function buildExploreItems(applications: Application[], tasks: Task[]): ExploreGuideItem[] {
  const applicationsById = new Map(applications.map((application) => [application.id, application]));
  return tasks
    .flatMap((task) => {
      const application = applicationsById.get(task.applicationId);
      return application ? [{ application, task }] : [];
    })
    .sort((first, second) => first.task.title.localeCompare(second.task.title, "pt-BR"));
}

export function getExploreCategories(items: ExploreGuideItem[]) {
  return [...new Set(items.map(({ application }) => application.category))]
    .sort((first, second) => first.localeCompare(second, "pt-BR"));
}

export function filterExploreItems(items: ExploreGuideItem[], query: string, category: string) {
  const normalizedCategory = normalizeSearch(category);
  return items.filter(({ application, task }) => {
    const categoryMatches = !normalizedCategory || normalizeSearch(application.category) === normalizedCategory;
    const applicationTerms = new Set([
      normalizeSearch(application.name),
      ...application.searchTerms.map(normalizeSearch),
    ]);
    const taskTerms = task.searchTerms.filter((term) => !applicationTerms.has(normalizeSearch(term)));
    const taskText = [
      task.title,
      task.description,
      ...taskTerms,
    ].join(" ");
    const applicationText = [application.name, application.description, application.category].join(" ");
    const queryMatches = scoreSearch(`${taskText} ${applicationText}`, query) > 0;
    return categoryMatches && (!normalizeSearch(query) || queryMatches);
  });
}

export function getExploreGuideHref({ task }: ExploreGuideItem) {
  if (task.availability !== "preparing") return `/tarefas/${task.slug}`;
  if (task.applicationId === "app-demo-bancos" && task.actionId) return `/acoes/${task.actionId}`;
  return `/tarefas/${task.slug}`;
}

export function selectPopularItems(
  items: ExploreGuideItem[],
  accessCounts: ReadonlyMap<string, number>,
  limit = 6,
) {
  const measured = items
    .filter(({ task }) => (accessCounts.get(task.id) ?? 0) > 0)
    .sort((first, second) => {
      const countDifference = (accessCounts.get(second.task.id) ?? 0) - (accessCounts.get(first.task.id) ?? 0);
      return countDifference || first.task.title.localeCompare(second.task.title, "pt-BR");
    });
  if (measured.length > 0) return { items: measured.slice(0, limit), measured: true };

  const available = items.filter(({ task }) => task.availability !== "preparing");
  return { items: (available.length > 0 ? available : items).slice(0, limit), measured: false };
}
