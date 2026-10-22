<script lang="ts">
	import DateTime from "$lib/components/date-time.svelte";
	import type { schema } from "$lib/server/db";

	type Props = {
		inboxRow: typeof schema.inbox.$inferSelect,
	};

  const { inboxRow }: Props = $props();
</script>

<style>
	td {
		padding: 2px 8px 2px 0;
	}
</style>

<tr>
  <td>
    <DateTime value={inboxRow.receivedAt} time={true} />
  </td>
  <td>
    {inboxRow.status}
  </td>
  <td>
    {inboxRow.fromAddress}
  </td>
</tr>