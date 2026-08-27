<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import {
		draftFromUrl,
		readDetails,
		stepHref,
		submitAskStep,
		writeDetails,
		type AskDetails,
		type AskIssues
	} from '$lib/ask';
	import Button from '$lib/components/button.svelte';
	import Field from '$lib/components/field.svelte';

	let { data } = $props();

	const FIELDS = ['name', 'email'] as const;

	let details = $state<AskDetails>({ name: '', email: '' });
	let issues = $state<AskIssues>({});
	let formElement = $state<HTMLFormElement>();

	const draft = $derived({ ...draftFromUrl(page.url), aan: data.politician?.slug ?? '' });

	// we don't store personal details in the url, but in sessionStorage, so we prefill seperately
	onMount(() => {
		details = readDetails();
	});

	const persist = () => writeDetails(details);

	function next(event: SubmitEvent) {
		persist();

		const useFields = data.user ? FIELDS.filter(v => v != 'email') : FIELDS
		const step = submitAskStep(formElement, details, useFields);
		issues = step.issues;
		// If no errors, and the logged in user has no name yet, store it (perform the default form action by returning)
		if (step.valid && data.user && !data.user.name) return

		event.preventDefault()
		if (!step.valid) return;

		// eslint-disable-next-line svelte/no-navigation-without-resolve
		goto(stepHref('controle', draft));
	}
</script>

<h1 class="mb-6 font-serif text-4xl">Vul je gegevens in</h1>

<form
	bind:this={formElement}
	method="POST"
	onsubmit={next}
	oninput={persist}
	onchange={persist}
	novalidate
	class="grid gap-6"
>
	<p class="mb-2 text-osf-canvas-600">
		Je vraag wordt openbaar onder jouw naam. Je emailadres blijft privé.
	</p>

	<Field name="name" label="Je volledige naam" issues={issues.name}>
		{#snippet children(control)}
			<input
				{...control}
				bind:value={details.name}
				required
				autocomplete="name"
				placeholder="Sanne de Vries"
			/>
		{/snippet}
	</Field>

	{#if data.user}
		<p class="text-osf-canvas-600">Je e-mailadres: {data.user.email}</p>
	{:else}
	<Field name="email" label="Je e-mailadres" issues={issues.email}>
		{#snippet children(control)}
			<input
				{...control}
				type="email"
				bind:value={details.email}
				required
				autocomplete="email"
				placeholder="sanne@voorbeeld.nl"
			/>
		{/snippet}
	</Field>
	{/if}

	<div class="mt-2 flex flex-wrap items-center justify-end gap-3">
		<Button variant="secondary" class="mr-auto" href={stepHref('vraag', draft)}>Vorige</Button>
		<Button type="submit" variant="primary" icon="mdi--arrow-right">Volgende</Button>
	</div>
</form>
