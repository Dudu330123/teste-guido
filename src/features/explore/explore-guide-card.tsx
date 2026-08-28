import Link from "next/link";
import { ApplicationLogo } from "@/features/applications/application-logo";
import { getExploreGuideHref, type ExploreGuideItem } from "./explore-content";

export type ExploreGuideCardVariant = "featured" | "standard";

interface ExploreGuideCardProps {
  item: ExploreGuideItem;
  variant?: ExploreGuideCardVariant;
}

function getCardStatus(item: ExploreGuideItem) {
  if (item.action) return "Escolha o aplicativo";
  if (item.task.availability === "demo") return "Demonstração disponível";
  return item.task.availability === "preparing" ? "Guia em preparação" : "Guia disponível";
}

export function ExploreGuideCard({ item, variant = "standard" }: ExploreGuideCardProps) {
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
      href={getExploreGuideHref(item)}
      className={`explore-guide-card${variant === "featured" ? " explore-guide-card--featured" : ""}`}
    >
      {variant === "featured" ? (
        <div className="explore-card-identity">
          <span className="explore-card-app-mark">
            <ApplicationLogo application={item.application} />
          </span>
          <span className="explore-card-badge">
            {item.action ? "Serviços financeiros" : item.application.category}
          </span>
          <span className="explore-card-app">
            {item.action ? "Escolha seu banco" : item.application.name}
          </span>
        </div>
      ) : (
        <>
          <span className="explore-card-badge">
            {item.action ? "Serviços financeiros" : item.application.category}
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
