<script lang="ts">
	import { resolve } from '$app/paths';
	import FacetGroup from '$lib/components/facet-group.svelte';
	import Page from '$lib/components/page.svelte';
	import Pagination from '$lib/components/pagination.svelte';
	import PoliticianCard from '$lib/components/politician-card.svelte';
	import { SearchForm } from '$lib/search-form.svelte';

	let { data } = $props();

	const search = new SearchForm({ term: () => data.query.term });
</script>

<Page width="wide">
	<h1 class="mb-8 font-serif text-4xl">Kamerleden</h1>

	<form
		method="GET"
		action={resolve('/politici')}
		bind:this={search.form}
		{...search.events}
		class="grid items-start gap-x-10 gap-y-6 lg:grid-cols-[1fr_17rem] lg:grid-rows-[auto_1fr]"
	>
		<search class="lg:col-start-1">
			<label class="relative block">
				<span class="sr-only">Zoek kamerleden</span>
				<input
					type="search"
					name={search.key}
					bind:value={search.term}
					placeholder="Zoek kamerleden…"
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

				<div class="grid gap-2 max-lg:mt-4">
					<FacetGroup
						label="Fracties"
						name="fractie"
						selected={data.query.fractions}
						options={data.facets.fractions.map((fraction) => ({
							value: fraction.slug,
							label: fraction.abbreviation ?? fraction.name,
							title: fraction.name,
							total: fraction.total
						}))}
					/>

					<FacetGroup
						label="Commissies"
						name="commissie"
						selected={data.query.commissions}
						options={data.facets.commissions.map((commission) => ({
							value: commission.abbreviation,
							label: commission.shortName,
							title: commission.name,
							total: commission.total
						}))}
					/>
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
			<p class="mb-5 flex min-h-8 items-center text-sm text-osf-canvas-500">
				{data.total}&nbsp;{data.total === 1 ? 'resultaat' : 'resultaten'}
			</p>

			{#if data.politicians.length === 0}
				<p class="text-osf-canvas-500">Geen kamerleden gevonden. Pas de zoekterm of filters aan.</p>
			{:else}
				<ul class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
					{#each data.politicians as politician (politician.id)}
						<li>
							<PoliticianCard {politician} />
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
