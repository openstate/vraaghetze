import { eq } from 'drizzle-orm';
import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { hasPermission } from '$lib/permissions';
import { db, schema } from '$lib/server/db/index.js';
import { draftFromUrl, stepHref } from '$lib/ask.js';

export const actions = {
	default: async ({ request, locals, url }) => {
    if (!hasPermission(locals.user, { question: ['ask'] }))
      return fail(403, { error: 'Met dit account kun je geen vragen stellen.' });

    const draft = draftFromUrl(url)

    if (locals.user && !locals.user.name) {
      const data = Object.fromEntries(await request.formData())
      if (data.name) {
      	await db.update(schema.user).set({ name: data.name.toString() }).where(eq(schema.user.id, locals.user.id));
      }
    }

    redirect(303, stepHref('controle', draft))
  }
}