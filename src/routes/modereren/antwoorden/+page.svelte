<script lang="ts">
	import Answer from '$lib/components/answer.svelte';

	let { data, form } = $props();
</script>

{#if form?.error}
	<p class="mb-4 text-sm text-osf-shocking-pink">{form.error}</p>
{/if}

{#if data.queue.length === 0}
	<p class="text-osf-canvas-500">Geen antwoorden in de wachtrij.</p>
{:else}
	<ul class="grid gap-3">
		{#each data.queue as answer (answer.id)}
			<li>
				<Answer answer={answer} />
			</li>
		{/each}
	</ul>
{/if}
