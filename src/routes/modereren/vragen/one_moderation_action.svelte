<script lang="ts">
	import DateTime from "$lib/components/date-time.svelte";
	import type { schema } from "$lib/server/db";

	type Props = {
		moderationAction: typeof schema.moderationAction.$inferSelect,
	};

  const { moderationAction }: Props = $props();
</script>

<style>
	td {
		padding: 2px 8px 2px 0;
	}
</style>

<tr>
  <td>
    <DateTime value={moderationAction.createdAt} time={true} />
  </td>
  <td>
    {moderationAction.action}
  </td>
  <td>
    {#if moderationAction.action === 'pending-wrong-politician'}
      naar {moderationAction.meta?.proposedPoliticianSlug}
    {/if}
    {moderationAction.note}
  </td>
</tr>