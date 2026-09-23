<script lang="ts">
	import {
		type AskDetails,
		type AskIssues
	} from '$lib/ask';
	import Field from '$lib/components/field.svelte';
	import Button from './button.svelte';

	type Props = {
    details: AskDetails;
    issues: AskIssues;
		previousUrl?: string;
		formError: string | undefined;
  	handleSubmit: (event: SubmitEvent & { currentTarget: EventTarget & HTMLFormElement}) => {};
}
  let { details = $bindable(), issues, previousUrl, formError, handleSubmit }: Props = $props();
</script>

<form
	method="POST"
	novalidate
	class="grid gap-6"
	onsubmit={handleSubmit}
>
	<input type="hidden" name="formType" value="codeFromEmail" />

	<p class="mb-4 text-osf-canvas-600">
	Als je bij ons een account hebt is er een code naar je e-mailadres gestuurd.
	</p>
	<Field name="code" label="Code uit e-mail" issues={issues.code}>
		{#snippet children(control)}
			<input
				{...control}
				bind:value={details.code}
				required
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