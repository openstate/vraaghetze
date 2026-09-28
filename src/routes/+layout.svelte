<script lang="ts">
	import '@fontsource-variable/geist-mono/wght.css';
	import '@fontsource-variable/geist/wght.css';
	import './layout.css';

	import favicon32 from '$lib/assets/favicon-32.png';
	import favicon512 from '$lib/assets/favicon-512.png';
	import BrandBar from '$lib/components/brand-bar.svelte';
	import Button from '$lib/components/button.svelte';
	import FlashMessage from '$lib/components/flash-message.svelte';
	import Footer from '$lib/components/footer.svelte';
	import Loading from '$lib/components/loading.svelte';
	import Navigation from '$lib/components/navigation.svelte';
	import { getFlash } from 'sveltekit-flash-message';
	import { page } from '$app/state';
	import { afterNavigate } from '$app/navigation';

	let { children } = $props();

	const title = $derived(
		page.data.meta
			? `${page.data.meta.title} – VraagHetZe`
			: 'VraagHetZe – Antwoorden van Kamerleden voor iedereen'
	);
	const flash = getFlash(page);

	afterNavigate((navigation) => {
		// the initial page load is already tracked by the Matomo snippet in app.html
		if (navigation.type === 'enter' || !navigation.to) return;

		const matomo = (window._paq = window._paq || []);
		if (navigation.from) matomo.push(['setReferrerUrl', navigation.from.url.href]);
		matomo.push(['setCustomUrl', navigation.to.url.href]);
		matomo.push(['setDocumentTitle', document.title]);
		matomo.push(['trackPageView']);
		matomo.push(['enableLinkTracking']);
	});
</script>

<svelte:head>
	<link rel="icon" type="image/png" sizes="32x32" href={favicon32} />
	<link rel="icon" type="image/png" sizes="512x512" href={favicon512} />
	<link rel="apple-touch-icon" href={favicon512} />
	<title>{title}</title>
</svelte:head>

<Loading />

<Button href="#inhoud" variant="primary" class="fixed top-3 left-3 z-50 not-focus:sr-only">
	Naar de inhoud
</Button>

<BrandBar />

<Navigation class={page.url.pathname === '/' ? 'bg-osf-canvas-50!' : (page.url.pathname === '/launch' ? 'hideForLaunch' : '')} />

{#if $flash}
	<FlashMessage type={$flash.type} message={$flash.message} />
{/if}

<main id="inhoud" tabindex="-1" class="grow">
	{@render children()}
</main>

<Footer class={page.url.pathname === '/launch' ? 'hideForLaunch' : ''} />
