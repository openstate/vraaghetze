<script lang="ts">
	import { untrack } from 'svelte';
	import { STATUS_OPTIONS, type SearchQuery, type SearchStatus } from '$lib/search';

	type Facets = {
		answered: number;
		unanswered: number;
		fractions: {
			id: string;
			slug: string;
			name: string;
			abbreviation: string | null;
			total: number;
		}[];
		politicians: { slug: string; name: string; total: number }[];
	};

	type Props = { query: SearchQuery; facets: Facets };

	let { query, facets }: Props = $props();

	let politicianFilter = $state('');

	let open = $state(
		untrack(() => ({
			status: true,
			fractions: true,
			politicians: query.politicians.length > 0,
			period: query.from !== null || query.until !== null
		}))
	);

	const politicians = $derived(
		facets.politicians
			// a politician nobody asked anything is only worth showing while it is still ticked
			.filter((politician) => politician.total > 0 || query.politicians.includes(politician.slug))
			.filter((politician) =>
				politician.name.toLowerCase().includes(politicianFilter.trim().toLowerCase())
			)
	);

	const statusLabels = {
		alles: 'Alle vragen',
		beantwoord: 'Beantwoord',
		onbeantwoord: 'Wacht op antwoord'
	} satisfies Record<SearchStatus, string>;

	const statusTotals = $derived({
		alles: null,
		beantwoord: facets.answered,
		onbeantwoord: facets.unanswered
	});

	const periodCount = $derived(Number(query.from !== null) + Number(query.until !== null));

	const inputClass =
		'w-full rounded border border-osf-canvas-200 bg-transparent px-3 py-2 text-sm ' +
		'focus:border-osf-violet-500 focus:outline-none dark:border-osf-violet-700';

	const choiceClass =
		'flex cursor-pointer items-center gap-2.5 py-1 text-sm text-osf-canvas-600 dark:text-osf-violet-100';

	const boxClass =
		'size-4 shrink-0 cursor-pointer accent-osf-violet-500 disabled:cursor-not-allowed';
</script>

{#snippet heading(label: string, selected: number)}
	<summary class="flex cursor-pointer items-center gap-2 py-1 font-medium">
		<span
			aria-hidden="true"
			class="iconify size-4 text-osf-canvas-400 mdi--chevron-right group-open:rotate-90"
		></span>
		{label}
		{#if selected > 0}
			<span
				class="rounded-sm bg-osf-violet-100 px-1.5 py-0.5 font-mono text-xs text-osf-violet-700 dark:bg-osf-violet-700 dark:text-osf-violet-50"
			>
				{selected}
			</span>
		{/if}
	</summary>
{/snippet}

<div class="grid gap-2">
	<details bind:open={open.status} class="group">
		{@render heading('Status', query.status === 'alles' ? 0 : 1)}

		<fieldset class="mt-1 mb-3 ml-6">
			<legend class="sr-only">Status</legend>

			{#each STATUS_OPTIONS as option (option)}
				<label class={choiceClass}>
					<input
						type="radio"
						name="status"
						value={option === 'alles' ? '' : option}
						checked={query.status === option}
						class={boxClass}
					/>
					<span class="min-w-0 flex-1 truncate">{statusLabels[option]}</span>
					{#if statusTotals[option] !== null}
						<span class="font-mono text-xs text-osf-canvas-400">{statusTotals[option]}</span>
					{/if}
				</label>
			{/each}
		</fieldset>
	</details>

	<details bind:open={open.fractions} class="group">
		{@render heading('Fracties', query.fractions.length)}

		<fieldset class="mt-1 mb-3 ml-6 max-h-72 overflow-y-auto">
			<legend class="sr-only">Fracties</legend>

			{#each facets.fractions as fraction (fraction.id)}
				<label class={[choiceClass, fraction.total === 0 && 'opacity-50']}>
					<input
						type="checkbox"
						name="fractie"
						value={fraction.slug}
						checked={query.fractions.includes(fraction.slug)}
						class={boxClass}
					/>
					<span class="min-w-0 flex-1 truncate" title={fraction.name}>
						{fraction.abbreviation ?? fraction.name}
					</span>
					<span class="font-mono text-xs text-osf-canvas-400">{fraction.total}</span>
				</label>
			{/each}
		</fieldset>
	</details>

	<details bind:open={open.politicians} class="group">
		{@render heading('Kamerleden', query.politicians.length)}

		<fieldset class="mt-1 mb-3 ml-6">
			<legend class="sr-only">Kamerleden</legend>

			<!-- deliberately unnamed! this only filters the list below, it is not a search parameter -->
			<input
				type="search"
				bind:value={politicianFilter}
				placeholder="Zoek kamerleden…"
				aria-label="Zoek kamerleden"
				class={[inputClass, 'mb-2']}
			/>

			<div class="max-h-64 overflow-y-auto">
				{#each politicians as politician (politician.slug)}
					<label class={choiceClass}>
						<input
							type="checkbox"
							name="kamerlid"
							value={politician.slug}
							checked={query.politicians.includes(politician.slug)}
							class={boxClass}
						/>
						<span class="min-w-0 flex-1 truncate">{politician.name}</span>
						<span class="font-mono text-xs text-osf-canvas-400">{politician.total}</span>
					</label>
				{:else}
					<p class="py-1 text-sm text-osf-canvas-500">Geen kamerleden gevonden.</p>
				{/each}
			</div>
		</fieldset>
	</details>

	<details bind:open={open.period} class="group">
		{@render heading('Periode', periodCount)}

		<fieldset class="mt-1 mb-3 ml-6 grid gap-3">
			<legend class="sr-only">Periode</legend>

			<label class="grid gap-1.5 text-sm text-osf-canvas-600 dark:text-osf-violet-100">
				Van
				<input type="date" name="van" value={query.from ?? ''} class={inputClass} />
			</label>

			<label class="grid gap-1.5 text-sm text-osf-canvas-600 dark:text-osf-violet-100">
				Tot en met
				<input type="date" name="tot" value={query.until ?? ''} class={inputClass} />
			</label>
		</fieldset>
	</details>
</div>
