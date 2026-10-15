CREATE INDEX "answer_user_id_idx" ON "answer" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "inbox_answer_id_idx" ON "inbox" USING btree ("answer_id");--> statement-breakpoint
CREATE INDEX "moderation_action_question_id_idx" ON "moderation_action" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "moderation_action_answer_id_idx" ON "moderation_action" USING btree ("answer_id");--> statement-breakpoint
CREATE INDEX "moderation_action_moderator_id_idx" ON "moderation_action" USING btree ("moderator_id");--> statement-breakpoint
CREATE INDEX "outbox_question_id_idx" ON "outbox" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "politician_fraction_id_idx" ON "politician" USING btree ("fraction_id");--> statement-breakpoint
CREATE INDEX "question_user_id_idx" ON "question" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "question_assignee_id_idx" ON "question" USING btree ("assignee_id");--> statement-breakpoint
CREATE INDEX "question_assignee_fraction_id_idx" ON "question" USING btree ("assignee_fraction_id");