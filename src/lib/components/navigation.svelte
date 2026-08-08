<script lang="ts">
	import Button from '$lib/components/button.svelte';
	import logo from '$lib/assets/logo.svg?raw';
	import { Collapsible } from 'bits-ui';
	import { resolve } from '$app/paths';
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { hasPermission } from '$lib/permissions';
	import type { SvelteHTMLElements } from 'svelte/elements';

	const props: SvelteHTMLElements['header'] = $props();

	let expanded = $state(false);

	afterNavigate(() => (expanded = false));
</script>

{#snippet menuLinks()}
	<a href={resolve('/vragen')}>Vragen & Antwoorden</a>
	<a href={resolve('/politici')}>Kamerleden</a>
	<a href={resolve('/')}>Over ons</a>
	{#if hasPermission(page.data.user, { question: ['moderate'] })}
		<a href={resolve('/moderatie')}>Moderatie</a>
	{/if}
{/snippet}

<svelte:window
	onkeydown={(event) => {
		if (expanded && event.key === 'Escape') expanded = false;
	}}
/>

<Collapsible.Root bind:open={expanded}>
	{#snippet child({ props: rootProps })}
		<header
			{...rootProps}
			{...props}
			class={[
				'relative bg-osf-neutral-50 dark:bg-osf-violet-900 dark:text-osf-violet-50',
				props.class
			]}
		>
			<Button href="#inhoud" variant="primary" class="absolute top-3 left-3 z-50 not-focus:sr-only">
				Naar de inhoud
			</Button>

			<nav
				class="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-5 lg:grid lg:grid-cols-[1fr_2fr_1fr]"
			>
				<h1>
					<a href={resolve('/')} class="block w-fit [&>svg]:h-5.5 [&>svg]:w-auto">
						<!-- eslint-disable-next-line svelte/no-at-html-tags -->
						{@html logo}
						<span class="sr-only">VraagHetZe</span>
					</a>
				</h1>

				<div class="justify-center gap-8 max-lg:hidden lg:flex xl:gap-16">
					{@render menuLinks()}
				</div>

				<Button
					href={resolve('/profiel')}
					variant="secondary"
					icon="mdi--account-circle-outline"
					class="ml-auto max-lg:hidden"
				>
					Jouw vragen
				</Button>

				<Collapsible.Trigger
					aria-label={expanded ? 'Menu sluiten' : 'Menu openen'}
					class="-mr-1 flex size-8 cursor-pointer items-center justify-center lg:hidden"
				>
					<span class={['iconify size-6', expanded ? 'mdi--close' : 'mdi--equal']}></span>
				</Collapsible.Trigger>
			</nav>

			<Collapsible.Content
				class="grid gap-5 border-b border-osf-canvas-200 px-6 py-6 lg:hidden dark:border-osf-violet-700"
			>
				{@render menuLinks()}

				<Button href={resolve('/profiel')} variant="secondary" icon="mdi--account-circle-outline">
					Jouw vragen
				</Button>
			</Collapsible.Content>
		</header>
	{/snippet}
</Collapsible.Root>
