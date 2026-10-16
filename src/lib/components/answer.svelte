<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$lib/components/button.svelte';
	import AnswerBody from './answer-body.svelte';
	import AnswerRedacting from './answer-redacting.svelte';
	import type { ListAnswerType } from '$lib/server/moderation';
	import type { ActionData as AnswerListActionData } from '../../routes/modereren/antwoorden/$types';
	import type { schema } from '$lib/server/db';

	export type BasicAnswerProps = {
		answer: ListAnswerType;
	}

	export type ShowAnswerProps = {
		moderationActions: typeof schema.moderationAction.$inferSelect[];
	}

	type RedactionAnswerProps = {
		form: AnswerListActionData
	}

	export type AnswerProps = BasicAnswerProps & ShowAnswerProps & RedactionAnswerProps;

	let { answer, moderationActions, form }: AnswerProps = $props();

	let redacting = $state(false);

	const redactStart = (event: Event) => {
		event.preventDefault();
		redacting = true;
	}

	const cancelRedact = (event: Event) => {
		event.preventDefault();
		redacting = false;
	}

	let startSearchTexts = [''];
	let startReplaceTexts = ['<verwijderd>'];
	let formRelevant = $derived(form?.answerId == answer.id && form?.redactedBody);
	let redactedBody = $derived(formRelevant ? form?.redactedBody : answer.body);
	let searchTexts = $derived((formRelevant && form?.searchTexts) ? form?.searchTexts : startSearchTexts);
	let replaceTexts = $derived((formRelevant && form?.replaceTexts) ? form?.replaceTexts : startReplaceTexts);
</script>

<article class="overflow-hidden rounded bg-osf-canvas-100">
	{#if !redacting || form?.redacted}
		<AnswerBody {answer} {moderationActions} />
	{/if}

	<form method="POST" use:enhance class="flex flex-wrap gap-2 p-5 flex-col">
		<input type="hidden" name="answerId" value={answer.id} />

		{#if redacting && !form?.redacted}
			<AnswerRedacting {answer} {redactedBody} bind:searchTexts={searchTexts} bind:replaceTexts={replaceTexts} />
			<input type="hidden" name="searchTexts" value={JSON.stringify(searchTexts)} />
			<input type="hidden" name="replaceTexts" value={JSON.stringify(replaceTexts)} />

			<div class="flex grow justify-between">
				<div class="flex grow basis-1 gap-5">
					<Button type="submit" name="action" value="cancel" variant="secondary" onclick={cancelRedact}>Annuleren</Button>
					<Button type="submit" name="action" value="preview" variant="secondary">Preview</Button>
				</div>
				<div>
					<Button type="submit" name="action" value="redact" variant="primary">Opslaan</Button>
				</div>
			</div>
		{:else}
			<p>LET OP! Sommige onderstaande acties worden direct doorgevoerd zonder verdere bevestiging!</p>
			<ul class="text-body mb-3 list-inside list-disc space-y-1 text-sm mb-4">
			<li><strong>Keur goed</strong> Het antwoord wordt gepubliceerd en de vraagsteller en volgers krijgen een e-mail.</li>
			<li><strong>Informeer vraagsteller</strong> Het antwoord wordt niet gepubliceerd maar de vraagsteller kan het antwoord zien (en krijgt een e-mail).</li>
			<li><strong>Negeer</strong> Het antwoord wordt genegeerd.</li>
			</ul>
			<div class="flex flex-row gap-2">
				<Button type="submit" name="action" value="approved" variant="primary">Keur goed</Button>
				<Button type="submit" name="action" value="update-asker" variant="primary">Informeer vraagsteller</Button>
				<Button type="submit" name="action" value="rejected" variant="secondary">Negeer</Button>
				<Button type="submit" name="action" value="redactStart" variant="secondary" onclick={redactStart}>Redigeren...</Button>
			</div>
		{/if}
	</form>
</article>
