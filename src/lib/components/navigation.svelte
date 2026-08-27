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
	const teaserText = "Op dit moment kun je alleen de door jezelf gestelde vragen zien.<br>" +
		"Eventuele antwoorden worden ook nog niet getoond.<br>" +
		"Na de officiële lancering van VraagHetZe zullen alle gestelde vragen en antwoorden zichtbaar worden."
</script>

{#snippet menuLinks()}
	<a href={resolve('/vragen')}>Vragen & Antwoorden</a>
	<a href={resolve('/politici')}>Kamerleden</a>
	<a href={resolve('/over')}>Over ons</a>
	{#if hasPermission(page.data.user, { question: ['moderate'] })}
		<a href={resolve('/modereren')}>Moderatie</a>
	{/if}
{/snippet}

<svelte:window
	onkeydown={(event) => {
		if (expanded && event.key === 'Escape') expanded = false;
	}}
/>

<Collapsible.Root bind:open={expanded}>
	{#snippet child({ props: rootProps })}
		<header {...rootProps} {...props} class={['relative bg-osf-neutral-50', props.class]}>
			<nav
				class="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-5 lg:grid lg:grid-cols-[1fr_2fr_1fr]"
			>
				<h1>
					<a href={resolve('/')} class="block w-fit [&>svg]:h-6 [&>svg]:w-auto">
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
					variant="primary"
					icon="mdi--arrow-right"
					class="ml-auto max-lg:hidden"
				>
					Mijn vragen
				</Button>

				<Collapsible.Trigger
					aria-label={expanded ? 'Menu sluiten' : 'Menu openen'}
					class="-mr-1 flex size-8 cursor-pointer items-center justify-center lg:hidden"
				>
					<span class={['iconify size-6', expanded ? 'mdi--close' : 'mdi--equal']}></span>
				</Collapsible.Trigger>
			</nav>

			<Collapsible.Content class="grid gap-5 border-b border-osf-canvas-200 px-6 py-6 lg:hidden">
				{@render menuLinks()}

				<Button href={resolve('/profiel')} variant="primary" icon="mdi--arrow-right">
					Mijn vragen
				</Button>
			</Collapsible.Content>
		</header>
	{/snippet}
</Collapsible.Root>
<!-- Teaser -->
 <p class="mx-auto w-full px-6 text-center pt-3 pb-3"
    style="background-color:var(--color-osf-blue-200);color:var(--color-osf-blue-800)">
		{#if page.data.user?.role == 'admin'}
		Dit is de pre-launch site. Bezoekers die geen admin zijn zien de volgende tekst in deze balk:<br><br>
		{@html teaserText}
		{:else}
		{@html teaserText}
		{/if}
</p>