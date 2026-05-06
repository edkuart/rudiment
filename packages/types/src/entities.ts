// Core domain entity types shared between web and api

export type UserRole = "STUDENT" | "ADMIN" | "INSTRUCTOR";

export type SkillLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export type SubscriptionStatus =
  | "ACTIVE"
  | "TRIALING"
  | "PAST_DUE"
  | "CANCELLED"
  | "PAUSED";

export type PlanSlug = "monthly" | "annual" | "lifetime";

export type CourseStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type LessonType =
  | "VIDEO"
  | "PDF"
  | "EXERCISE"
  | "MASTERCLASS"
  | "BREAKDOWN";

export type LessonStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type AccessType = "FREE" | "SUBSCRIPTION" | "PURCHASE";

export type Difficulty = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "ALL";

export type EntitlementSource =
  | "SUBSCRIPTION"
  | "ONE_TIME_PURCHASE"
  | "GIFT"
  | "ADMIN_GRANT";

export type EntitlementResourceType = "PLAN" | "COURSE" | "BUNDLE";

export type VideoAssetStatus = "WAITING" | "READY" | "ERRORED";

export type MediaFileType = "PDF" | "AUDIO" | "IMAGE" | "DOWNLOAD";

export type LessonProgressStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
