<script lang="ts">
	import Answer from '$lib/components/answer.svelte';

	let { data, form } = $props();
	let answer = $derived(data.answer)
</script>

{#if form?.error}
	<p class="mb-4 text-sm text-osf-shocking-pink">{form.error}</p>
{/if}
<Answer answer={answer} />