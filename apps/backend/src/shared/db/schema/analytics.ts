import { pgTable, text, timestamp, integer, index } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { users } from "./users.js";
import { lessons } from "./courses.js";

export const videoPlayEvents = pgTable(
  "video_play_events",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
    lessonId: text("lesson_id").references(() => lessons.id, {
      onDelete: "set null",
    }),
    sessionId: text("session_id"), // correlationId de la sesión HTTP
    deviceType: text("device_type"), // "mobile" | "tablet" | "desktop"
    watchedSeconds: integer("watched_seconds").notNull().default(0),
    completionPercent: integer("completion_percent").notNull().default(0),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
    endedAt: timestamp("ended_at", { withTimezone: true }),
  },
  (t) => [
    index("video_play_events_user_idx").on(t.userId),
    index("video_play_events_lesson_idx").on(t.lessonId),
    index("video_play_events_started_at_idx").on(t.startedAt),
  ],
);

export const userActivityLog = pgTable(
  "user_activity_log",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
    eventType: text("event_type").notNull(), // "lesson.viewed" | "course.started" | "subscription.created" …
    resourceType: text("resource_type"), // "lesson" | "course" | "subscription"
    resourceId: text("resource_id"),
    metadata: text("metadata"), // JSON serializado
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("user_activity_log_user_idx").on(t.userId),
    index("user_activity_log_event_type_idx").on(t.eventType),
    index("user_activity_log_occurred_at_idx").on(t.occurredAt),
  ],
);
