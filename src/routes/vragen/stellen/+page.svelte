<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import Button from '$lib/components/button.svelte';
	import Page from '$lib/components/page.svelte';

	let { data, form } = $props();

	const sentEmail = $derived(form && 'email' in form ? form.email : null);
	const issues = $derived(form && 'issues' in form ? form.issues : undefined);

	const selectedPolitician = $derived(
		data.politicians.find((politician) => politician.slug === page.url.searchParams.get('aan'))
	);

	const inputClass =
		'rounded border border-osf-canvas-200 px-3 py-2 focus:border-osf-violet-500 focus:outline-none';
</script>

<Page>
	{#if sentEmail}
		<h1 class="mb-4 font-serif text-4xl font-[450]">Bijna klaar!</h1>
		<p class="text-osf-canvas-600">
			We hebben een link naar <strong>{sentEmail}</strong> gestuurd. Klik erop om je e-mailadres te bevestigen
			en je vraag te bekijken.
		</p>
	{:else}
		<h1 class="mb-8 font-serif text-4xl font-[450]">
			Stel een vraag {#if selectedPolitician}aan {selectedPolitician.name}{/if}
		</h1>

		<form method="POST" use:enhance class="grid gap-6">
			{#if data.user}
				<input type="hidden" name="name" value={data.user.name} />
				<input type="hidden" name="email" value={data.user.email} />
			{:else}
				<label class="grid gap-1.5">
					<span class="text-sm font-medium">Je volledige naam</span>
					<input name="name" required class={inputClass} />
					{#if issues?.name}
						<span class="text-sm text-osf-shocking-pink">
							{issues.name[0]}
						</span>
					{/if}
				</label>

				<label class="grid gap-1.5">
					<span class="text-sm font-medium">Je e-mailadres</span>
					<input name="email" type="email" required class={inputClass} />
					{#if issues?.email}
						<span class="text-sm text-osf-shocking-pink">
							{issues.email[0]}
						</span>
					{/if}
				</label>
			{/if}

			<label class="grid gap-1.5">
				<span class="text-sm font-medium">Je vraag</span>
				<input name="title" required class={inputClass} />
				{#if issues?.title}
					<span class="text-sm text-osf-shocking-pink">
						{issues.title[0]}
					</span>
				{/if}
			</label>

			<label class="grid gap-1.5">
				<span class="text-sm font-medium">Voeg context toe (optioneel)</span>
				<textarea name="body" rows="6" class={inputClass}></textarea>
			</label>

			{#if selectedPolitician}
				<input type="hidden" name="politicianId" value={selectedPolitician.id} />
			{:else}
				<label class="grid gap-1.5">
					<span class="text-sm font-medium">Aan welk Kamerlid?</span>
					<select name="politicianId" required class={['bg-white', inputClass]}>
						<option value="" disabled selected>Kies een Kamerlid…</option>
						{#each data.politicians as politician (politician.id)}
							<option value={politician.id}>
								{politician.name}{#if politician.fraction ?? politician.fractionName}&nbsp;({politician.fraction ??
										politician.fractionName}){/if}
							</option>
						{/each}
					</select>
				</label>
			{/if}
			{#if issues?.politicianId}
				<span class="text-sm text-osf-shocking-pink">
					{issues.politicianId[0]}
				</span>
			{/if}

			<Button type="submit" variant="primary" icon="mdi--arrow-right">Verstuur vraag</Button>
		</form>
	{/if}
</Page>
