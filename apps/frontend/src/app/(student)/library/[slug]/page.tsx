import type { Metadata } from "next";
import CourseDetailClient from "./_client";
import { API_V1 } from "@/lib/api-base";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  try {
    const { slug } = await params;
    const res = await fetch(`${API_V1}/courses/slug/${slug}`, { next: { revalidate: 3600 } });
    if (!res.ok) return {};
    const body = await res.json();
    const course = body.data;
    return {
      title: course.title,
      description: course.description?.slice(0, 160) ?? course.subtitle ?? undefined,
      openGraph: {
        title: course.title,
        description: course.description?.slice(0, 160) ?? course.subtitle ?? undefined,
        images: course.thumbnailUrl ? [{ url: course.thumbnailUrl as string }] : [],
        type: "website",
      },
    };
  } catch {
    return {};
  }
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <CourseDetailClient slug={slug} />;
}
