import type { ProgressRepository } from "./progress.repository.js";
import { logger } from "../../shared/utils/logger.js";

const COMPLETION_THRESHOLD = 0.9; // 90% watched = lesson complete

export class ProgressService {
  constructor(private readonly repo: ProgressRepository) {}

  // ─── Heartbeat / position update ─────────────────────────────────────────

  async updateProgress(
    userId: string,
    lessonId: string,
    courseId: string,
    positionSeconds: number,
    totalSeconds: number,
  ) {
    const watchedSeconds = Math.min(positionSeconds, totalSeconds);
    const ratio = totalSeconds > 0 ? watchedSeconds / totalSeconds : 0;
    const isComplete = ratio >= COMPLETION_THRESHOLD;

    const lessonPatch: Parameters<typeof this.repo.upsertLessonProgress>[2] = {
      watchedSeconds,
      totalSeconds,
      lastPositionSeconds: positionSeconds,
    };

    if (isComplete) {
      lessonPatch.status = "COMPLETED";
      lessonPatch.completedAt = new Date();
    } else if (watchedSeconds > 0) {
      lessonPatch.status = "IN_PROGRESS";
    }

    await this.repo.upsertLessonProgress(userId, lessonId, lessonPatch);

    if (isComplete) {
      await this.syncCourseProgress(userId, courseId);
    }

    logger.debug({ userId, lessonId, positionSeconds, isComplete }, "Progress updated");
  }

  // ─── Manual lesson completion ─────────────────────────────────────────────

  async completeLesson(userId: string, lessonId: string, courseId: string) {
    await this.repo.upsertLessonProgress(userId, lessonId, {
      status: "COMPLETED",
      completedAt: new Date(),
    });
    await this.syncCourseProgress(userId, courseId);
    logger.info({ userId, lessonId }, "Lesson manually marked complete");
  }

  // ─── Course progress summary ──────────────────────────────────────────────

  async getCourseProgress(userId: string, courseId: string) {
    return this.repo.getCourseProgress(userId, courseId);
  }

  // ─── Resume position ─────────────────────────────────────────────────────

  async getResumePosition(userId: string, lessonId: string): Promise<number> {
    const record = await this.repo.getLessonProgress(userId, lessonId);
    return record?.lastPositionSeconds ?? 0;
  }

  // ─── Student stats ────────────────────────────────────────────────────────

  async getStudentStats(userId: string) {
    return this.repo.getStudentStats(userId);
  }

  // ─── Continue watching ────────────────────────────────────────────────────

  async getContinueWatching(userId: string, limit = 5) {
    return this.repo.getRecentCourseProgress(userId, limit);
  }

  // ─── Bookmarks ────────────────────────────────────────────────────────────

  async toggleBookmark(userId: string, resourceType: string, resourceId: string) {
    return this.repo.toggleBookmark(userId, resourceType, resourceId);
  }

  async getUserBookmarks(userId: string, resourceType?: string) {
    return this.repo.getUserBookmarks(userId, resourceType);
  }

  // ─── Internal ─────────────────────────────────────────────────────────────

  private async syncCourseProgress(userId: string, courseId: string) {
    const [completed, total] = await Promise.all([
      this.repo.getCompletedLessonCount(userId, courseId),
      this.repo.getTotalLessonCount(courseId),
    ]);
    await this.repo.upsertCourseProgress(userId, courseId, completed, total);
  }
}
