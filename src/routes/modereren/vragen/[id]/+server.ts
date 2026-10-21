import { getQuestionDetails } from '$lib/server/moderation';
import { type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ params }) => {
  const questionId = params.id;
  if (!questionId) return Response.json({});

  const question = await getQuestionDetails(questionId);

  return Response.json(question);
}
