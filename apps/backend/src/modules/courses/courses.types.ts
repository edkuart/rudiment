import type { courses, lessons, courseSections } from "../../shared/db/schema/index.js";

export type Course = typeof courses.$inferSelect;
export type Lesson = typeof lessons.$inferSelect;
export type CourseSection = typeof courseSections.$inferSelect;

export type CourseStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type LessonStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type Difficulty = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "ALL";
export type AccessType = "FREE" | "SUBSCRIPTION" | "PURCHASE";
export type LessonType = "VIDEO" | "PDF" | "EXERCISE" | "MASTERCLASS" | "BREAKDOWN";

export interface CreateCourseInput {
  title: string;
  subtitle?: string | undefined;
  description?: string | undefined;
  difficulty: Difficulty;
  accessType: AccessType;
  price?: number | undefined;
  tags?: string[] | undefined;
}

export interface UpdateCourseInput extends Partial<CreateCourseInput> {
  thumbnailUrl?: string | undefined;
  previewVideoUrl?: string | undefined;
  status?: CourseStatus | undefined;
}

export interface CreateLessonInput {
  courseId: string;
  sectionId?: string | undefined;
  title: string;
  description?: string | undefined;
  type: LessonType;
  position?: number | undefined;
  isFreePreview?: boolean | undefined;
  estimatedDuration?: number | undefined;
}

export interface UpdateLessonInput extends Partial<Omit<CreateLessonInput, "courseId">> {
  status?: LessonStatus | undefined;
}

export interface ReorderLessonsInput {
  lessons: Array<{ id: string; position: number }>;
}

export interface CourseWithMeta extends Course {
  totalLessons: number;
  tags: string[];
}

export interface CoursesFilter {
  difficulty?: Difficulty | undefined;
  accessType?: AccessType | undefined;
  status?: CourseStatus | undefined;
  tagSlug?: string | undefined;
  search?: string | undefined;
  page?: number | undefined;
  perPage?: number | undefined;
}
