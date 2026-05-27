CREATE EXTENSION IF NOT EXISTS unaccent;--> statement-breakpoint
ALTER TABLE "politician" ADD COLUMN "slug" text;--> statement-breakpoint
WITH base AS (
	SELECT
		p.id,
		trim(both '-' from regexp_replace(lower(unaccent(u.name)), '[^a-z0-9]+', '-', 'g')) AS base_slug
	FROM "politician" p
	JOIN "user" u ON u.id = p.user_id
),
numbered AS (
	SELECT id, base_slug, row_number() OVER (PARTITION BY base_slug ORDER BY id) AS rn
	FROM base
)
UPDATE "politician" p
SET slug = CASE WHEN n.rn = 1 THEN n.base_slug ELSE n.base_slug || '-' || n.rn END
FROM numbered n
WHERE n.id = p.id;--> statement-breakpoint
ALTER TABLE "politician" ALTER COLUMN "slug" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "politician" ADD CONSTRAINT "politician_slug_unique" UNIQUE("slug");
