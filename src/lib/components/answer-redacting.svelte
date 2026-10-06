<script lang="ts">
	import type { BasicAnswerProps } from './answer.svelte';
	import Button from './button.svelte';
	import Field from './field.svelte';

	type Props = {
		redactedBody?: string;
		searchTexts: string[];
		replaceTexts: string[];
	} & BasicAnswerProps;

	let {
		answer,
		redactedBody,
		searchTexts = $bindable(),
		replaceTexts = $bindable()
	}: Props = $props();

	const nRedactions = $derived(searchTexts.length);

	let addDisabled = $state(true);

	const handleInput = (value: string) => {
		addDisabled = !value;
	};
</script>

<div>
	<div class="mb-5 flex flex-row gap-5">
		<div class="grow basis-1">
			<p class="mb-3">Originele tekst</p>
			<div class="bg-white p-5">
				<p class="whitespace-pre-wrap">{answer.body}</p>
			</div>
		</div>
		<div class="grow basis-1">
			<p class="mb-3">Nieuwe tekst</p>
			<div class="bg-white p-5">
				<p class="whitespace-pre-wrap">{redactedBody ?? answer.body}</p>
			</div>
		</div>
	</div>

	<hr class="border-osf-canvas-200" />

	{#each { length: nRedactions }, index (index)}
		<div class="flex flex-row items-end gap-5 py-2">
			<Field name="searchTexts" idSuffix={index.toString()} label="Te vervangen tekst" class="bg-white">
				{#snippet children(control)}
					<input
						{...control}
						bind:value={
							() => searchTexts[index],
							(v) => {
								searchTexts[index] = v;
								searchTexts = [...searchTexts];
							}
						}
						required
						oninput={() => handleInput(searchTexts[index])}
					/>
				{/snippet}
			</Field>

			<Field name="replaceTexts" idSuffix={index.toString()} label="Vervangen door" class="bg-white">
				{#snippet children(control)}
					<input
						{...control}
						bind:value={
							() => replaceTexts[index],
							(v) => {
								replaceTexts[index] = v;
								replaceTexts = [...replaceTexts];
							}
						}
						required
					/>
				{/snippet}
			</Field>
			{#if index == nRedactions - 1}
				<div>
					<Button
						type="submit"
						name="action"
						value="addRedaction"
						variant="secondary"
						disabled={addDisabled}
            title="Regel toevoegen"
						class={addDisabled ? 'disabled:opacity-40' : ''}
					>
						<span class="iconify size-5 mdi--plus"></span>
					</Button>
				</div>
			{/if}
		</div>
	{/each}
</div>
