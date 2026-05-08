import { eq, and, isNull, ilike, inArray, or, sql, count, desc, asc } from "drizzle-orm";
import type { Db } from "../../shared/db/index.js";
import {
  courses,
  lessons,
  courseSections,
  tags,
  courseTags,
  lessonTags,
} from "../../shared/db/schema/index.js";
import type {
  CreateCourseInput,
  UpdateCourseInput,
  CreateLessonInput,
  UpdateLessonInput,
  CoursesFilter,
} from "./courses.types.js";
import slugify from "slugify";
import { createId } from "@paralleldrive/cuid2";

export class CoursesRepository {
  constructor(private readonly db: Db) {}

  // ─── Courses ─────────────────────────────────────────────────────────────

  async findMany(filter: CoursesFilter) {
    const page = filter.page ?? 1;
    const perPage = filter.perPage ?? 20;
    const offset = (page - 1) * perPage;

    const conditions = [isNull(courses.deletedAt)];

    if (filter.status) conditions.push(eq(courses.status, filter.status));
    if (filter.difficulty) conditions.push(eq(courses.difficulty, filter.difficulty));
    if (filter.accessType) conditions.push(eq(courses.accessType, filter.accessType));
    if (filter.search) {
      conditions.push(
        or(
          ilike(courses.title, `%${filter.search}%`),
          ilike(courses.subtitle, `%${filter.search}%`),
        )!,
      );
    }

    if (filter.tagSlug) {
      conditions.push(
        inArray(
          courses.id,
          this.db
            .select({ id: courseTags.courseId })
            .from(courseTags)
            .innerJoin(tags, eq(courseTags.tagId, tags.id))
            .where(eq(tags.slug, filter.tagSlug)),
        ),
      );
    }

    const [rows, [totalRow]] = await Promise.all([
      this.db.query.courses.findMany({
        where: and(...conditions),
        orderBy: [desc(courses.publishedAt), desc(courses.createdAt)],
        limit: perPage,
        offset,
        with: {
          sections: { columns: { id: true } },
        },
      }),
      this.db.select({ total: count() }).from(courses).where(and(...conditions)),
    ]);

    return { rows, total: totalRow?.total ?? 0 };
  }

  async findBySlug(slug: string) {
    return this.db.query.courses.findFirst({
      where: and(eq(courses.slug, slug), isNull(courses.deletedAt)),
      with: {
        sections: {
          orderBy: [asc(courseSections.position)],
          with: {
            lessons: {
              where: isNull(lessons.deletedAt),
              orderBy: [asc(lessons.position)],
              columns: {
                id: true,
                title: true,
                type: true,
                status: true,
                position: true,
                isFreePreview: true,
                estimatedDuration: true,
                slug: true,
              },
            },
          },
        },
      },
    });
  }

  async findById(id: string) {
    return this.db.query.courses.findFirst({
      where: and(eq(courses.id, id), isNull(courses.deletedAt)),
    });
  }

  async create(input: CreateCourseInput) {
    const slug = await this.generateSlug(input.title);
    const [course] = await this.db
      .insert(courses)
      .values({
        slug,
        title: input.title,
        subtitle: input.subtitle,
        description: input.description,
        difficulty: input.difficulty,
        accessType: input.accessType,
        price: input.price,
        thumbnailUrl: input.thumbnailUrl,
        status: "DRAFT",
      })
      .returning();
    if (!course) throw new Error("Failed to create course");
    return course;
  }

  async update(id: string, input: UpdateCourseInput) {
    const data: Record<string, unknown> = { ...input, updatedAt: new Date() };
    // Si se publica por primera vez, fijar publishedAt
    if (input.status === "PUBLISHED") {
      const existing = await this.findById(id);
      if (!existing?.publishedAt) {
        data["publishedAt"] = new Date();
      }
    }
    delete data["tags"];
    const [updated] = await this.db
      .update(courses)
      .set(data)
      .where(and(eq(courses.id, id), isNull(courses.deletedAt)))
      .returning();
    return updated;
  }

  async softDelete(id: string) {
    await this.db
      .update(courses)
      .set({ deletedAt: new Date() })
      .where(eq(courses.id, id));
  }

  async updateTotalLessons(courseId: string) {
    const [row] = await this.db
      .select({ cnt: count() })
      .from(lessons)
      .where(
        and(
          eq(lessons.courseId, courseId),
          eq(lessons.status, "PUBLISHED"),
          isNull(lessons.deletedAt),
        ),
      );
    await this.db
      .update(courses)
      .set({ totalLessons: row?.cnt ?? 0, updatedAt: new Date() })
      .where(eq(courses.id, courseId));
  }

  // ─── Lessons ─────────────────────────────────────────────────────────────

  async findLessonsByCourse(courseId: string, includeUnpublished = false) {
    const conditions = [
      eq(lessons.courseId, courseId),
      isNull(lessons.deletedAt),
    ];
    if (!includeUnpublished) {
      conditions.push(eq(lessons.status, "PUBLISHED"));
    }
    return this.db.query.lessons.findMany({
      where: and(...conditions),
      orderBy: [asc(lessons.position)],
      with: { videoAsset: true },
    });
  }

  async findLessonById(id: string) {
    return this.db.query.lessons.findFirst({
      where: and(eq(lessons.id, id), isNull(lessons.deletedAt)),
      with: { videoAsset: true, mediaFiles: true },
    });
  }

  async findLessonBySlugAndCourse(slug: string, courseId: string) {
    return this.db.query.lessons.findFirst({
      where: and(
        eq(lessons.slug, slug),
        eq(lessons.courseId, courseId),
        isNull(lessons.deletedAt),
      ),
    });
  }

  async createLesson(courseId: string, input: CreateLessonInput) {
    const position = input.position ?? (await this.nextLessonPosition(courseId));
    const slug = await this.generateLessonSlug(input.title, courseId);

    const [lesson] = await this.db
      .insert(lessons)
      .values({
        courseId,
        sectionId: input.sectionId,
        slug,
        title: input.title,
        description: input.description,
        type: input.type,
        position,
        isFreePreview: input.isFreePreview ?? false,
        estimatedDuration: input.estimatedDuration,
        status: "DRAFT",
      })
      .returning();
    if (!lesson) throw new Error("Failed to create lesson");
    return lesson;
  }

  async updateLesson(id: string, input: UpdateLessonInput) {
    const data: Record<string, unknown> = { ...input, updatedAt: new Date() };
    if (input.status === "PUBLISHED") {
      data["publishedAt"] = new Date();
    }
    const [updated] = await this.db
      .update(lessons)
      .set(data)
      .where(and(eq(lessons.id, id), isNull(lessons.deletedAt)))
      .returning();
    return updated;
  }

  async softDeleteLesson(id: string) {
    await this.db
      .update(lessons)
      .set({ deletedAt: new Date() })
      .where(eq(lessons.id, id));
  }

  async reorderLessons(updates: Array<{ id: string; position: number }>) {
    await this.db.transaction(async (tx) => {
      for (const { id, position } of updates) {
        await tx
          .update(lessons)
          .set({ position, updatedAt: new Date() })
          .where(eq(lessons.id, id));
      }
    });
  }

  // ─── Sections ────────────────────────────────────────────────────────────

  async createSection(courseId: string, title: string, position?: number) {
    const pos = position ?? (await this.nextSectionPosition(courseId));
    const [section] = await this.db
      .insert(courseSections)
      .values({ courseId, title, position: pos })
      .returning();
    if (!section) throw new Error("Failed to create section");
    return section;
  }

  // ─── Tags ────────────────────────────────────────────────────────────────

  async findOrCreateTags(tagNames: string[]) {
    if (tagNames.length === 0) return [];

    const slugified = tagNames.map((name) => ({
      name,
      slug: slugify(name, { lower: true, strict: true }),
    }));

    // Upsert all tags in one query — no N+1.
    const rows = await this.db
      .insert(tags)
      .values(slugified)
      .onConflictDoUpdate({
        target: tags.slug,
        set: { name: sql`excluded.name` },
      })
      .returning({ id: tags.id, slug: tags.slug });

    return rows;
  }

  async findOrCreateTagsByCategory(tagNames: string[], category: string) {
    if (tagNames.length === 0) return [];
    const slugified = tagNames.map((name) => ({
      name,
      slug: slugify(`${category}-${name}`, { lower: true, strict: true }),
      category,
    }));
    return this.db
      .insert(tags)
      .values(slugified)
      .onConflictDoUpdate({ target: tags.slug, set: { name: sql`excluded.name` } })
      .returning({ id: tags.id, slug: tags.slug, name: tags.name });
  }

  async setLessonTagsByCategory(lessonId: string, tagIds: string[], category: string) {
    const existingInCategory = await this.db
      .select({ tagId: lessonTags.tagId })
      .from(lessonTags)
      .innerJoin(tags, eq(lessonTags.tagId, tags.id))
      .where(and(eq(lessonTags.lessonId, lessonId), eq(tags.category, category)));

    if (existingInCategory.length > 0) {
      await this.db
        .delete(lessonTags)
        .where(
          and(
            eq(lessonTags.lessonId, lessonId),
            inArray(lessonTags.tagId, existingInCategory.map((r) => r.tagId)),
          ),
        );
    }

    if (tagIds.length > 0) {
      await this.db
        .insert(lessonTags)
        .values(tagIds.map((tagId) => ({ lessonId, tagId })))
        .onConflictDoNothing();
    }
  }

  async getLessonTags(lessonId: string) {
    return this.db
      .select({ name: tags.name, category: tags.category })
      .from(lessonTags)
      .innerJoin(tags, eq(lessonTags.tagId, tags.id))
      .where(eq(lessonTags.lessonId, lessonId));
  }

  async setCourseTags(courseId: string, tagIds: string[]) {
    await this.db.delete(courseTags).where(eq(courseTags.courseId, courseId));
    if (tagIds.length > 0) {
      await this.db
        .insert(courseTags)
        .values(tagIds.map((tagId) => ({ courseId, tagId })));
    }
  }

  async getCourseTagNames(courseId: string): Promise<string[]> {
    const rows = await this.db
      .select({ name: tags.name })
      .from(courseTags)
      .innerJoin(tags, eq(courseTags.tagId, tags.id))
      .where(eq(courseTags.courseId, courseId));
    return rows.map((r) => r.name);
  }

  async getAllTags() {
    return this.db.query.tags.findMany({
      orderBy: [asc(tags.name)],
    });
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────

  private async generateSlug(title: string): Promise<string> {
    const base = slugify(title, { lower: true, strict: true });
    const existing = await this.db.query.courses.findFirst({
      where: eq(courses.slug, base),
      columns: { id: true },
    });
    return existing ? `${base}-${createId().slice(0, 6)}` : base;
  }

  private async generateLessonSlug(title: string, courseId: string): Promise<string> {
    const base = slugify(title, { lower: true, strict: true });
    const existing = await this.db.query.lessons.findFirst({
      where: and(eq(lessons.slug, base), eq(lessons.courseId, courseId)),
      columns: { id: true },
    });
    return existing ? `${base}-${createId().slice(0, 6)}` : base;
  }

  private async nextLessonPosition(courseId: string): Promise<number> {
    const [row] = await this.db
      .select({ max: sql<number>`coalesce(max(${lessons.position}), -1)` })
      .from(lessons)
      .where(and(eq(lessons.courseId, courseId), isNull(lessons.deletedAt)));
    return (row?.max ?? -1) + 1;
  }

  private async nextSectionPosition(courseId: string): Promise<number> {
    const [row] = await this.db
      .select({ max: sql<number>`coalesce(max(${courseSections.position}), -1)` })
      .from(courseSections)
      .where(eq(courseSections.courseId, courseId));
    return (row?.max ?? -1) + 1;
  }
}
