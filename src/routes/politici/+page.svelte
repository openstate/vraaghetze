<script lang="ts">
	import { resolve } from '$app/paths';
	import Avatar from '$lib/components/avatar.svelte';
	import Page from '$lib/components/page.svelte';

	let { data } = $props();
</script>

<Page width="wide">
	<h1 class="mb-10 font-serif text-4xl font-[450]">Kamerleden</h1>

	<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
		{#each data.politicians as politician (politician.id)}
			<a
				href={resolve('/politici/[slug]', { slug: politician.slug })}
				class="group flex flex-col items-center rounded bg-osf-canvas-100 p-5 text-center transition-colors hover:bg-osf-canvas-200"
			>
				<Avatar
					class="mb-3 size-16 text-2xl"
					name={politician.name}
					loading="lazy"
					src={resolve('/politici/[slug]/foto', { slug: politician.slug })}
				/>

				<p class="text-sm leading-snug font-medium">{politician.name}</p>
				<p class="mt-1 text-xs text-osf-canvas-500">
					{politician.fraction ?? politician.fractionName}
					{#if politician.fractionRole === 'chair'}&nbsp;·&nbsp;Fractievoorzitter{/if}
				</p>
			</a>
		{/each}
	</div>
</Page>
