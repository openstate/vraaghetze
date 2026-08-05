-- added by hand: drizzle-kit does not manage extensions, and the backfill below needs it
CREATE EXTENSION IF NOT EXISTS unaccent;--> statement-breakpoint
ALTER TABLE "fraction" ADD COLUMN "slug" text;--> statement-breakpoint
UPDATE "fraction"
SET slug = trim(both '-' from regexp_replace(lower(unaccent(coalesce(abbreviation, name))), '[^a-z0-9]+', '-', 'g'));--> statement-breakpoint
ALTER TABLE "fraction" ALTER COLUMN "slug" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "fraction" ADD CONSTRAINT "fraction_slug_unique" UNIQUE("slug");