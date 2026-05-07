import { z } from "zod";

export const heartbeatSchema = z.object({
  body: z.object({
    lessonId: z.string().min(1),
    courseId: z.string().min(1),
    positionSeconds: z.number().int().min(0),
    totalSeconds: z.number().int().min(1),
  }),
});

export const completeLessonSchema = z.object({
  body: z.object({
    courseId: z.string().min(1),
  }),
});

export const bookmarkSchema = z.object({
  body: z.object({
    resourceType: z.enum(["course", "lesson"]),
    resourceId: z.string().min(1),
  }),
});
