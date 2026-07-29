<script lang="ts">
	import '@fontsource-variable/geist-mono/wght.css';
	import '@fontsource-variable/geist/wght.css';
	import './layout.css';

	import favicon32 from '$lib/assets/favicon-32.png';
	import favicon512 from '$lib/assets/favicon-512.png';
	import Navigation from '$lib/components/navigation.svelte';
	import { page } from '$app/state';

	let { children } = $props();

	const title = $derived(
		page.data.meta
			? `${page.data.meta.title} – VraagHetZe`
			: 'VraagHetZe – Antwoorden van Kamerleden voor iedereen'
	);
</script>

<svelte:head>
	<link rel="icon" type="image/png" sizes="32x32" href={favicon32} />
	<link rel="icon" type="image/png" sizes="512x512" href={favicon512} />
	<link rel="apple-touch-icon" href={favicon512} />
	<title>{title}</title>
</svelte:head>

<Navigation data-theme={page.url.pathname === '/' ? 'dark' : 'light'} />

{@render children()}
