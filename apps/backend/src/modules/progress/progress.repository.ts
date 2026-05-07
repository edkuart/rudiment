import { eq, and, sql } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { lessonProgress, courseProgress, bookmarks } from "../../shared/db/schema/progress.js";

export class ProgressRepository {
  constructor(private readonly db: NodePgDatabase<any>) {}

  // ─── Lesson progress ──────────────────────────────────────────────────────

  async upsertLessonProgress(
    userId: string,
    lessonId: string,
    patch: {
      status?: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
      watchedSeconds?: number;
      totalSeconds?: number;
      lastPositionSeconds?: number;
      completedAt?: Date | null;
    },
  ) {
    const now = new Date();
    const [row] = await this.db
      .insert(lessonProgress)
      .values({
        userId,
        lessonId,
        status: patch.status ?? "IN_PROGRESS",
        watchedSeconds: patch.watchedSeconds ?? 0,
        totalSeconds: patch.totalSeconds ?? 0,
        lastPositionSeconds: patch.lastPositionSeconds ?? 0,
        completedAt: patch.completedAt ?? null,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: [lessonProgress.userId, lessonProgress.lessonId],
        set: {
          ...(patch.status !== undefined ? { status: patch.status } : {}),
          ...(patch.watchedSeconds !== undefined ? { watchedSeconds: patch.watchedSeconds } : {}),
          ...(patch.totalSeconds !== undefined ? { totalSeconds: patch.totalSeconds } : {}),
          ...(patch.lastPositionSeconds !== undefined ? { lastPositionSeconds: patch.lastPositionSeconds } : {}),
          ...(patch.completedAt !== undefined ? { completedAt: patch.completedAt } : {}),
          updatedAt: now,
        },
      })
      .returning();
    return row!;
  }

  async getLessonProgress(userId: string, lessonId: string) {
    const [row] = await this.db
      .select()
      .from(lessonProgress)
      .where(and(eq(lessonProgress.userId, userId), eq(lessonProgress.lessonId, lessonId)));
    return row ?? null;
  }

  async getCompletedLessonCount(userId: string, courseId: string): Promise<number> {
    const result = await this.db.execute<{ count: string }>(sql`
      SELECT COUNT(lp.id)::text AS count
      FROM lesson_progress lp
      JOIN lessons l ON l.id = lp.lesson_id
      WHERE lp.user_id = ${userId}
        AND l.course_id = ${courseId}
        AND lp.status = 'COMPLETED'
    `);
    return parseInt(result.rows[0]?.count ?? "0", 10);
  }

  async getTotalLessonCount(courseId: string): Promise<number> {
    const result = await this.db.execute<{ count: string }>(sql`
      SELECT COUNT(id)::text AS count FROM lessons
      WHERE course_id = ${courseId} AND deleted_at IS NULL AND status = 'PUBLISHED'
    `);
    return parseInt(result.rows[0]?.count ?? "0", 10);
  }

  // ─── Course progress ──────────────────────────────────────────────────────

  async upsertCourseProgress(
    userId: string,
    courseId: string,
    completedLessons: number,
    totalLessons: number,
  ) {
    const percent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    const now = new Date();
    const completedAt = percent === 100 ? now : null;

    const [row] = await this.db
      .insert(courseProgress)
      .values({
        userId,
        courseId,
        completedLessons,
        totalLessons,
        percentComplete: percent,
        completedAt,
        lastActivityAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: [courseProgress.userId, courseProgress.courseId],
        set: {
          completedLessons,
          totalLessons,
          percentComplete: percent,
          completedAt,
          lastActivityAt: now,
          updatedAt: now,
        },
      })
      .returning();
    return row!;
  }

  async getCourseProgress(userId: string, courseId: string) {
    const [row] = await this.db
      .select()
      .from(courseProgress)
      .where(and(eq(courseProgress.userId, userId), eq(courseProgress.courseId, courseId)));
    return row ?? null;
  }

  async getStudentStats(userId: string) {
    const result = await this.db.execute<{
      enrolled: string;
      completed_lessons: string;
      completed_courses: string;
      bookmarks: string;
    }>(sql`
      SELECT
        (SELECT COUNT(DISTINCT course_id)::text FROM course_progress WHERE user_id = ${userId}) AS enrolled,
        (SELECT COUNT(*)::text FROM lesson_progress WHERE user_id = ${userId} AND status = 'COMPLETED') AS completed_lessons,
        (SELECT COUNT(*)::text FROM course_progress WHERE user_id = ${userId} AND percent_complete = 100) AS completed_courses,
        (SELECT COUNT(*)::text FROM bookmarks WHERE user_id = ${userId}) AS bookmarks
    `);
    const row = result.rows[0];
    return {
      enrolledCourses: parseInt(row?.enrolled ?? "0", 10),
      completedLessons: parseInt(row?.completed_lessons ?? "0", 10),
      completedCourses: parseInt(row?.completed_courses ?? "0", 10),
      bookmarks: parseInt(row?.bookmarks ?? "0", 10),
    };
  }

  async getRecentCourseProgress(userId: string, limit: number) {
    return this.db
      .select()
      .from(courseProgress)
      .where(eq(courseProgress.userId, userId))
      .orderBy(sql`${courseProgress.lastActivityAt} DESC`)
      .limit(limit);
  }

  // ─── Bookmarks ────────────────────────────────────────────────────────────

  async toggleBookmark(
    userId: string,
    resourceType: string,
    resourceId: string,
  ): Promise<{ bookmarked: boolean }> {
    const existing = await this.db
      .select()
      .from(bookmarks)
      .where(
        and(
          eq(bookmarks.userId, userId),
          eq(bookmarks.resourceType, resourceType),
          eq(bookmarks.resourceId, resourceId),
        ),
      );

    if (existing.length > 0) {
      await this.db
        .delete(bookmarks)
        .where(
          and(
            eq(bookmarks.userId, userId),
            eq(bookmarks.resourceType, resourceType),
            eq(bookmarks.resourceId, resourceId),
          ),
        );
      return { bookmarked: false };
    }

    await this.db.insert(bookmarks).values({ userId, resourceType, resourceId });
    return { bookmarked: true };
  }

  async getUserBookmarks(userId: string, resourceType?: string) {
    const conditions = resourceType
      ? and(eq(bookmarks.userId, userId), eq(bookmarks.resourceType, resourceType))
      : eq(bookmarks.userId, userId);

    return this.db
      .select()
      .from(bookmarks)
      .where(conditions)
      .orderBy(sql`${bookmarks.createdAt} DESC`);
  }
}
