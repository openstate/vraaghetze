<script module lang="ts">
	const empty = '—';

	const dateFormat = new Intl.DateTimeFormat('nl-NL', {
		dateStyle: 'medium'
	});

	const dateTimeFormat = new Intl.DateTimeFormat('nl-NL', {
		dateStyle: 'medium',
		timeStyle: 'short'
	});

	const titleFormat = new Intl.DateTimeFormat('nl-NL', {
		dateStyle: 'long',
		timeStyle: 'short'
	});

	export function formatDate(value: Date | null) {
		return value === null ? empty : dateFormat.format(value);
	}

	export function formatDateTime(value: Date | null) {
		return value === null ? empty : dateTimeFormat.format(value);
	}
</script>

<script lang="ts">
	type Props = { value: Date | null; time?: boolean };

	let { value, time = false }: Props = $props();

	const label = $derived(time ? formatDateTime(value) : formatDate(value));
</script>

{#if value === null}{empty}{:else}<time
		datetime={value.toISOString()}
		title={titleFormat.format(value)}>{label}</time
	>{/if}
