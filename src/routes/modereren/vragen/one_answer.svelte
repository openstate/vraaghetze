<script lang="ts">
	import DateTime from "$lib/components/date-time.svelte";
	import type { schema } from "$lib/server/db";

	type Props = {
		answer: typeof schema.answer.$inferSelect,
	};

  const { answer }: Props = $props();
</script>

<style>
	td {
		padding: 2px 8px 2px 0;
	}
</style>

<tr>
  <td>
    <DateTime value={answer.createdAt} time={true} />
  </td>
  <td>
    {answer.status}
  </td>
</tr>