import type { MetadataRoute } from "next";
import { API_V1 } from "@/lib/api-base";

const WEB_URL = process.env.NEXT_PUBLIC_WEB_URL ?? "http://localhost:3000";

async function fetchPublishedCourses(): Promise<Array<{ slug: string; updatedAt: string }>> {
  try {
    const res = await fetch(`${API_V1}/courses?status=PUBLISHED&perPage=200`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const body = await res.json();
    return (body.data?.rows ?? []).map((c: any) => ({
      slug: c.slug as string,
      updatedAt: (c.updatedAt ?? c.createdAt) as string,
    }));
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const courses = await fetchPublishedCourses();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: WEB_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${WEB_URL}/library`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
  ];

  const courseRoutes: MetadataRoute.Sitemap = courses.map((c) => ({
    url: `${WEB_URL}/library/${c.slug}`,
    lastModified: new Date(c.updatedAt),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...courseRoutes];
}
