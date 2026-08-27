import type { Application } from "@/types/content";

export function ApplicationLogo({ application }: { application: Application }) {
  if (application.logoPath) {
    return <img src={application.logoPath} alt={`Logo do ${application.name}`} className="application-logo-image" />;
  }

  return <span aria-hidden="true">{application.name.slice(0, 2).toUpperCase()}</span>;
}
