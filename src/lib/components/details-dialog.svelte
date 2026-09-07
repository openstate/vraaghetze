<script module lang="ts">
	import { enhance } from '$app/forms';

	export type Detail = [
		label: string,
		value: string | Date | null | HTMLSafeString | boolean,
		hidden?: boolean
	];
	let disabled = $state(false);
</script>

<script lang="ts">
	import { Dialog } from 'bits-ui';
	import { formatDateTime } from '$lib/date-time';
	import { HTMLSafeString } from '$lib/general';
	import Button from './button.svelte';

	type Props = { title: string; details: Detail[] };

	let { title, details }: Props = $props();

	const actionable = $derived(details.find(c => c[0] == 'Actionable')?.[1])
	const detailId = $derived((actionable && details.find(c => c[0] == 'Id')?.[1]) || '')

	const cellClass = 'border-osf-canvas-200';
	const valueClass = 'font-medium wrap-anywhere whitespace-pre-wrap';
</script>

<Dialog.Root>
	<Dialog.Trigger
		title="Toon details"
		aria-label="Toon details"
		class="flex size-8 cursor-pointer items-center justify-center rounded-sm text-osf-canvas-500 hover:bg-osf-canvas-100 hover:text-osf-violet-900"
	>
		<span class="iconify size-4.5 mdi--text-box-outline"></span>
	</Dialog.Trigger>

	<Dialog.Portal>
		<Dialog.Overlay class="fixed inset-0 z-40 bg-osf-violet-900/40" />

		<Dialog.Content
			aria-describedby={undefined}
			class="fixed top-1/2 left-1/2 z-50 flex max-h-[85vh] w-[min(44rem,calc(100vw-3rem))] -translate-x-1/2 -translate-y-1/2 flex-col rounded border border-osf-canvas-200 bg-osf-neutral-50"
		>
			<div class="flex items-center justify-between gap-4 p-6 pb-4">
				<Dialog.Title class="font-medium">{title}</Dialog.Title>

				<Dialog.Close
					aria-label="Sluiten"
					class="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-sm text-osf-canvas-500 hover:bg-osf-canvas-100 hover:text-osf-violet-900"
				>
					<span class="iconify size-5 mdi--close"></span>
				</Dialog.Close>
			</div>

			<dl class="grid overflow-y-auto p-6 pt-0 text-sm sm:grid-cols-[minmax(0,1fr)_2fr]">
				{#each details.filter(([, value, hidden]) => value && !hidden) as [label, value] (label)}
					<dt class={[cellClass, 'border-t pt-2 pr-6 first-of-type:border-t-0 sm:pb-2']}>
						{label}
					</dt>
					<dd
						class={[cellClass, valueClass, 'pb-2 sm:border-t sm:pt-2 sm:first-of-type:border-t-0']}
					>
						{#if value instanceof HTMLSafeString}
							{@html (value.value)}
						{:else}
							{value instanceof Date ? formatDateTime(value) : value}
						{/if}
					</dd>
				{/each}
			</dl>
			{#if actionable}
			<div class="grid overflow-y-auto p-6 pt-0 text-sm">
				<h1>Acties</h1>
				<p>Dit antwoord is genegeerd om de gemelde reden maar kan indien gewenst toch verwerkt
					worden.</p>
				<ul class="space-y-1 text-body list-disc list-inside text-sm mb-3">
					<li>Indien <strong>status=Andere Afzender</strong> dan wordt het antwoord verwerkt alsof het oorspronkelijke kamerlid
						waaraan de vraag gesteld was hem beantwoord heeft.</li>
				</ul>
				<form
					method="POST"
					use:enhance={() => {
						disabled = true;

						return async ({ update }) => {
							await update();
							disabled = false;
						};
					}}>
					<input type="hidden" name="inboxId" value={detailId}>
					<input type="hidden" name="returnTo" value={encodeURIComponent(window.location.href)}>
					<Button type="submit" variant="primary" name="action" value="process_anyway"
						disabled={disabled} class={disabled ? 'disabled:opacity-40' : ''}>
						Toch verwerken
					</Button>
				</form>
			</div>
			{/if}
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
