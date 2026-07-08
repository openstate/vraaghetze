<script lang="ts">
	import Button from '$lib/components/button.svelte';
	import favicon from '$lib/assets/favicon.svg';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { hasPermission } from '$lib/permissions';
	import type { SvelteHTMLElements } from 'svelte/elements';

	const props: SvelteHTMLElements['header'] = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<header
	{...props}
	class={['bg-osf-neutral-50 dark:bg-osf-violet-900 dark:text-osf-violet-50', props.class]}
>
	<nav
		class="mx-auto grid max-w-7xl grid-cols-[1fr_2fr_1fr] items-center justify-between px-6 py-5"
	>
		<h1 class="font-serif text-2xl font-[450]">
			<a href={resolve('/')}><span class="text-osf-shocking-pink">Vraag</span>HetZe</a>
		</h1>

		<div class="flex justify-center gap-16">
			<a href={resolve('/vragen')}>Vragen & Antwoorden</a>
			<a href={resolve('/politici')}>Kamerleden</a>
			<a href={resolve('/')}>Over ons</a>
			{#if hasPermission(page.data.user, { question: ['moderate'] })}
				<a href={resolve('/moderatie')}>Moderatie</a>
			{/if}
		</div>

		<Button
			href={resolve('/profiel')}
			variant="secondary"
			icon="mdi--account-circle-outline"
			class="ml-auto"
		>
			Jouw vragen
		</Button>
	</nav>
</header>
