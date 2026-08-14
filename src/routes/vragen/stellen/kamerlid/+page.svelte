<script lang="ts">
	import { replaceState } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { draftFromUrl, stepHref } from '$lib/ask';
	import Avatar from '$lib/components/avatar.svelte';
	import Field from '$lib/components/field.svelte';
	import Pagination from '$lib/components/pagination.svelte';
	import { parsePagination } from '$lib/pagination';

	const POLITICIANS_PER_PAGE = 12;

	let { data } = $props();

	let politicianSearch = $state('');
	let selectedFraction = $state('');
	let selectedCommission = $state('');

	type Politician = (typeof data.politicians)[number];

	const draft = $derived(draftFromUrl(page.url));

	const searchNeedle = $derived(politicianSearch.trim().toLowerCase());

	// the full name tells two fractions apart, the abbreviation is what an asker reads
	const fractionOptions = $derived.by(() => {
		const labels: Record<string, string> = {};
		for (const politician of data.politicians)
			labels[politician.fractionName] = politician.fraction ?? politician.fractionName;

		return Object.entries(labels)
			.map(([value, label]) => ({ value, label }))
			.sort((left, right) => left.label.localeCompare(right.label, 'nl'));
	});

	// matches if the typed text appears in the name or in either spelling of the fraction
	function matchesSearch(politician: Politician) {
		if (!searchNeedle) return true;

		return [politician.name, politician.fraction, politician.fractionName]
			.join(' ')
			.toLowerCase()
			.includes(searchNeedle);
	}

	// matches if the Kamerlid sits in the chosen fraction and holds a seat in the chosen commission
	function matchesFilters(politician: Politician) {
		if (selectedFraction && politician.fractionName !== selectedFraction) return false;
		if (selectedCommission && !politician.commissions.includes(selectedCommission)) return false;

		return true;
	}

	const matchingPoliticians = $derived(
		data.politicians.filter((politician) => matchesSearch(politician) && matchesFilters(politician))
	);

	// every Kamerlid is here already, so a page turn only slices them, never reloads them
	const currentPage = $derived(parsePagination(page.url).page);

	const shownPoliticians = $derived(
		matchingPoliticians.slice(
			(currentPage - 1) * POLITICIANS_PER_PAGE,
			currentPage * POLITICIANS_PER_PAGE
		)
	);

	// a narrowed list has fewer pages, so searching from page four cannot land on nothing
	function backToFirstPage() {
		if (currentPage === 1) return;

		const url = new URL(page.url);
		url.searchParams.delete('pagina');

		// eslint-disable-next-line svelte/no-navigation-without-resolve
		replaceState(url, {});
	}
</script>

<h1 class="mb-6 font-serif text-4xl">Kies een Kamerlid</h1>

<p class="mb-8 text-osf-canvas-600">
	Je stelt een vraag aan één Kamerlid. Zoek op naam, of kies eerst een fractie of commissie.
</p>

<search class="mb-6 grid gap-6">
	<!-- the very fields of the steps after this one, so all three read as answers to fill in -->
	<Field name="naam" label="Naam">
		{#snippet children(control)}
			<div class="relative">
				<input
					{...control}
					class={[control.class, 'pr-10']}
					type="search"
					bind:value={politicianSearch}
					oninput={backToFirstPage}
					placeholder="Zoek kamerleden…"
				/>
				<span
					aria-hidden="true"
					class="absolute top-1/2 right-3 iconify size-5 -translate-y-1/2 text-osf-canvas-400 mdi--magnify"
				></span>
			</div>
		{/snippet}
	</Field>

	<!-- the list is long enough to be worth narrowing before reading it, so both
	     filters sit above it. their own first option is how a choice is undone again -->
	<div class="grid gap-x-4 gap-y-6 sm:grid-cols-2">
		<!-- the closed field greys out while nothing is picked, the way a placeholder does.
		     the options say their own colour back, or they would inherit that grey -->
		<Field name="fractie" label="Fractie" class={!selectedFraction ? 'text-osf-canvas-400' : ''}>
			{#snippet children(control)}
				<select {...control} bind:value={selectedFraction} onchange={backToFirstPage}>
					<option value="">Alle partijen...</option>
					{#each fractionOptions as fraction (fraction.value)}
						<option value={fraction.value} class="text-osf-violet-900">{fraction.label}</option>
					{/each}
				</select>
			{/snippet}
		</Field>

		{#if data.commissions.length > 0}
			<Field
				name="commissie"
				label="Commissie"
				class={!selectedCommission ? 'text-osf-canvas-400' : ''}
			>
				{#snippet children(control)}
					<select {...control} bind:value={selectedCommission} onchange={backToFirstPage}>
						<option value="">Alle onderwerpen...</option>
						{#each data.commissions as commission (commission.abbreviation)}
							<option value={commission.abbreviation} class="text-osf-violet-900">
								{commission.shortName}
							</option>
						{/each}
					</select>
				{/snippet}
			</Field>
		{/if}
	</div>
</search>

<p aria-live="polite" class="mb-5 flex min-h-8 items-center text-sm text-osf-canvas-500">
	{matchingPoliticians.length}&nbsp;{matchingPoliticians.length === 1 ? 'resultaat' : 'resultaten'}
</p>

{#if matchingPoliticians.length === 0}
	<p class="text-osf-canvas-500">Geen kamerleden gevonden. Pas je zoekterm of filters aan.</p>
{:else}
	<!-- picking is the whole step, so every Kamerlid is the link on to the next one and
	     this step needs no button of its own. the columns are capped at zero so a long
	     fraction name cannot widen the page -->
	<!-- every href comes from stepHref, which resolves the step path itself -->
	<!-- eslint-disable svelte/no-navigation-without-resolve -->
	<ul class="grid grid-cols-1 gap-4 sm:grid-cols-2">
		{#each shownPoliticians as politician (politician.id)}
			{@const chosen = politician.slug === draft.aan}
			<li>
				<a
					href={stepHref('vraag', { ...draft, aan: politician.slug })}
					aria-current={chosen ? 'true' : undefined}
					class={[
						'flex h-full items-center gap-3 rounded p-5',
						chosen
							? 'bg-osf-violet-50 ring-2 ring-osf-violet-500'
							: 'bg-osf-canvas-100 hover:bg-osf-canvas-200'
					]}
				>
					<Avatar
						class="text-xl"
						size={56}
						loading="lazy"
						name={politician.name}
						src={resolve('/politici/[slug]/foto', { slug: politician.slug })}
					/>

					<span class="min-w-0">
						<span class="block truncate font-medium">{politician.name}</span>
						<span
							class="block truncate text-sm text-osf-canvas-600"
							title={politician.fractionName}
						>
							{politician.fraction ??
								politician.fractionName}{#if politician.fractionRole === 'chair'}&nbsp;·&nbsp;Fractievoorzitter{/if}
						</span>
					</span>

					<span
						aria-hidden="true"
						class="ml-auto iconify size-5 shrink-0 text-osf-canvas-400 mdi--chevron-right"
					></span>
				</a>
			</li>
		{/each}
	</ul>
	<!-- eslint-enable svelte/no-navigation-without-resolve -->

	<Pagination
		count={matchingPoliticians.length}
		page={currentPage}
		perPage={POLITICIANS_PER_PAGE}
		selectPerPage={false}
	/>
{/if}
