import "dotenv/config";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, pool } from "../shared/db/index.js";
import { users } from "../shared/db/schema/index.js";

const EMAIL = process.env.ADMIN_EMAIL ?? "admin@rudiment.pro";
const PASSWORD = process.env.ADMIN_PASSWORD ?? "changeme123!";
const DISPLAY_NAME = process.env.ADMIN_NAME ?? "Admin";

async function main() {
  const existing = await db.query.users.findFirst({
    where: eq(users.email, EMAIL),
  });

  if (existing) {
    await db
      .update(users)
      .set({ role: "ADMIN", updatedAt: new Date() })
      .where(eq(users.id, existing.id));
    console.log(`✅ Existing user "${EMAIL}" promoted to ADMIN`);
    return;
  }

  const passwordHash = await bcrypt.hash(PASSWORD, 12);
  const [user] = await db
    .insert(users)
    .values({ email: EMAIL, passwordHash, displayName: DISPLAY_NAME, role: "ADMIN" })
    .returning({ id: users.id, email: users.email });

  if (!user) {
    throw new Error("Admin user insert did not return a row");
  }

  console.log(`✅ Admin user created: ${user.email} (id: ${user.id})`);
  console.log(`   Password: ${PASSWORD}`);
}

main()
  .catch((error) => {
    console.error("❌ Failed to seed admin user:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
