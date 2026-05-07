import { eq, and, isNull, asc } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { mediaFiles } from "../../shared/db/schema/media.js";
import type { CreateMediaInput } from "./media.types.js";

export class MediaRepository {
  constructor(private readonly db: NodePgDatabase<any>) {}

  async create(input: CreateMediaInput & { storageKey: string }) {
    const [row] = await this.db
      .insert(mediaFiles)
      .values({
        lessonId: input.lessonId ?? null,
        courseId: input.courseId ?? null,
        type: input.type,
        label: input.label,
        filename: input.filename,
        mimeType: input.mimeType,
        sizeBytes: input.sizeBytes ?? null,
        storageKey: input.storageKey,
        isPublic: input.isPublic ?? false,
        position: input.position ?? 0,
      })
      .returning();
    return row!;
  }

  async findByLesson(lessonId: string) {
    return this.db
      .select()
      .from(mediaFiles)
      .where(and(eq(mediaFiles.lessonId, lessonId), isNull(mediaFiles.deletedAt)))
      .orderBy(asc(mediaFiles.position));
  }

  async findByCourse(courseId: string) {
    return this.db
      .select()
      .from(mediaFiles)
      .where(and(eq(mediaFiles.courseId, courseId), isNull(mediaFiles.deletedAt)))
      .orderBy(asc(mediaFiles.position));
  }

  async findById(id: string) {
    const [row] = await this.db
      .select()
      .from(mediaFiles)
      .where(and(eq(mediaFiles.id, id), isNull(mediaFiles.deletedAt)));
    return row ?? null;
  }

  async softDelete(id: string) {
    await this.db
      .update(mediaFiles)
      .set({ deletedAt: new Date() })
      .where(eq(mediaFiles.id, id));
  }
}
