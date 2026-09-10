<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { authClient } from '$lib/auth-client';
	import Button from '$lib/components/button.svelte';
	import Page from '$lib/components/page.svelte';

  const { data } = $props();

	async function signOut() {
		const { error } = await authClient.signOut();
		if (error) console.error(error);
		await invalidateAll();
		await goto(resolve('/inloggen'));
	}
</script>
<Page>
  <div class="min-w-0">
    <div class="mb-8 flex flex-wrap items-center justify-between gap-4">
      <h1 class="font-serif text-5xl/none">{data.user?.name}</h1>
      {#if data.user}
        <Button onclick={signOut} variant="secondary">Uitloggen</Button>
      {/if}
    </div>

    <p class="mt-3 text-lg text-osf-canvas-600">
      {data.user?.email}
    </p>
  </div>
</Page>
