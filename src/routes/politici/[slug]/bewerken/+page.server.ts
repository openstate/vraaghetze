import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import * as politicians from '$lib/server/politicians';
import { validateForm } from '$lib/server/utils/forms';
import z from 'zod';

export const load: PageServerLoad = async ({ params, locals, url }) => {
  const politician = await politicians.bySlug(params.slug);
  if (!politician) error(404, 'Kamerlid niet gevonden');

  return { politician }
};

const editPoliticianSchema = z.object({
  acceptsQuestions: z.coerce.boolean().default(false)
});

export const actions = {
  default: async ({ params, locals, request }) => {
    const result = await validateForm(request, editPoliticianSchema);
    if (!result.valid) return fail(400, { error: 'Fout bij form validatie' });

    const data = result.data;

    const politician = await politicians.bySlug(params.slug);
    if (!politician) return fail(404, { error: 'Kamerlid niet gevonden' });

    await politicians.updateAcceptsQuestions(politician.id, data.acceptsQuestions)

    redirect(303, '/politici')
  }
} satisfies Actions;
