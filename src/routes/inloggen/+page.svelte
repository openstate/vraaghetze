<script lang="ts">
	import { page } from '$app/state';
	import { invalidateAll } from '$app/navigation';
	import { authClient } from '$lib/auth-client';
	import Button from '$lib/components/button.svelte';
	import Page from '$lib/components/page.svelte';

	let { data } = $props();

	let sent = $state(false);

	async function signIn(event: SubmitEvent) {
		event.preventDefault();

		const formData = new FormData(event.currentTarget as HTMLFormElement);

		const { error } = await authClient.signIn.magicLink({
			email: formData.get('email') as string,
			callbackURL: `${page.url.origin}/inloggen`
		});

		if (error) console.error(error);
		else sent = true;
	}

	async function signOut() {
		const { error } = await authClient.signOut();
		if (error) console.error(error);
		await invalidateAll();
	}
</script>

<Page>
	<h1 class="mb-8 font-serif text-4xl font-[450]">Inloggen</h1>

	{#if data.user}
		<p class="mb-6 text-osf-canvas-600">
			Je bent ingelogd als <strong>{data.user.email}</strong>.
		</p>
		<Button onclick={signOut} variant="secondary" icon="mdi--logout">Uitloggen</Button>
	{:else if sent}
		<p class="text-osf-canvas-600">
			We hebben een inloglink naar je e-mailadres gestuurd. Klik erop om in te loggen.
		</p>
	{:else}
		<form onsubmit={signIn} class="grid max-w-sm gap-4">
			<label class="grid gap-1.5">
				<span class="text-sm font-medium">Je e-mailadres</span>
				<input
					name="email"
					type="email"
					required
					class="rounded border border-osf-canvas-200 px-3 py-2 focus:border-osf-violet-500 focus:outline-none"
				/>
			</label>

			<Button type="submit" variant="primary" icon="mdi--arrow-right">Stuur inloglink</Button>
		</form>
	{/if}
</Page>
