<script lang="ts">
	import { resolve } from '$app/paths';
	import Avatar from '$lib/components/avatar.svelte';
	import PoliticianStamp from '$lib/components/politician-stamp.svelte';
	import { preventAdding } from '$lib/politicians';

	type Politician = {
		slug: string;
		name: string;
		email: string;
		acceptsQuestions: boolean;
		fraction: string | null;
		fractionName: string;
		fractionRole: 'member' | 'chair';
	};

	let { mayAsk, mayModerate, politician }: { mayAsk: boolean, mayModerate: boolean, politician: Politician } = $props();

	const profileHref = $derived(resolve('/politici/[slug]', { slug: politician.slug }));
</script>


<article class="overflow-hidden rounded bg-osf-canvas-100">
	<div class="flex items-center gap-3 p-5 relative">
		{#if !politician.acceptsQuestions}
			<PoliticianStamp name={politician.name} email={politician.email} />
		{/if}
		<a href={profileHref} class="shrink-0" aria-hidden="true" tabindex="-1">
			<Avatar
				class="text-xl"
				size={56}
				name={politician.name}
				src={resolve('/politici/[slug]/foto', { slug: politician.slug })}
			/>
		</a>

		<div class="min-w-0">
			<p class="truncate font-medium">
				<a href={profileHref} class="hover:underline">{politician.name}</a>
			</p>
			<p class="truncate text-sm text-osf-canvas-600" title={politician.fractionName}>
				{politician.fraction ??
					politician.fractionName}{#if politician.fractionRole === 'chair'}&nbsp;·&nbsp;Fractievoorzitter{/if}
			</p>
		</div>
	</div>

	<hr class="mx-5 border-osf-canvas-200" />

	<div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 p-5">
		<a href={profileHref} tabindex="-1" class="text-sm text-osf-canvas-600 hover:underline">
			Bekijk profiel
		</a>

		{#if mayAsk}
			<a
				href="{resolve('/vragen/stellen')}?aan={politician.slug}"
				class="flex w-fit items-center gap-1 text-sm font-medium text-osf-violet-500 hover:underline"
				onclick={(e) => preventAdding(e, !politician.acceptsQuestions)}
			>
				Stel een vraag <span class="iconify size-4 mdi--arrow-right"></span>
			</a>
		{/if}

		{#if mayModerate}
			<a
				href="{resolve(`/politici/${politician.slug}/bewerken`)}"
				title="Bewerken"
				class="flex text-osf-violet-500"
			>
				<span class="iconify size-5 mdi--pencil"></span>
			</a>
		{/if}
	</div>
</article>
