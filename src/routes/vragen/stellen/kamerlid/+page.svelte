<script lang="ts">
	import { replaceState } from '$app/navigation';
	import { page } from '$app/state';
	import { draftFromUrl, stepHref } from '$lib/ask';
	import SelectPolitician from '$lib/components/select-politician.svelte';
	import { parsePagination } from '$lib/pagination';

	const POLITICIANS_PER_PAGE = 12;

	let { data } = $props();

	const draft = $derived(draftFromUrl(page.url));
	const nextStep = $derived(data.user || data.changing ? 'controle' : 'vraag');

	// every Kamerlid is here already, so a page turn only slices them, never reloads them
	const currentPage = $derived(parsePagination(page.url).page);

	// a narrowed list has fewer pages, so searching from page four cannot land on nothing
	function backToFirstPage() {
		if (currentPage === 1) return;

		const url = new URL(page.url);
		url.searchParams.delete('pagina');

		// eslint-disable-next-line svelte/no-navigation-without-resolve
		replaceState(url, {});
	}

	function hrefForPolitician(slug: string) {
		return stepHref(nextStep, { ...draft, aan: slug });
	}
</script>

<h1 class="mb-6 font-serif text-4xl">Kies een Kamerlid</h1>

<p class="mb-8 text-osf-canvas-600">
	Je stelt een vraag aan één Kamerlid. Zoek op naam, of kies eerst een fractie of commissie.
</p>

<SelectPolitician
	politicians={data.politicians}
	commissions={data.commissions}
	politiciansPerPage={POLITICIANS_PER_PAGE}
	slugChosenPolitician={draft.aan}
	{backToFirstPage}
	{hrefForPolitician}
/>
