import { z } from "zod";

const difficulty = z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "ALL"]);
const accessType = z.enum(["FREE", "SUBSCRIPTION", "PURCHASE"]);
const lessonType = z.enum(["VIDEO", "PDF", "EXERCISE", "MASTERCLASS", "BREAKDOWN"]);
const courseStatus = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);
const lessonStatus = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);

export const createCourseSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(120).trim(),
    subtitle: z.string().max(200).trim().optional(),
    description: z.string().max(5000).optional(),
    difficulty: difficulty.default("ALL"),
    accessType: accessType.default("SUBSCRIPTION"),
    price: z.number().int().positive().optional(),
    thumbnailUrl: z.string().url().optional(),
    tags: z.array(z.string()).max(10).optional(),
  }),
});

export const updateCourseSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    title: z.string().min(3).max(120).trim().optional(),
    subtitle: z.string().max(200).trim().optional(),
    description: z.string().max(5000).optional(),
    difficulty: difficulty.optional(),
    accessType: accessType.optional(),
    price: z.number().int().positive().optional(),
    thumbnailUrl: z.string().url().optional(),
    previewVideoUrl: z.string().url().optional(),
    status: courseStatus.optional(),
    tags: z.array(z.string()).max(10).optional(),
  }),
});

export const createLessonSchema = z.object({
  body: z.object({
    title: z.string().min(2).max(120).trim(),
    description: z.string().max(3000).optional(),
    type: lessonType.default("VIDEO"),
    sectionId: z.string().optional(),
    position: z.number().int().min(0).optional(),
    isFreePreview: z.boolean().default(false),
    estimatedDuration: z.number().int().positive().optional(),
  }),
});

export const updateLessonSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    title: z.string().min(2).max(120).trim().optional(),
    description: z.string().max(3000).optional(),
    type: lessonType.optional(),
    sectionId: z.string().nullable().optional(),
    position: z.number().int().min(0).optional(),
    isFreePreview: z.boolean().optional(),
    estimatedDuration: z.number().int().positive().optional(),
    status: lessonStatus.optional(),
    bpmMin: z.number().int().min(20).max(400).optional(),
    bpmMax: z.number().int().min(20).max(400).optional(),
    timeSignature: z.string().max(10).optional(),
    techniques: z.array(z.string().max(60)).max(20).optional(),
    styles: z.array(z.string().max(60)).max(20).optional(),
  }),
});

export const reorderLessonsSchema = z.object({
  body: z.object({
    lessons: z
      .array(z.object({ id: z.string(), position: z.number().int().min(0) }))
      .min(1),
  }),
});

export const coursesFilterSchema = z.object({
  query: z.object({
    difficulty: difficulty.optional(),
    accessType: accessType.optional(),
    status: courseStatus.optional(),
    tagSlug: z.string().optional(),
    search: z.string().max(100).optional(),
    page: z.coerce.number().int().min(1).default(1),
    perPage: z.coerce.number().int().min(1).max(50).default(20),
  }),
});
