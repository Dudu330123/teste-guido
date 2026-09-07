import Image from "next/image";
import { getLocalApplicationLogoPath } from "@/data/applications";
import type { Application } from "@/types/content";

export function ApplicationLogo({ application }: { application: Application }) {
  const logoPath = application.logoPath ?? getLocalApplicationLogoPath(application.slug);

  if (logoPath) {
    return (
      <Image
        src={logoPath}
        alt={`Logo do ${application.name}`}
        width={64}
        height={64}
        unoptimized
        className="application-logo-image"
      />
    );
  }

  return <span aria-hidden="true">{application.name.slice(0, 2).toUpperCase()}</span>;
}
