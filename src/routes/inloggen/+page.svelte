<script lang="ts">
	import { page } from '$app/state';
	import { invalidateAll } from '$app/navigation';
	import { authClient } from '$lib/auth-client';
	import Button from '$lib/components/button.svelte';
	import Field from '$lib/components/field.svelte';
	import Page from '$lib/components/page.svelte';

	let { data } = $props();

	let sent = $state(false);
	let issues = $state<string[]>();

	async function signIn(event: SubmitEvent) {
		event.preventDefault();
		issues = undefined;

		const formData = new FormData(event.currentTarget as HTMLFormElement);

		const { error } = await authClient.signIn.magicLink({
			email: formData.get('email') as string,
			callbackURL: `${page.url.origin}/inloggen`
		});

		if (error) issues = ['Er ging iets mis bij het versturen. Probeer het opnieuw.'];
		else sent = true;
	}

	async function signOut() {
		const { error } = await authClient.signOut();
		if (error) console.error(error);
		await invalidateAll();
	}
</script>

<Page>
	<h1 class="mb-8 font-serif text-4xl">Inloggen</h1>

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
			<Field name="email" label="Je e-mailadres" {issues}>
				{#snippet children(control)}
					<input {...control} type="email" required placeholder="sanne@voorbeeld.nl" />
				{/snippet}
			</Field>

			<Button type="submit" variant="primary" icon="mdi--arrow-right">Stuur inloglink</Button>
		</form>
	{/if}
</Page>
