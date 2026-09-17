import { askSchema } from '$lib/ask';
import { fail, redirect, type ActionFailure } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import type { defaultActionType as askDefaultActionType } from '../vragen/stellen/gegevens/+page.server';
import { validateForm } from '$lib/server/utils/forms';
import { sendSignInLink, userExists } from '$lib/server/auth';
import { db, schema } from '$lib/server/db';
import { validateCaptcha } from '$lib/server/utils/captcha';

export const load: PageServerLoad = async ({ parent }) => {
  const parentData = await parent();
  const data = {...parentData, capjsSiteKey: process.env.CAPJS_SITE_KEY || ''}
  return data
}

export type defaultActionType = askDefaultActionType & { sent?: boolean };

export const actions = {
  default: async ({ request, url }): Promise<defaultActionType|ActionFailure<defaultActionType>> => {
    const result = await validateForm(request, askSchema);
    if (!result.valid) return fail(400, { error: '', issues: result.issues });

    const data = result.data;

    if (data.formType == 'newUser') {
      const captchaValid = await validateCaptcha(data.capToken);
      if (!captchaValid) {
        return fail(403, { error: 'Captcha validatie is mislukt.' });
      }

      const exists = await userExists(data.email);
      if (exists) {
        return fail(400, {
          error: 'Er bestaat al een account met dit e-mailadres, gebruik het formulier hiernaast om in te loggen',
          initializeNewUser: true
        });
      }

      const userId = crypto.randomUUID();
      await db.insert(schema.user).values({ id: userId, name: data.name, email: data.email, tAndCAccepted: new Date() });

      const callback = new URL("/mijn-vragen", url.origin);
      await sendSignInLink(data.email, callback.toString());

      return { sent: true }
    }

    redirect(303, '/')
  }
} satisfies Actions;
