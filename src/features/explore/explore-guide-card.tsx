import Link from "next/link";
import { getCategoryLabel } from "@/data/applications";
import { ApplicationLogo } from "@/features/applications/application-logo";
import { getExploreGuideHref, type ExploreGuideItem } from "./explore-content";

export type ExploreGuideCardVariant = "featured" | "standard";

interface ExploreGuideCardProps {
  item: ExploreGuideItem;
  variant?: ExploreGuideCardVariant;
  returnTo?: string;
}

export function ExploreGuideCard({ item, variant = "standard", returnTo }: ExploreGuideCardProps) {
  const title = item.action?.taskTitle ?? item.task.title;
  const description = item.action?.description ?? item.task.description;

  return (
    <Link
      href={getExploreGuideHref(item, returnTo)}
      className={`explore-guide-card${variant === "featured" ? " explore-guide-card--featured" : ""}`}
    >
      {variant === "featured" ? (
        <div className="explore-card-identity">
          <span className="explore-card-app-mark">
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
        <span aria-hidden="true" className="explore-card-arrow">→</span>
      </div>
    </Link>
  );
}
