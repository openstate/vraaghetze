<script lang="ts">
	import type { ListQuestionType } from "$lib/server/moderation";
	import DateTime from "./date-time.svelte";

  const row: ListQuestionType = $props();
</script>

{#if row.answeredAt !== null && row.answerStatus === 'approved'}
	<DateTime value={row.answeredAt} time />
{:else}
	<span class="text-osf-canvas-400">
		{#if row.answerStatus === 'pending'}
			Wacht op moderatie
		{:else if row.answerStatus === 'update-asker'}
			Geïnformeerd
		{:else if row.status === 'approved'}
			Niet beantwoord
		{:else}
			&mdash;
		{/if}
	</span>
{/if}


