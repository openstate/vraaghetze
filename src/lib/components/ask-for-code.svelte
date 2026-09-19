<script lang="ts">
	import {
		type AskDetails,
		type AskIssues
	} from '$lib/ask';
	import Field from '$lib/components/field.svelte';

	type Props = {
    details: AskDetails,
    issues: AskIssues
  }
  let { details = $bindable(), issues }: Props = $props();
</script>

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
