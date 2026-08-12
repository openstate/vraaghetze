<script lang="ts">
	import FilterGroup from './filter-group.svelte';

	type Option = { value: string; label: string; title?: string; total: number };

	type Props = {
		label: string;
		/** name of the form field, and thus of the url parameter, the choices fill */
		name: string;
		options: Option[];
		selected: string[];
		open?: boolean;
		/** adds a text field that narrows the list */
		searchable?: boolean;
		empty?: string;
	};

	let {
		label,
		name,
		options,
		selected,
		open = true,
		searchable = false,
		empty = 'Geen opties gevonden.'
	}: Props = $props();

	let filter = $state('');

	const normalizedFilter = $derived(filter.trim().toLowerCase());

	const shown = $derived(
		!searchable
			? options
			: options.filter(
					(option) =>
						(option.total > 0 || selected.includes(option.value)) &&
						option.label.toLowerCase().includes(normalizedFilter)
				)
	);

	const inputClass =
		'w-full rounded border border-osf-canvas-200 bg-transparent px-3 py-2 text-sm ' +
		'focus:border-osf-violet-500 focus:outline-none';

	const choiceClass = 'flex cursor-pointer items-center gap-2.5 py-1 text-sm text-osf-canvas-600';

	const boxClass =
		'size-4 shrink-0 cursor-pointer accent-osf-violet-500 disabled:cursor-not-allowed';
</script>

<FilterGroup {label} selected={selected.length} {open}>
	<fieldset class={['mt-1 min-w-0', !searchable && 'max-h-72 overflow-y-auto']}>
		<legend class="sr-only">{label}</legend>

		{#if searchable}
			<!-- deliberately unnamed! this only filters the list below, it is not a search parameter -->
			<input
				type="search"
				bind:value={filter}
				placeholder="Zoek {label.toLowerCase()}…"
				aria-label="Zoek {label.toLowerCase()}"
				class={[inputClass, 'mb-2']}
			/>
		{/if}

		<div class={[searchable && 'max-h-64 overflow-y-auto']}>
			{#each shown as option (option.value)}
				<label class={[choiceClass, option.total === 0 && 'opacity-50']}>
					<input
						type="checkbox"
						{name}
						value={option.value}
						checked={selected.includes(option.value)}
						class={boxClass}
					/>
					<span class="min-w-0 flex-1 truncate" title={option.title}>{option.label}</span>
					<span class="font-mono text-xs text-osf-canvas-400">{option.total}</span>
				</label>
			{:else}
				<p class="py-1 text-sm text-osf-canvas-500">{empty}</p>
			{/each}
		</div>
	</fieldset>
</FilterGroup>
