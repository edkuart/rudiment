import {
  pgTable,
  text,
  timestamp,
  integer,
  pgEnum,
  unique,
} from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { users } from "./users.js";
import { lessons, courses } from "./courses.js";

export const lessonProgressStatusEnum = pgEnum("lesson_progress_status", [
  "NOT_STARTED",
  "IN_PROGRESS",
  "COMPLETED",
]);

export const lessonProgress = pgTable(
  "lesson_progress",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    lessonId: text("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    status: lessonProgressStatusEnum("status").notNull().default("NOT_STARTED"),
    watchedSeconds: integer("watched_seconds").notNull().default(0),
    totalSeconds: integer("total_seconds").notNull().default(0),
    lastPositionSeconds: integer("last_position_seconds").notNull().default(0),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique("lesson_progress_user_lesson_unique").on(t.userId, t.lessonId)],
);

export const courseProgress = pgTable(
  "course_progress",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    courseId: text("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    completedLessons: integer("completed_lessons").notNull().default(0),
    totalLessons: integer("total_lessons").notNull().default(0),
    percentComplete: integer("percent_complete").notNull().default(0), // 0–100
    startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    lastActivityAt: timestamp("last_activity_at", {
      withTimezone: true,
    }).notNull().defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique("course_progress_user_course_unique").on(t.userId, t.courseId)],
);

export const bookmarks = pgTable(
  "bookmarks",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    resourceType: text("resource_type").notNull(), // "course" | "lesson"
    resourceId: text("resource_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    unique("bookmarks_user_resource_unique").on(
      t.userId,
      t.resourceType,
      t.resourceId,
    ),
  ],
);
