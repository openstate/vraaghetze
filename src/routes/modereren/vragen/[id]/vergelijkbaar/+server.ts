import { getPolitician } from '$lib/server/politicians';
import { getQuestion, similarForFraction, type SimilarType } from '$lib/server/questions';
import { type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ params }) => {
  const questionId = params.id;
  if (!questionId) return Response.json({});

  const question = await getQuestion(questionId);
  if (!question) return Response.json({});

  const politician = await getPolitician(question.assigneeId);

  const similarQuestions: SimilarType[] = await similarForFraction(
    `${question.title} ${question.body}`.trim(),
    politician?.id,
    10
  );

  return Response.json(similarQuestions);
}
