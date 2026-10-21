<script lang="ts">
	import DateTime from "$lib/components/date-time.svelte";
	import { redactionInfo, rejectionReasonTexts } from "$lib/moderation";
	import type { ModerationActionDetailsType } from "$lib/server/moderation";

	type Props = {
		moderationAction: ModerationActionDetailsType
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
    {moderationAction.moderatorName}
  </td>
  <td>
    {moderationAction.action}
  </td>
  <td>
    {#if moderationAction.action === 'pending-wrong-politician'}
      naar {moderationAction.meta?.proposedPoliticianSlug}
    {:else if moderationAction.action === 'politician-changed'}
      van {moderationAction.meta?.currentSlug} naar {moderationAction.meta?.newSlug}
    {:else if moderationAction.action === 'answer-redacted'}
      {redactionInfo(moderationAction.meta?.searchTexts ?? [], moderationAction.meta?.replaceTexts ?? [])}
    {:else if moderationAction.action === 'rejected'}
      {#each rejectionReasonTexts(moderationAction.rejectionReason) as reason (reason) }
        {reason}<br/>
      {/each}
    {/if}
    {moderationAction.note}
  </td>
</tr>