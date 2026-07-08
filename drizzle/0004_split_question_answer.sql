CREATE TABLE "answer" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"body" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"question_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "question" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"body" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"assignee_id" text NOT NULL,
	"assignee_fraction_id" text,
	"verified_at" timestamp,
	CONSTRAINT "question_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "answer" ADD CONSTRAINT "answer_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "answer" ADD CONSTRAINT "answer_question_id_question_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."question"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question" ADD CONSTRAINT "question_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question" ADD CONSTRAINT "question_assignee_id_user_id_fk" FOREIGN KEY ("assignee_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question" ADD CONSTRAINT "question_assignee_fraction_id_fraction_id_fk" FOREIGN KEY ("assignee_fraction_id") REFERENCES "public"."fraction"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
INSERT INTO "question" ("id", "user_id", "body", "status", "created_at", "updated_at", "title", "slug", "assignee_id", "assignee_fraction_id", "verified_at")
SELECT "thread"."id", "thread"."user_id", "root_post"."body", "root_post"."status", "thread"."created_at", GREATEST("thread"."updated_at", "root_post"."updated_at"), "thread"."title", "thread"."slug", "root_post"."assignee_id", "root_post"."fraction_snapshot_id", "root_post"."verified_at"
FROM "thread"
JOIN (
	SELECT DISTINCT ON ("thread_id") *
	FROM "post"
	ORDER BY "thread_id", "created_at", "id"
) AS "root_post" ON "root_post"."thread_id" = "thread"."id";--> statement-breakpoint
INSERT INTO "answer" ("id", "user_id", "body", "status", "created_at", "updated_at", "question_id")
SELECT "post"."id", "post"."user_id", "post"."body", "post"."status", "post"."created_at", "post"."updated_at", "post"."thread_id"
FROM "post"
WHERE "post"."id" NOT IN (
	SELECT DISTINCT ON ("thread_id") "id"
	FROM "post"
	ORDER BY "thread_id", "created_at", "id"
);--> statement-breakpoint
ALTER TABLE "moderation_action" DROP CONSTRAINT "moderation_action_post_id_post_id_fk";
--> statement-breakpoint
ALTER TABLE "moderation_action" ADD COLUMN "question_id" text;--> statement-breakpoint
ALTER TABLE "moderation_action" ADD COLUMN "answer_id" text;--> statement-breakpoint
UPDATE "moderation_action" SET "question_id" = "root_post"."thread_id"
FROM (
	SELECT DISTINCT ON ("thread_id") "id", "thread_id"
	FROM "post"
	ORDER BY "thread_id", "created_at", "id"
) AS "root_post"
WHERE "moderation_action"."post_id" = "root_post"."id";--> statement-breakpoint
UPDATE "moderation_action" SET "answer_id" = "post_id" WHERE "question_id" IS NULL;--> statement-breakpoint
ALTER TABLE "moderation_action" ADD CONSTRAINT "moderation_action_question_id_question_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."question"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moderation_action" ADD CONSTRAINT "moderation_action_answer_id_answer_id_fk" FOREIGN KEY ("answer_id") REFERENCES "public"."answer"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moderation_action" DROP COLUMN "post_id";--> statement-breakpoint
ALTER TABLE "moderation_action" ADD CONSTRAINT "moderation_action_target" CHECK (("moderation_action"."question_id" is null) != ("moderation_action"."answer_id" is null));--> statement-breakpoint
ALTER TABLE "post" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "thread" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "post" CASCADE;--> statement-breakpoint
DROP TABLE "thread" CASCADE;
