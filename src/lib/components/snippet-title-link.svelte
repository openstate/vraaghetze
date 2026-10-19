<script lang="ts">
	import { resolve } from '$app/paths';
	import type { ListQuestionType } from '$lib/server/moderation';

  const row: ListQuestionType = $props();
</script>

{#if row.status === 'approved' || row.status === 'answered'}
  <a
    href={resolve('/vragen/[slug]', { slug: row.slug })}
    title={row.title}
    class="hover:underline"
  >
    {row.title}
  </a>
{:else}
  <span title={row.title}>{row.title}</span>
{/if}
