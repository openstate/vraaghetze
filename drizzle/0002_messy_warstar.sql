ALTER TABLE "thread" ADD COLUMN "slug" text NOT NULL;--> statement-breakpoint
ALTER TABLE "thread" ADD CONSTRAINT "thread_slug_unique" UNIQUE("slug");