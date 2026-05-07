import { relations } from "drizzle-orm";
import {
  users,
  profiles,
  sessions,
  plans,
  subscriptions,
  payments,
  courses,
  courseSections,
  lessons,
  videoAssets,
  mediaFiles,
  lessonProgress,
  courseProgress,
  bookmarks,
} from "./schema/index.js";

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, { fields: [users.id], references: [profiles.userId] }),
  subscriptions: many(subscriptions),
  payments: many(payments),
  lessonProgress: many(lessonProgress),
  courseProgress: many(courseProgress),
  bookmarks: many(bookmarks),
}));

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, { fields: [profiles.userId], references: [users.id] }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const plansRelations = relations(plans, ({ many }) => ({
  subscriptions: many(subscriptions),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one, many }) => ({
  user: one(users, { fields: [subscriptions.userId], references: [users.id] }),
  plan: one(plans, { fields: [subscriptions.planId], references: [plans.id] }),
  payments: many(payments),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  user: one(users, { fields: [payments.userId], references: [users.id] }),
  subscription: one(subscriptions, {
    fields: [payments.subscriptionId],
    references: [subscriptions.id],
  }),
}));

export const coursesRelations = relations(courses, ({ many }) => ({
  sections: many(courseSections),
  lessons: many(lessons),
  mediaFiles: many(mediaFiles),
}));

export const courseSectionsRelations = relations(courseSections, ({ one, many }) => ({
  course: one(courses, { fields: [courseSections.courseId], references: [courses.id] }),
  lessons: many(lessons),
}));

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  course: one(courses, { fields: [lessons.courseId], references: [courses.id] }),
  section: one(courseSections, {
    fields: [lessons.sectionId],
    references: [courseSections.id],
  }),
  videoAsset: one(videoAssets, {
    fields: [lessons.id],
    references: [videoAssets.lessonId],
  }),
  mediaFiles: many(mediaFiles),
  progress: many(lessonProgress),
}));

export const videoAssetsRelations = relations(videoAssets, ({ one }) => ({
  lesson: one(lessons, { fields: [videoAssets.lessonId], references: [lessons.id] }),
}));

export const mediaFilesRelations = relations(mediaFiles, ({ one }) => ({
  lesson: one(lessons, {
    fields: [mediaFiles.lessonId],
    references: [lessons.id],
  }),
  course: one(courses, {
    fields: [mediaFiles.courseId],
    references: [courses.id],
  }),
}));

export const lessonProgressRelations = relations(lessonProgress, ({ one }) => ({
  user: one(users, { fields: [lessonProgress.userId], references: [users.id] }),
  lesson: one(lessons, { fields: [lessonProgress.lessonId], references: [lessons.id] }),
}));

export const courseProgressRelations = relations(courseProgress, ({ one }) => ({
  user: one(users, { fields: [courseProgress.userId], references: [users.id] }),
  course: one(courses, { fields: [courseProgress.courseId], references: [courses.id] }),
}));

export const bookmarksRelations = relations(bookmarks, ({ one }) => ({
  user: one(users, { fields: [bookmarks.userId], references: [users.id] }),
}));
