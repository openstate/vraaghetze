<script lang="ts">
	import OneQuestion from './one_question.svelte'

	let { data, form } = $props();
</script>

{#if form?.error}
	<p class="mb-4 text-sm text-osf-shocking-pink">{form.error}</p>
{/if}

{#if data.queue.length === 0}
	<p class="text-osf-canvas-500">Geen vragen in de wachtrij.</p>
{:else}
	<ul class="grid gap-3">
		{#each data.queue as question (question.id)}
      <OneQuestion question={question} />
		{/each}
	</ul>
{/if}
