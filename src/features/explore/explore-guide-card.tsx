import Link from "next/link";
import { getCategoryLabel } from "@/data/applications";
import { ActionIcon } from "@/features/actions/action-card";
import { ApplicationLogo } from "@/features/applications/application-logo";
import { getExploreGuideHref, type ExploreGuideItem } from "./explore-content";

export type ExploreGuideCardVariant = "featured" | "standard";

interface ExploreGuideCardProps {
  item: ExploreGuideItem;
  variant?: ExploreGuideCardVariant;
  returnTo?: string;
}

function getCardStatus(item: ExploreGuideItem) {
  if (item.action) return "Escolha o aplicativo";
  if (item.task.availability === "demo") return "Demonstração disponível";
  return item.task.availability === "preparing" ? "Guia em preparação" : "Guia disponível";
}

function ExploreCardIcon({ item }: { item: ExploreGuideItem }) {
  if (item.action) {
    return <span className={`explore-card-cover explore-card-cover--action explore-card-cover--${item.action.slug}`} aria-hidden="true"><ActionIcon slug={item.action.slug} /></span>;
  }

  return <span className={`explore-card-cover explore-card-cover--application explore-card-cover--${item.application.slug}`} aria-hidden="true"><ApplicationLogo application={item.application} /></span>;
}

export function ExploreGuideCard({ item, variant = "standard", returnTo }: ExploreGuideCardProps) {
  const available = item.task.availability !== "preparing";
  const title = item.action?.taskTitle ?? item.task.title;
  const description = item.action?.description ?? item.task.description;
  const status = getCardStatus(item);
  const statusClass = item.action
    ? "is-action"
    : item.task.availability === "demo"
      ? "is-demo"
      : available
        ? "is-available"
        : "is-preparing";

  return (
    <Link
      href={getExploreGuideHref(item, returnTo)}
      className={`explore-guide-card${variant === "featured" ? " explore-guide-card--featured" : ""}`}
    >
      {variant === "featured" ? (
        <div className="explore-card-identity">
          <span className={`explore-card-app-mark explore-card-app-mark--${item.application.slug}`}>
            <ApplicationLogo application={item.application} />
          </span>
          <span className="explore-card-badge">
            {item.action ? "Bancos" : getCategoryLabel(item.application.category)}
          </span>
          <span className="explore-card-app">
            {item.action ? "Escolha seu banco" : item.application.name}
          </span>
        </div>
      ) : (
        <>
          <ExploreCardIcon item={item} />
          <span className="explore-card-badge">
            {item.action ? "Bancos" : getCategoryLabel(item.application.category)}
          </span>
          <span className="explore-card-app">
            {item.action ? "Escolha seu banco" : item.application.name}
          </span>
        </>
      )}
      <div className="explore-card-copy">
        <h3>{title}</h3>
        <span className="explore-card-description">{description}</span>
      </div>
      <div className="explore-card-footer">
        <span className={`explore-card-status ${statusClass}`}>
          {status}
        </span>
        <span aria-hidden="true" className="explore-card-arrow">→</span>
      </div>
    </Link>
  );
}
