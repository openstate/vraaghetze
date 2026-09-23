<script lang="ts">
	import {
		clearDetails,
		type ActiveMode,
		type AskDetails,
		type AskIssues
	} from '$lib/ask';
	import Field from '$lib/components/field.svelte';
	import type { IdentifyMode } from './register-or-login.svelte';
	import Button from './button.svelte';

	type Props = {
    identifyMode: IdentifyMode;
    details: AskDetails;
    issues: AskIssues;
		previousUrl?: string;
		formError: string | undefined;
		setActiveMode: (mode: ActiveMode) => void;
		handleSubmit: (event: SubmitEvent & { currentTarget: EventTarget & HTMLFormElement}) => {};
  }
  let {
		identifyMode,
		details = $bindable(),
		issues,
		previousUrl,
		formError,
		setActiveMode,
		handleSubmit
	}: Props = $props();

	function gotoRegister(e: Event) {
		clearDetails();
		setActiveMode("registering");
	}
</script>

<form
	method="POST"
	novalidate
	class="grid gap-6"
	onsubmit={handleSubmit}
>
	<input type="hidden" name="formType" value="userLogin" />

	<p class="mb-4 text-osf-canvas-600">
		Voor bestaande gebruikers.
		{#if identifyMode == 'asking_question'}
		Je ontvangt een code in een e-mail om hier in te vullen.
		{/if}
		Heb je nog geen account? Ga naar
		<button type="submit" onclick={gotoRegister} class="text-osf-shocking-pink cursor-pointer">registeren</button>.
	</p>
	<Field name="emailExisting" label="Je e-mailadres" issues={issues.emailExisting}>
		{#snippet children(control)}
			<input
				{...control}
				type="email"
				bind:value={details.emailExisting}
				required
				autocomplete="email"
				placeholder="sanne@voorbeeld.nl"
			/>
		{/snippet}
	</Field>

	{#if formError}
		<p class="mb-4 mt-4 text-sm text-osf-shocking-pink">{formError}</p>
	{/if}

	<div class="mt-2 flex flex-wrap items-center justify-end gap-3">
    {#if previousUrl}
		  <Button variant="secondary" href={previousUrl} class="mr-auto">
				Vorige
			</Button>
    {/if}
		<Button
			type="submit" variant="primary" icon="mdi--arrow-right">
			Volgende
		</Button>
	</div>
</form>