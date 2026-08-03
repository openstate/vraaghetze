<script lang="ts">
	import { EMPTY, formatDate, formatDateTime, formatDateTimeLong } from '$lib/date-time';

	type Props = { value: Date | null; time?: boolean };

	let { value, time = false }: Props = $props();

	const label = $derived(time ? formatDateTime(value) : formatDate(value));
</script>

{#if value === null}{EMPTY}{:else}<time
		datetime={value.toISOString()}
		title={formatDateTimeLong(value)}>{label}</time
	>{/if}
