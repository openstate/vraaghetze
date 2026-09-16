<script lang="ts">
	import { onMount } from 'svelte';
	import {
	loginFormActive,
		type AskDetails,
		type AskIssues
	} from '$lib/ask';
	import Field from '$lib/components/field.svelte';
	import type { IdentifyMode } from './register-or-login.svelte';

	type Props = {
    identifyMode: IdentifyMode
    details: AskDetails,
    issues: AskIssues,
    disabled: boolean,
    setIsActive: (value: boolean) => void
  }
  let { identifyMode, details = $bindable(), issues, disabled, setIsActive }: Props = $props();

	function inputHandler() {
    if (!setIsActive) return;

		const isActive = loginFormActive(details);
    setIsActive(isActive);
  }

	onMount(() => {
		inputHandler();
	});
</script>

<p class="mb-4 text-osf-canvas-600">
	Voor bestaande gebruikers.
  {#if identifyMode == 'asking_question'}
	Je ontvangt een code in een e-mail om hier in te vullen.
	{/if}
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
			disabled={disabled}
			oninput={inputHandler}
		/>
	{/snippet}
</Field>
