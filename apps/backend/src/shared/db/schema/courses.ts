import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

export const courseStatusEnum = pgEnum("course_status", [
  "DRAFT",
  "PUBLISHED",
  "ARCHIVED",
]);

export const difficultyEnum = pgEnum("difficulty", [
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
  "ALL",
]);

export const accessTypeEnum = pgEnum("access_type", [
  "FREE",
  "SUBSCRIPTION",
  "PURCHASE",
]);

export const courses = pgTable("courses", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  description: text("description"),
  thumbnailUrl: text("thumbnail_url"),
  previewVideoUrl: text("preview_video_url"), // trailer público (no protegido)
  difficulty: difficultyEnum("difficulty").notNull().default("ALL"),
  accessType: accessTypeEnum("access_type").notNull().default("SUBSCRIPTION"),
  price: integer("price"), // centavos — solo aplica si accessType = PURCHASE
  status: courseStatusEnum("status").notNull().default("DRAFT"),
  estimatedDuration: integer("estimated_duration").default(0), // minutos totales
  totalLessons: integer("total_lessons").notNull().default(0), // calculado/cached
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }), // soft delete
});

export const courseSections = pgTable("course_sections", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  courseId: text("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  position: integer("position").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const lessonTypeEnum = pgEnum("lesson_type", [
  "VIDEO",
  "PDF",
  "EXERCISE",
  "MASTERCLASS",
  "BREAKDOWN",
]);

export const lessonStatusEnum = pgEnum("lesson_status", [
  "DRAFT",
  "PUBLISHED",
  "ARCHIVED",
]);

export const lessons = pgTable("lessons", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  courseId: text("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  sectionId: text("section_id").references(() => courseSections.id, {
    onDelete: "set null",
  }),
  slug: text("slug").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  type: lessonTypeEnum("type").notNull().default("VIDEO"),
  status: lessonStatusEnum("status").notNull().default("DRAFT"),
  position: integer("position").notNull().default(0),
  isFreePreview: boolean("is_free_preview").notNull().default(false),
  estimatedDuration: integer("estimated_duration"), // minutos
  bpmMin: integer("bpm_min"),
  bpmMax: integer("bpm_max"),
  timeSignature: text("time_signature"),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }), // soft delete
});

export const tags = pgTable("tags", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  category: text("category").notNull().default("general"), // genre | style | technique | level
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const courseTags = pgTable("course_tags", {
  courseId: text("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  tagId: text("tag_id")
    .notNull()
    .references(() => tags.id, { onDelete: "cascade" }),
});

export const lessonTags = pgTable("lesson_tags", {
  lessonId: text("lesson_id")
    .notNull()
    .references(() => lessons.id, { onDelete: "cascade" }),
  tagId: text("tag_id")
    .notNull()
    .references(() => tags.id, { onDelete: "cascade" }),
});
