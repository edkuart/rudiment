import { z } from "zod";

const mediaTypeEnum = z.enum(["PDF", "AUDIO", "IMAGE", "DOWNLOAD"]);

export const createMediaSchema = z.object({
  body: z.object({
    lessonId: z.string().optional(),
    courseId: z.string().optional(),
    type: mediaTypeEnum,
    label: z.string().min(1).max(200),
    filename: z.string().min(1).max(255),
    mimeType: z.string().min(1).max(100),
    sizeBytes: z.number().int().positive().optional(),
    isPublic: z.boolean().optional(),
    position: z.number().int().min(0).optional(),
  }).refine((d) => d.lessonId ?? d.courseId, {
    message: "Either lessonId or courseId is required",
  }),
});
