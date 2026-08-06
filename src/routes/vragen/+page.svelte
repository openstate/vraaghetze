<script lang="ts">
	import { resolve } from '$app/paths';
	import Button from '$lib/components/button.svelte';
	import Page from '$lib/components/page.svelte';
	import Pagination from '$lib/components/pagination.svelte';
	import QuestionCard from '$lib/components/question-card.svelte';
	import QuestionFilters from '$lib/components/question-filters.svelte';
	import { getImpliedSort, hasActiveFilters, SORT_OPTIONS, type SearchSort } from '$lib/search';
	import { SearchForm } from '$lib/search-form.svelte';

	let { data } = $props();

	const search = new SearchForm({ term: () => data.query.term });

	const impliedSort = $derived(getImpliedSort(data.query.term));

	const sortLabels = {
		relevantie: 'Relevantie',
		nieuwste: 'Nieuwste eerst',
		oudste: 'Oudste eerst'
	} satisfies Record<SearchSort, string>;
</script>

<Page width="wide">
	<h1 class="mb-8 font-serif text-4xl font-[450]">Vragen & Antwoorden</h1>

	<form
		method="GET"
		action={resolve('/vragen')}
		bind:this={search.form}
		{...search.events}
		class="grid items-start gap-x-10 gap-y-6 lg:grid-cols-[1fr_17rem] lg:grid-rows-[auto_1fr]"
	>
		<search class="lg:col-start-1">
			<label class="relative block">
				<span class="sr-only">Zoek in vragen en antwoorden</span>
				<input
					type="search"
					name={search.key}
					bind:value={search.term}
					placeholder="Zoek in vragen en antwoorden…"
					class="w-full rounded border border-osf-canvas-200 bg-transparent py-3 pr-12 pl-4 focus:border-osf-violet-500 focus:outline-none dark:border-osf-violet-700"
				/>
				<span
					aria-hidden="true"
					class="absolute top-1/2 right-4 iconify size-5 -translate-y-1/2 text-osf-canvas-400 mdi--magnify"
				></span>
			</label>
		</search>

		<aside
			class="lg:sticky lg:top-6 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto"
		>
			<details open class="rounded border-osf-canvas-200 max-lg:border max-lg:p-4">
				<summary class="cursor-pointer font-medium lg:hidden">Filters</summary>

				<div class="max-lg:mt-4">
					<QuestionFilters query={data.query} facets={data.facets} />
				</div>

				<noscript>
					<button
						type="submit"
						class="mt-6 w-full cursor-pointer rounded-sm bg-osf-violet-900 px-4 py-2 text-sm font-medium text-osf-canvas-50"
					>
						Filters toepassen
					</button>
				</noscript>
			</details>
		</aside>

		<div class="lg:col-start-1">
			<div class="mb-5 flex min-h-8 flex-wrap items-center justify-between gap-4">
				<p class="text-sm text-osf-canvas-500">
					{data.total}
					{data.total === 1 ? 'resultaat' : 'resultaten'}
				</p>

				<label class="flex items-center gap-2 text-sm text-osf-canvas-500">
					Sorteer op
					<select
						name="sorteer"
						value={data.query.sort === impliedSort ? '' : data.query.sort}
						class="rounded border border-osf-canvas-200 bg-transparent px-2 py-1 focus:border-osf-violet-500 focus:outline-none dark:border-osf-violet-700"
					>
						{#each SORT_OPTIONS as option (option)}
							<option
								value={option === impliedSort ? '' : option}
								disabled={option === 'relevantie' && !data.query.term}
							>
								{sortLabels[option]}
							</option>
						{/each}
					</select>
				</label>
			</div>

			{#if data.questions.length === 0}
				<div class="grid justify-items-start gap-4">
					<p class="text-osf-canvas-500">
						{#if data.query.term || hasActiveFilters(data.query)}
							Geen vragen gevonden. Pas de zoekterm of filters aan, of stel een nieuwe vraag.
						{:else}
							Er zijn nog geen vragen gesteld.
						{/if}
					</p>

					<Button href="/vragen/stellen" variant="primary" icon="mdi--arrow-right">
						Stel een vraag
					</Button>
				</div>
			{:else}
				<ul class="grid gap-3">
					{#each data.questions as question (question.slug)}
						<li>
							<QuestionCard {question} />
						</li>
					{/each}
				</ul>

				<Pagination
					count={data.total}
					page={data.page}
					perPage={data.perPage}
					selectPerPage={false}
				/>
			{/if}
		</div>
	</form>
</Page>
