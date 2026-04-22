<script lang="ts">
	import '@fontsource-variable/manuale/wght.css';
	import '@fontsource-variable/geist-mono/wght.css';
	import '@fontsource-variable/geist/wght.css';
	import './layout.css';

	import favicon from '$lib/assets/favicon.svg';
	import Navigation from '$lib/components/navigation.svelte';
	import { page } from '$app/state';

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<Navigation data-theme={page.url.pathname === '/' ? 'dark' : 'light'} />

{@render children()}
