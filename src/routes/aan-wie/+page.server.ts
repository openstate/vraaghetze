import { activeCommissions } from '$lib/server/politicians';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
  const parentData = await parent();

  const commissions = await activeCommissions();
  const data = {...parentData, commissions};

  return data;
}
