<script lang="ts">
	import { EMPTY, formatDate, formatDateTime, formatDateTimeLong } from '$lib/date-time';

	type Props = { value: Date | string | null; time?: boolean };

	const { value, time = false }: Props = $props();

	const date = $derived.by(() => {
		return !value
			? null
			: typeof(value) === 'string'
				? new Date(value)
				: value;
	});


	const label = $derived(time ? formatDateTime(date) : formatDate(date));
</script>

{#if date === null}{EMPTY}{:else}<time
		datetime={date.toISOString()}
		title={formatDateTimeLong(date)}>{label}</time
	>{/if}
