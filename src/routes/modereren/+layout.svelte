<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { Tabs } from 'bits-ui';
	import Page from '$lib/components/page.svelte';

	let { children, data } = $props();

	const tabs = $derived([
		{
			value: 'vragen',
			label: `Vragen (${data.queues.questions})`,
			href: resolve('/modereren/vragen')
		},
		{
			value: 'antwoorden',
			label: `Antwoorden (${data.queues.answers})`,
			href: resolve('/modereren/antwoorden')
		},
		{ value: 'archief', label: 'Archief', href: resolve('/modereren/archief') },
		{ value: 'inbox', label: 'Inbox', href: resolve('/modereren/inbox') },
		{ value: 'outbox', label: 'Outbox', href: resolve('/modereren/outbox') }
	]);

	const currentTab = $derived(page.url.pathname.split('/')[2] ?? 'vragen');
</script>

<Page width="wide">
	<h1 class="mb-8 font-serif text-4xl">Moderatie</h1>

	<Tabs.Root
		value={currentTab}
		onValueChange={(value) => {
			const href = tabs.find((tab) => tab.value === value)?.href ?? tabs[0].href;
			const perPage = page.url.searchParams.get('per');
			// eslint-disable-next-line svelte/no-navigation-without-resolve
			goto(perPage ? `${href}?per=${perPage}` : href, { keepFocus: true, noScroll: true });
		}}
	>
		<Tabs.List class="mb-8 flex w-fit gap-1 rounded bg-osf-canvas-100 p-1">
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

	{@render children()}
</Page>
