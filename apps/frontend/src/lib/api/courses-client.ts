import { apiV1Path } from "@/lib/api-base";
import { fetchApi, fetchApiData } from "@/lib/api-fetch";

async function request<T>(
  path: string,
  init?: RequestInit,
  auth: "none" | "optional" | "required" = "optional",
): Promise<T> {
  return fetchApiData<T>(path, { ...init, auth });
}

export interface CourseListItem {
  id: string;
  title: string;
  slug: string;
  subtitle: string | null;
  status: string;
  difficulty: string;
  accessType: string;
  totalLessons: number;
  thumbnailUrl: string | null;
  publishedAt: string | null;
  createdAt: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export const coursesClient = {
  list: (params?: Record<string, string>) => {
    const qs = params ? `?${new URLSearchParams(params)}` : "";
    return request<{ rows: CourseListItem[]; meta: { total: number } }>(`/courses${qs}`).then(
      (data) => data,
    );
  },

  getById: (id: string) => request<CourseListItem>(`/courses/${id}`),

  getBySlug: (slug: string) => request<any>(`/courses/slug/${slug}`),

  create: (body: Record<string, unknown>) =>
    request<CourseListItem>("/courses", {
      method: "POST",
      body: JSON.stringify(body),
    }, "required"),

  update: (id: string, body: Record<string, unknown>) =>
    request<CourseListItem>(`/courses/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }, "required"),

  delete: (id: string) =>
    fetchApi(apiV1Path(`/courses/${id}`), {
      method: "DELETE",
      auth: "required",
      base: "origin",
    }),

  createLesson: (courseId: string, body: Record<string, unknown>) =>
    request<any>(`/courses/${courseId}/lessons`, {
      method: "POST",
      body: JSON.stringify(body),
    }, "required"),

  createSection: (courseId: string, title: string) =>
    request<any>(`/courses/${courseId}/sections`, {
      method: "POST",
      body: JSON.stringify({ title }),
    }, "required"),

  getTags: () => request<Tag[]>("/courses/tags"),
};
