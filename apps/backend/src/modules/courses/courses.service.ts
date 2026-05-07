import type { CoursesRepository } from "./courses.repository.js";
import type { EntitlementsService } from "../entitlements/entitlements.service.js";
import type {
  CreateCourseInput,
  UpdateCourseInput,
  CreateLessonInput,
  UpdateLessonInput,
  CoursesFilter,
} from "./courses.types.js";
import { AppError, NotFoundError, ForbiddenError } from "../../shared/middleware/error-handler.js";

export class CoursesService {
  constructor(
    private readonly repo: CoursesRepository,
    private readonly entitlements: EntitlementsService,
  ) {}

  // ─── Courses ─────────────────────────────────────────────────────────────

  async listCourses(filter: CoursesFilter) {
    return this.repo.findMany(filter);
  }

  async getCourseBySlug(slug: string, userId?: string) {
    const course = await this.repo.findBySlug(slug);
    if (!course) throw new NotFoundError("Course not found");

    const tags = await this.repo.getCourseTagNames(course.id);

    // Determine which lessons the user can access
    const canAccessAll =
      userId !== undefined &&
      (await this.entitlements.hasAccess(userId, "COURSE", course.id));

    // Filter out non-preview lessons for users without access
    const sections = course.sections.map((section) => ({
      ...section,
      lessons: section.lessons.filter(
        (l) => l.status === "PUBLISHED" && (l.isFreePreview || canAccessAll),
      ),
    }));

    return { ...course, sections, tags };
  }

  async getCourseById(id: string) {
    const course = await this.repo.findById(id);
    if (!course) throw new NotFoundError("Course not found");
    const tags = await this.repo.getCourseTagNames(id);
    return { ...course, tags };
  }

  async createCourse(input: CreateCourseInput) {
    const { tags, ...courseData } = input;
    const course = await this.repo.create(courseData);

    if (tags && tags.length > 0) {
      const tagRecords = await this.repo.findOrCreateTags(tags);
      await this.repo.setCourseTags(
        course.id,
        tagRecords.map((t) => t.id),
      );
    }

    return course;
  }

  async updateCourse(id: string, input: UpdateCourseInput) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundError("Course not found");

    const { tags, ...courseData } = input;
    const updated = await this.repo.update(id, courseData);

    if (tags !== undefined) {
      if (tags.length > 0) {
        const tagRecords = await this.repo.findOrCreateTags(tags);
        await this.repo.setCourseTags(
          id,
          tagRecords.map((t) => t.id),
        );
      } else {
        await this.repo.setCourseTags(id, []);
      }
    }

    return updated;
  }

  async deleteCourse(id: string) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundError("Course not found");
    await this.repo.softDelete(id);
  }

  // ─── Lessons ─────────────────────────────────────────────────────────────

  async getLessonById(lessonId: string, userId?: string) {
    const lesson = await this.repo.findLessonById(lessonId);
    if (!lesson) throw new NotFoundError("Lesson not found");

    if (!lesson.isFreePreview && userId !== undefined) {
      const allowed = await this.entitlements.hasAccess(userId, "COURSE", lesson.courseId);
      if (!allowed) throw new ForbiddenError("Subscription required to access this lesson");
    }

    return lesson;
  }

  async getLessonsBySlugAndCourse(slug: string, courseSlug: string, userId?: string) {
    const course = await this.repo.findBySlug(courseSlug);
    if (!course) throw new NotFoundError("Course not found");

    const lesson = await this.repo.findLessonBySlugAndCourse(slug, course.id);
    if (!lesson) throw new NotFoundError("Lesson not found");

    if (!lesson.isFreePreview) {
      if (!userId) throw new ForbiddenError("Authentication required");
      const allowed = await this.entitlements.hasAccess(userId, "COURSE", course.id);
      if (!allowed) throw new ForbiddenError("Subscription required to access this lesson");
    }

    return lesson;
  }

  async createLesson(courseId: string, input: CreateLessonInput) {
    const course = await this.repo.findById(courseId);
    if (!course) throw new NotFoundError("Course not found");

    const lesson = await this.repo.createLesson(courseId, input);
    await this.repo.updateTotalLessons(courseId);
    return lesson;
  }

  async updateLesson(lessonId: string, input: UpdateLessonInput) {
    const lesson = await this.repo.findLessonById(lessonId);
    if (!lesson) throw new NotFoundError("Lesson not found");

    const updated = await this.repo.updateLesson(lessonId, input);

    if (input.status !== undefined) {
      await this.repo.updateTotalLessons(lesson.courseId);
    }

    return updated;
  }

  async deleteLesson(lessonId: string) {
    const lesson = await this.repo.findLessonById(lessonId);
    if (!lesson) throw new NotFoundError("Lesson not found");
    await this.repo.softDeleteLesson(lessonId);
    await this.repo.updateTotalLessons(lesson.courseId);
  }

  async reorderLessons(courseId: string, updates: Array<{ id: string; position: number }>) {
    const course = await this.repo.findById(courseId);
    if (!course) throw new NotFoundError("Course not found");
    await this.repo.reorderLessons(updates);
  }

  // ─── Sections ────────────────────────────────────────────────────────────

  async createSection(courseId: string, title: string, position?: number) {
    const course = await this.repo.findById(courseId);
    if (!course) throw new NotFoundError("Course not found");
    return this.repo.createSection(courseId, title, position);
  }

  // ─── Tags ────────────────────────────────────────────────────────────────

  async getAllTags() {
    return this.repo.getAllTags();
  }
}
