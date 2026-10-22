import { listQuestionQueue } from '$lib/server/moderation';
import { type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ params }) => {
  const questionId = params.id;
  if (!questionId) return Response.json({});

  // For now just return first 2 questions of queue.
  // TODO: replace this with logic that returns similar questions
  const queue = await listQuestionQueue();
  const similarQuestions = queue.map(q => q.question).slice(0,2);

  return Response.json(similarQuestions);
}
