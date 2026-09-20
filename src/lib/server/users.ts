import { count, desc } from 'drizzle-orm';
import { db, schema } from '$lib/server/db';
import type { Pagination } from '$lib/pagination';

export function listNormalUsers({ page, perPage }: Pagination) {
  return db.transaction(async (tx) => {
    const rows = await tx
      .select({
        id: schema.user.id,
        name: schema.user.name,
        email: schema.user.email,
        email_verified: schema.user.emailVerified,
        created_at: schema.user.createdAt,
        role: schema.user.role,
      })
      .from(schema.user)
      .orderBy(desc(schema.user.createdAt))
      .limit(perPage)
      .offset((page - 1) * perPage);

    const [{ total }] = await tx.select({ total: count() }).from(schema.user);

    return { rows, total };
  });
}
