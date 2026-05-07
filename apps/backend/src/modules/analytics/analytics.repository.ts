import { sql } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

export class AnalyticsRepository {
  constructor(private readonly db: NodePgDatabase<any>) {}

  async getAdminOverview() {
    const result = await this.db.execute<{
      total_users: string;
      new_users_30d: string;
      active_subscriptions: string;
      mrr_cents: string;
      total_courses: string;
      total_lessons: string;
    }>(sql`
      SELECT
        (SELECT COUNT(*)::text FROM users WHERE deleted_at IS NULL) AS total_users,
        (SELECT COUNT(*)::text FROM users WHERE deleted_at IS NULL AND created_at >= NOW() - INTERVAL '30 days') AS new_users_30d,
        (SELECT COUNT(*)::text FROM subscriptions WHERE status = 'ACTIVE') AS active_subscriptions,
        (SELECT COALESCE(SUM(amount),0)::text FROM payments WHERE status = 'SUCCEEDED' AND created_at >= date_trunc('month', NOW())) AS mrr_cents,
        (SELECT COUNT(*)::text FROM courses WHERE deleted_at IS NULL AND status = 'PUBLISHED') AS total_courses,
        (SELECT COUNT(*)::text FROM lessons WHERE deleted_at IS NULL AND status = 'PUBLISHED') AS total_lessons
    `);

    const row = result.rows[0];
    return {
      totalUsers: parseInt(row?.total_users ?? "0", 10),
      newUsers30d: parseInt(row?.new_users_30d ?? "0", 10),
      activeSubscriptions: parseInt(row?.active_subscriptions ?? "0", 10),
      mrrCents: parseInt(row?.mrr_cents ?? "0", 10),
      totalCourses: parseInt(row?.total_courses ?? "0", 10),
      totalLessons: parseInt(row?.total_lessons ?? "0", 10),
    };
  }

  async getTopCoursesByProgress(limit = 5) {
    const result = await this.db.execute<{
      course_id: string;
      title: string;
      slug: string;
      thumbnail_url: string | null;
      learners: string;
      completions: string;
    }>(sql`
      SELECT
        c.id AS course_id,
        c.title,
        c.slug,
        c.thumbnail_url,
        COUNT(DISTINCT cp.user_id)::text AS learners,
        COUNT(DISTINCT CASE WHEN cp.percent_complete = 100 THEN cp.user_id END)::text AS completions
      FROM courses c
      LEFT JOIN course_progress cp ON cp.course_id = c.id
      WHERE c.deleted_at IS NULL AND c.status = 'PUBLISHED'
      GROUP BY c.id, c.title, c.slug, c.thumbnail_url
      ORDER BY learners::int DESC
      LIMIT ${limit}
    `);

    return result.rows.map((r) => ({
      courseId: r.course_id,
      title: r.title,
      slug: r.slug,
      thumbnailUrl: r.thumbnail_url,
      learners: parseInt(r.learners, 10),
      completions: parseInt(r.completions, 10),
    }));
  }

  async getRecentSignups(limit = 10) {
    const result = await this.db.execute<{
      id: string;
      email: string;
      display_name: string;
      created_at: string;
    }>(sql`
      SELECT id, email, display_name, created_at
      FROM users
      WHERE deleted_at IS NULL
      ORDER BY created_at DESC
      LIMIT ${limit}
    `);

    return result.rows;
  }
}
