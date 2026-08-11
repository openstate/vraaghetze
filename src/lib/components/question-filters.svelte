<script lang="ts">
	import { STATUS_OPTIONS, type QuestionSearchQuery, type SearchStatus } from '$lib/search';
	import FacetGroup from './facet-group.svelte';
	import FilterGroup from './filter-group.svelte';

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

	type Props = { query: QuestionSearchQuery; facets: Facets };

	let { query, facets }: Props = $props();

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
		'focus:border-osf-violet-500 focus:outline-none';

	const choiceClass = 'flex cursor-pointer items-center gap-2.5 py-1 text-sm text-osf-canvas-600';

	const boxClass =
		'size-4 shrink-0 cursor-pointer accent-osf-violet-500 disabled:cursor-not-allowed';
</script>

<div class="grid gap-2">
	<FilterGroup label="Status" selected={query.status === 'alles' ? 0 : 1}>
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
	</FilterGroup>

	<FacetGroup
		label="Fracties"
		name="fractie"
		selected={query.fractions}
		options={facets.fractions.map((fraction) => ({
			value: fraction.slug,
			label: fraction.abbreviation ?? fraction.name,
			title: fraction.name,
			total: fraction.total
		}))}
	/>

	<FacetGroup
		label="Kamerleden"
		name="kamerlid"
		selected={query.politicians}
		open={query.politicians.length > 0}
		searchable
		empty="Geen kamerleden gevonden."
		options={facets.politicians.map((politician) => ({
			value: politician.slug,
			label: politician.name,
			total: politician.total
		}))}
	/>

	<FilterGroup
		label="Periode"
		selected={periodCount}
		open={query.from !== null || query.until !== null}
	>
		<fieldset class="mt-1 mb-3 ml-6 grid gap-3">
			<legend class="sr-only">Periode</legend>

			<label class="grid gap-1.5 text-sm text-osf-canvas-600">
				Van
				<input type="date" name="van" value={query.from ?? ''} class={inputClass} />
			</label>

			<label class="grid gap-1.5 text-sm text-osf-canvas-600">
				Tot en met
				<input type="date" name="tot" value={query.until ?? ''} class={inputClass} />
			</label>
		</fieldset>
	</FilterGroup>
</div>
