import type { LayoutServerLoad } from './$types';
import { loadFlash } from 'sveltekit-flash-message/server';

export const load: LayoutServerLoad = loadFlash(async ({ locals }) => {
  const data = { user: locals.user };
  return data;
});
