import { describe, it, expect, beforeEach, vi } from "vitest";
import { CoursesService } from "../courses.service.js";
import { NotFoundError, ForbiddenError } from "../../../shared/middleware/error-handler.js";

const mockRepo = {
  findMany: vi.fn(),
  findBySlug: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  softDelete: vi.fn(),
  updateTotalLessons: vi.fn(),
  findLessonsByCourse: vi.fn(),
  findLessonById: vi.fn(),
  findLessonBySlugAndCourse: vi.fn(),
  createLesson: vi.fn(),
  updateLesson: vi.fn(),
  softDeleteLesson: vi.fn(),
  reorderLessons: vi.fn(),
  createSection: vi.fn(),
  findOrCreateTags: vi.fn(),
  setCourseTags: vi.fn(),
  getCourseTagNames: vi.fn(),
  getAllTags: vi.fn(),
};

const mockEntitlements = {
  hasAccess: vi.fn(),
};

const makeCourse = (overrides = {}) => ({
  id: "course-1",
  title: "Rudiments 101",
  slug: "rudiments-101",
  status: "PUBLISHED",
  deletedAt: null,
  sections: [],
  ...overrides,
});

const makeLesson = (overrides = {}) => ({
  id: "lesson-1",
  courseId: "course-1",
  title: "Single Stroke Roll",
  slug: "single-stroke-roll",
  isFreePreview: false,
  status: "PUBLISHED",
  ...overrides,
});

describe("CoursesService", () => {
  let service: CoursesService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new CoursesService(mockRepo as any, mockEntitlements as any);
  });

  describe("getCourseBySlug", () => {
    it("throws NotFoundError when course does not exist", async () => {
      mockRepo.findBySlug.mockResolvedValue(undefined);
      await expect(service.getCourseBySlug("unknown")).rejects.toThrow(NotFoundError);
    });

    it("returns course with tags for public users", async () => {
      const course = makeCourse({ sections: [] });
      mockRepo.findBySlug.mockResolvedValue(course);
      mockRepo.getCourseTagNames.mockResolvedValue(["drumming", "rudiments"]);

      const result = await service.getCourseBySlug("rudiments-101");
      expect(result.tags).toEqual(["drumming", "rudiments"]);
    });

    it("hides non-preview lessons for users without entitlement", async () => {
      const course = makeCourse({
        sections: [
          {
            id: "s1",
            lessons: [
              { id: "l1", isFreePreview: true, status: "PUBLISHED" },
              { id: "l2", isFreePreview: false, status: "PUBLISHED" },
            ],
          },
        ],
      });
      mockRepo.findBySlug.mockResolvedValue(course);
      mockRepo.getCourseTagNames.mockResolvedValue([]);
      mockEntitlements.hasAccess.mockResolvedValue(false);

      const result = await service.getCourseBySlug("rudiments-101", "user-1");
      expect(result.sections[0]!.lessons).toHaveLength(1);
      expect(result.sections[0]!.lessons[0]!.id).toBe("l1");
    });

    it("shows all published lessons for entitled users", async () => {
      const course = makeCourse({
        sections: [
          {
            id: "s1",
            lessons: [
              { id: "l1", isFreePreview: true, status: "PUBLISHED" },
              { id: "l2", isFreePreview: false, status: "PUBLISHED" },
            ],
          },
        ],
      });
      mockRepo.findBySlug.mockResolvedValue(course);
      mockRepo.getCourseTagNames.mockResolvedValue([]);
      mockEntitlements.hasAccess.mockResolvedValue(true);

      const result = await service.getCourseBySlug("rudiments-101", "user-1");
      expect(result.sections[0]!.lessons).toHaveLength(2);
    });
  });

  describe("createCourse", () => {
    it("creates a course and saves tags", async () => {
      const created = makeCourse();
      mockRepo.create.mockResolvedValue(created);
      mockRepo.findOrCreateTags.mockResolvedValue([{ id: "tag-1", slug: "drumming" }]);
      mockRepo.setCourseTags.mockResolvedValue(undefined);

      const result = await service.createCourse({
        title: "Rudiments 101",
        difficulty: "BEGINNER",
        accessType: "SUBSCRIPTION",
        tags: ["drumming"],
      });

      expect(result.id).toBe("course-1");
      expect(mockRepo.setCourseTags).toHaveBeenCalledWith("course-1", ["tag-1"]);
    });

    it("creates a course without tags", async () => {
      const created = makeCourse();
      mockRepo.create.mockResolvedValue(created);

      await service.createCourse({
        title: "Rudiments 101",
        difficulty: "BEGINNER",
        accessType: "SUBSCRIPTION",
      });

      expect(mockRepo.setCourseTags).not.toHaveBeenCalled();
    });
  });

  describe("getLessonById", () => {
    it("throws NotFoundError when lesson does not exist", async () => {
      mockRepo.findLessonById.mockResolvedValue(undefined);
      await expect(service.getLessonById("bad-id")).rejects.toThrow(NotFoundError);
    });

    it("throws ForbiddenError when user lacks entitlement on non-preview lesson", async () => {
      mockRepo.findLessonById.mockResolvedValue(makeLesson({ isFreePreview: false }));
      mockEntitlements.hasAccess.mockResolvedValue(false);
      await expect(service.getLessonById("lesson-1", "user-1")).rejects.toThrow(ForbiddenError);
    });

    it("returns free preview lessons without entitlement check", async () => {
      const lesson = makeLesson({ isFreePreview: true });
      mockRepo.findLessonById.mockResolvedValue(lesson);

      const result = await service.getLessonById("lesson-1");
      expect(result.id).toBe("lesson-1");
      expect(mockEntitlements.hasAccess).not.toHaveBeenCalled();
    });
  });

  describe("deleteLesson", () => {
    it("throws NotFoundError when lesson does not exist", async () => {
      mockRepo.findLessonById.mockResolvedValue(undefined);
      await expect(service.deleteLesson("bad-id")).rejects.toThrow(NotFoundError);
    });

    it("soft deletes and updates total lesson count", async () => {
      mockRepo.findLessonById.mockResolvedValue(makeLesson());
      mockRepo.softDeleteLesson.mockResolvedValue(undefined);
      mockRepo.updateTotalLessons.mockResolvedValue(undefined);

      await service.deleteLesson("lesson-1");

      expect(mockRepo.softDeleteLesson).toHaveBeenCalledWith("lesson-1");
      expect(mockRepo.updateTotalLessons).toHaveBeenCalledWith("course-1");
    });
  });
});
