<script lang="ts">
	import Button from '$lib/components/button.svelte';
	import logo from '$lib/assets/logo.svg?raw';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { hasPermission } from '$lib/permissions';
	import type { SvelteHTMLElements } from 'svelte/elements';

	const props: SvelteHTMLElements['header'] = $props();
</script>

<header
	{...props}
	class={['bg-osf-neutral-50 dark:bg-osf-violet-900 dark:text-osf-violet-50', props.class]}
>
	<nav
		class="mx-auto grid max-w-7xl grid-cols-[1fr_2fr_1fr] items-center justify-between px-6 py-5"
	>
		<h1>
			<a href={resolve('/')} class="block w-fit [&>svg]:h-5.5 [&>svg]:w-auto">
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				{@html logo}
				<span class="sr-only">VraagHetZe</span>
			</a>
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
