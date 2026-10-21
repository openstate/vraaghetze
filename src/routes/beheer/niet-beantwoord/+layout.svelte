<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { Tabs } from 'bits-ui';
	import Page from '$lib/components/page.svelte';

	let { children, data } = $props();

	const tabs = $derived([
		{
			value: 'alles',
			label: `Alles (${data.stats.nNotAnswered})`,
			href: resolve('/beheer/niet-beantwoord/alles')
		},
		{
			value: 'over-tijd',
			label: `Over tijd (${data.stats.nOverdue})`,
			href: resolve('/beheer/niet-beantwoord/over-tijd')
		},
		{
			value: 'herinneringsmail',
			label: `Herinneringsmail (${data.stats.nToRemind})`,
			href: resolve('/beheer/niet-beantwoord/herinneringsmail')
		},
		{
			value: 'wachten',
			label: `Wachten (${data.stats.nOverdueNoReminder})`,
			href: resolve('/beheer/niet-beantwoord/wachten')
		},
		{
			value: 'al-gestuurd',
			label: `Al gestuurd (${data.stats.nAlreadyReminded})`,
			href: resolve('/beheer/niet-beantwoord/al-gestuurd')
		},
		{
			value: 'ongeverifieerd',
			label: `Ongeverifieerd (${data.stats.nUnverified})`,
			href: resolve('/beheer/niet-beantwoord/ongeverifieerd')
		}
	]);

	const currentTab = $derived(page.url.pathname.split('/')[3] ?? 'herinneringsmail');
</script>

<Page width="wide">
	<h1 class="mb-8 font-serif text-4xl">Niet-beantwoorde vragen</h1>

	<div class="flex gap-8 align-middle">
		<Tabs.Root
			value={currentTab}
			onValueChange={(value) => {
				const href = tabs.find((tab) => tab.value === value)?.href ?? tabs[0].href;
				// eslint-disable-next-line svelte/no-navigation-without-resolve
				goto(href, { keepFocus: true, noScroll: true });
			}}
		>
			<Tabs.List class="tabs_list mb-8 flex gap-1 rounded bg-osf-canvas-100 p-1">
				{#each tabs as tab (tab.value)}
					<Tabs.Trigger
						value={tab.value}
						class="cursor-pointer rounded-sm px-4 py-1.5 font-mono text-sm font-medium data-[state=active]:bg-osf-violet-900 data-[state=active]:text-osf-canvas-50"
					>
						{tab.label}
					</Tabs.Trigger>
				{/each}
			</Tabs.List>
		</Tabs.Root>
	</div>

	{@render children()}
</Page>

<style>
	:global(.tabs_list) {
		width: fit-content;
	}
	@media screen and (max-width: 480px) {
		:global(.tabs_list) {
			width: auto;
			flex-wrap: wrap;
		}
	}
</style>
