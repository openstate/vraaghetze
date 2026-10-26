ALTER TABLE "commission_membership" ADD COLUMN "function" text DEFAULT 'Lid' NOT NULL;--> statement-breakpoint
ALTER TABLE "commission_membership" ADD COLUMN "permanent" boolean DEFAULT true NOT NULL;