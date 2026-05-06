import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { lessons, courses } from "./courses.js";

export const mediaFileTypeEnum = pgEnum("media_file_type", [
  "PDF",
  "AUDIO",
  "IMAGE",
  "DOWNLOAD",
]);

export const mediaFiles = pgTable("media_files", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  // Puede estar asociado a una lección, a un curso, o ser standalone
  lessonId: text("lesson_id").references(() => lessons.id, {
    onDelete: "cascade",
  }),
  courseId: text("course_id").references(() => courses.id, {
    onDelete: "cascade",
  }),
  type: mediaFileTypeEnum("type").notNull(),
  label: text("label").notNull(), // nombre visible: "Drum Sheet — Lesson 3"
  filename: text("filename").notNull(), // nombre original del archivo
  mimeType: text("mime_type").notNull(),
  sizeBytes: integer("size_bytes"),
  storageKey: text("storage_key").notNull(), // path en R2: "media/lessons/abc/sheet.pdf"
  isPublic: boolean("is_public").notNull().default(false),
  position: integer("position").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});
