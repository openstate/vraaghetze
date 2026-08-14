<script lang="ts">
	import { goto, replaceState } from '$app/navigation';
	import { page } from '$app/state';
	import {
		QUESTION_BODY_MAX_LENGTH,
		QUESTION_TITLE_MAX_LENGTH,
		draftFromUrl,
		stepHref,
		submitAskStep,
		type AskIssues
	} from '$lib/ask';
	import Button from '$lib/components/button.svelte';
	import Field from '$lib/components/field.svelte';
	import { debounce } from '$lib/debounce';
	import { resolve } from '$app/paths';

	let { data } = $props();

	const FIELDS = ['title', 'body'] as const;

	const draft = $state(draftFromUrl(page.url));

	let issues = $state<AskIssues>({});
	let formElement = $state<HTMLFormElement>();

	// we can assert non-null because this route is only reachable if a politician was selected
	const politician = $derived(data.politician!);
	const fractionLabel = $derived(politician.fraction ?? politician.fractionName);

	function syncDraft() {
		debouncedSyncState.cancel();

		const href = stepHref('vraag', draft);
		if (href === `${page.url.pathname}${page.url.search}`) return;

		// eslint-disable-next-line svelte/no-navigation-without-resolve
		replaceState(href, {});
	}

	const debouncedSyncState = debounce(syncDraft);

	$effect(() => () => debouncedSyncState.cancel()); // on unmount

	function next(event: SubmitEvent) {
		event.preventDefault();
		debouncedSyncState.cancel();

		const values = { title: draft.vraag, body: draft.context };

		const step = submitAskStep(formElement, values, FIELDS);
		issues = step.issues;
		if (!step.valid) return;

		// a signed-in asker skips the step that asks for their details
		const nextStep = data.user ? 'controle' : 'gegevens';

		// eslint-disable-next-line svelte/no-navigation-without-resolve
		goto(stepHref(nextStep, draft));
	}
</script>

<h1 class="mb-6 font-serif text-4xl">Schrijf je vraag</h1>

<form
	bind:this={formElement}
	onsubmit={next}
	oninput={debouncedSyncState}
	onchange={syncDraft}
	novalidate
	class="grid gap-6"
>
	<p class="mb-2 text-osf-canvas-600">
		Je schrijft een vraag aan <a
			href={resolve('/politici/[slug]', { slug: politician.slug })}
			class="font-medium hover:underline"
		>
			{politician.name}
			{#if fractionLabel}({fractionLabel}){/if}
		</a>.
	</p>

	<Field
		name="title"
		label="Je vraag"
		issues={issues.title}
		counter={{ length: draft.vraag.length, max: QUESTION_TITLE_MAX_LENGTH }}
	>
		{#snippet children(control)}
			<input
				{...control}
				bind:value={draft.vraag}
				required
				maxlength={QUESTION_TITLE_MAX_LENGTH}
				placeholder="Wat doet u tegen de wooncrisis?"
			/>
		{/snippet}
	</Field>

	<Field
		name="body"
		label="Voeg context toe"
		optional
		issues={issues.body}
		counter={{ length: draft.context.length, max: QUESTION_BODY_MAX_LENGTH }}
	>
		{#snippet children(control)}
			<textarea
				{...control}
				bind:value={draft.context}
				rows="6"
				maxlength={QUESTION_BODY_MAX_LENGTH}
				placeholder="In mijn gemeente staan mensen jaren op de wachtlijst voor een sociale huurwoning."
			></textarea>
		{/snippet}
	</Field>

	<div class="mt-2 flex flex-wrap items-center justify-end gap-3">
		<Button variant="secondary" class="mr-auto" href={stepHref('kamerlid', draft)}>Vorige</Button>
		<Button type="submit" variant="primary" icon="mdi--arrow-right">Volgende</Button>
	</div>
</form>
