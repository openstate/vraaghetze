<script lang="ts">
	import Avatar from '$lib/components/avatar.svelte';
	import ModerationDialog from '$lib/components/moderation-dialog.svelte';
	import OneModerationAction from './one_moderation_action.svelte';
	import { rejectionReasons, type QuestionStatus } from '$lib/moderation.js';
	import { formatDateLong } from '$lib/date-time';
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import Button from '$lib/components/button.svelte';
	import SelectPolitician from '$lib/components/select-politician.svelte';
	import type { CommissionsType, PoliticiansType } from '$lib/politicians';
	import type { ModerationActionDetailsType } from '$lib/server/db/app.schema';

	// TODO: This is just ListQuestionQueueType
	type Question = {
		id: string;
		title: string;
		body: string;
		status: QuestionStatus;
		createdAt: Date;
		authorName: string;
		politicianName: string;
		politicianSlug: string;
		fraction: string | null;
		fractionName: string | null;
	};

	type Props = {
		question: Question;
		moderationActions: ModerationActionDetailsType[];
		politicians: PoliticiansType[];
		commissions: CommissionsType[];
	};

	// eslint-disable-next-line svelte/no-unused-props
	const { question, moderationActions, politicians, commissions }: Props = $props();
	let note = $state('');
	const inputClass =
		'rounded border bg-white border-osf-canvas-200 px-3 py-2 focus:border-osf-violet-500 focus:outline-none';

	let selectedRejections = $state([] as string[]);
	let saveDisabled: boolean = $derived.by(() => {
		return note === '';
	});

	let changePoliticianState: 'select' | 'confirm' = $state('select');

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const hrefForPolitician = (slug: string) => {
		return '#top';
	};

	let selectedPolitician = $derived(question.politicianSlug);

	const selectedHandler = (slug: string) => {
		selectedPolitician = slug;
		changePoliticianState = 'confirm';
	};
</script>

<li>
	<article class="overflow-hidden rounded bg-osf-canvas-100">
		<div class="p-5">
			<p class="text-sm text-osf-canvas-600">
				Vraag van {question.authorName} op {formatDateLong(question.createdAt)}
			</p>

			<p class="mt-3 font-serif text-xl/snug">{question.title}</p>

			<p class="mt-2 whitespace-pre-wrap text-osf-canvas-500">{question.body}</p>

			<div class="mt-4 flex items-center gap-3">
				<a
					href={resolve('/politici/[slug]', { slug: question.politicianSlug })}
					class="shrink-0"
					aria-hidden="true"
					tabindex="-1"
				>
					<Avatar
						size={40}
						name={question.politicianName}
						src={resolve('/politici/[slug]/foto', { slug: question.politicianSlug })}
					/>
				</a>
				<p class="text-sm text-osf-canvas-600">
					Gesteld aan
					<a
						href={resolve('/politici/[slug]', { slug: question.politicianSlug })}
						class="hover:underline"
					>
						{question.politicianName}
						{#if question.fraction ?? question.fractionName}
							({question.fraction ?? question.fractionName})
						{/if}
					</a>
				</p>
			</div>

			{#if moderationActions.length > 0}
				<hr class="mt-4 border-osf-canvas-200" />
				<p class="mt-4 text-sm font-medium">Moderatie geschiedenis</p>
				<table class="history table-auto text-sm">
					<tbody>
						{#each moderationActions as moderationAction (moderationAction.id)}
							<OneModerationAction {moderationAction} />
						{/each}
					</tbody>
				</table>
			{/if}
		</div>

		<hr class="mx-5 border-osf-canvas-200" />

		<form method="POST" use:enhance class="grid gap-4 p-5">
			<input type="hidden" name="questionId" value={question.id} />
			<input type="hidden" name="rejectionReason" value={selectedRejections} />

			<label class="grid gap-1.5">
				<span class="text-sm font-medium">Interne notitie (optioneel)</span>
				<textarea name="note" rows="2" class={inputClass} bind:value={note}></textarea>
			</label>

			<div class="flex flex-wrap gap-2">
				{#if saveDisabled}
					<ModerationDialog
						title="Bevestigen"
						triggerTitle="Keur goed"
						triggerVariant="primary"
						actionValue="approved"
					>
						<p>
							Na goedkeuren zal de vraag naar het Kamerlid gestuurd worden. Weet je zeker dat je
							deze vraag wilt goedkeuren?
						</p>
					</ModerationDialog>
					<ModerationDialog
						title="Geef reden(en) van afwijzing"
						triggerTitle="Wijs af"
						triggerVariant="secondary"
						actionValue="rejected"
						buttonDisabled={selectedRejections.length == 0}
					>
						{#each Object.entries(rejectionReasons) as [key, title], index (key)}
							<label>
								<input type="checkbox" name="reasons" value={key} bind:group={selectedRejections} />
								<span class="ml-2 min-w-0 flex-1" {title}>{index + 1}. {title}</span>
							</label>
						{/each}
					</ModerationDialog>
				{/if}
				<Button
					type="submit"
					name="action"
					value="note-added"
					variant="secondary"
					disabled={saveDisabled}
					class={saveDisabled ? 'disabled:opacity-40' : ''}>Notitie opslaan</Button
				>
				{#if saveDisabled}
					<ModerationDialog
						title="Selecteer ander Kamerlid"
						triggerTitle="Kamerlid aanpassen"
						triggerVariant="secondary"
						actionValue="pending-wrong-politician"
						hideActionButton={changePoliticianState == 'select'}
						closeAfterSubmit={true}
					>
						{#if changePoliticianState == 'select'}
							<div class="max-h-[73vh] overflow-y-auto">
								<SelectPolitician
									{politicians}
									{commissions}
									politiciansPerPage={150}
									slugChosenPolitician={question.politicianSlug}
									{selectedHandler}
									{hrefForPolitician}
								/>
							</div>
						{:else}
							<input type="hidden" name="proposedPoliticianSlug" value={selectedPolitician} />
							<p>Bevestig het aanpassen van het Kamerlid naar {selectedPolitician}:</p>
						{/if}
					</ModerationDialog>
				{/if}
			</div>
		</form>
	</article>
</li>
