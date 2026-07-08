import { createAuthClient } from 'better-auth/svelte';
import { adminClient, magicLinkClient } from 'better-auth/client/plugins';
import { ac, roles } from '$lib/permissions';

export const authClient = createAuthClient({
	plugins: [magicLinkClient(), adminClient({ ac, roles })]
});
