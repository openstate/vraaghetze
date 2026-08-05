CREATE TABLE "commission" (
	"id" text PRIMARY KEY NOT NULL,
	"abbreviation" text NOT NULL,
	"name" text NOT NULL,
	"short_name" text NOT NULL,
	"kind" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "commission_membership" (
	"id" text PRIMARY KEY NOT NULL,
	"politician_id" text NOT NULL,
	"commission_id" text NOT NULL,
	"started_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "commission_membership" ADD CONSTRAINT "commission_membership_politician_id_politician_id_fk" FOREIGN KEY ("politician_id") REFERENCES "public"."politician"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commission_membership" ADD CONSTRAINT "commission_membership_commission_id_commission_id_fk" FOREIGN KEY ("commission_id") REFERENCES "public"."commission"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "commission_membership_politician_id_idx" ON "commission_membership" USING btree ("politician_id");--> statement-breakpoint
CREATE INDEX "commission_membership_commission_id_idx" ON "commission_membership" USING btree ("commission_id");