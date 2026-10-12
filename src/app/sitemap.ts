import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";
import { allProjects } from "@/data/portfolio";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteUrl, changeFrequency: "monthly", priority: 1 },
    ...allProjects.map(project => ({ url: `${siteUrl}/projects/${project.slug}`, changeFrequency: "monthly" as const, priority: 0.7 })),
  ];
}
