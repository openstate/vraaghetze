<script lang="ts">
	import { resolve } from '$app/paths';
	import type { ListQuestionType } from '$lib/server/moderation';

  const row: ListQuestionType = $props();
</script>

	{#if row.politicianSlug === null}
		{row.politicianName}
	{:else}
		<a href={resolve('/politici/[slug]', { slug: row.politicianSlug })} class="hover:underline">
			{row.politicianName}
		</a>
	{/if}
