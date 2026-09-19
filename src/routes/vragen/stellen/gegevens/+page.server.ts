import { eq } from 'drizzle-orm';
import { fail, redirect, type ActionFailure } from '@sveltejs/kit';
import { hasPermission } from '$lib/permissions';
import { db, schema } from '$lib/server/db/index.js';
import { askSchema, draftFromUrl, stepHref, type AskField } from '$lib/ask.js';
import { validateForm } from '$lib/server/utils/forms';
import { auth, userExists, type UserType } from '$lib/server/auth';
import type { Actions } from './$types';

export type defaultActionType = {
  error?: string,
  initializeNewUser?: boolean,
  askForCode?: boolean,
  issues?: Partial<Record<AskField, string[]>>
}

export const actions = {
	default: async ({ request, locals, url }): Promise<defaultActionType|ActionFailure<defaultActionType>> => {
    if (!hasPermission(locals.user, { question: ['ask'] }))
      return fail(403, { error: 'Met dit account kun je geen vragen stellen.' });

    const draft = draftFromUrl(url)

    const result = await validateForm(request, askSchema);
    const rawData = result.data;
    if (!result.valid) return fail(400, { error: '', issues: result.issues, askForCode: rawData.formType == 'codeFromEmail' });

    const data = result.data;

    if (data.formType == 'newUser') {
      const exists = await userExists(data.email);
      if (exists) {
        return fail(400, {
          error: 'Er bestaat al een account met dit e-mailadres, gebruik het formulier hiernaast om in te loggen',
          initializeNewUser: true
        });
      }
    } else if (data.formType == 'missingName') {
      if (locals.user && !locals.user.name) await handleMissingName(locals.user, data.name);
    } else if (data.formType == 'userLogin') {
      return { askForCode: true }
    } else if (data.formType == 'codeFromEmail') {
      const session = await handleCodeFromEmail(data.code, request.headers);
      if (session) {
        locals.session = session;
      } else {
        return fail(400, { issues: { code: ['Code niet bekend'] }, askForCode: true });
      }
    }

    redirect(303, stepHref('controle', draft))
  }
} satisfies Actions;

async function handleMissingName(user: UserType, name: string) {
  // We get here for users that registered without filling in a name
  if (name) {
    await db.update(schema.user).set({ name: name.toString() }).where(eq(schema.user.id, user.id));
  }
}

async function handleCodeFromEmail(code: string, headers: Headers) {
  try {
    const data = await auth.api.magicLinkVerify({
      query: {
          token: code
      },
      headers: headers
    });
    return data.session;
  } catch (e) {}
}