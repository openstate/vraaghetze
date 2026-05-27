<script lang="ts">
	import { resolve } from '$app/paths';

	let { data } = $props();
</script>

<main class="mx-auto max-w-7xl px-6 py-12">
	<h1 class="mb-10 font-serif text-4xl font-[450]">Kamerleden</h1>

	<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
		{#each data.politicians as politician (politician.id)}
			<a
				href={resolve('/politici/[slug]', { slug: politician.slug })}
				class="group flex flex-col items-center rounded bg-osf-canvas-100 p-5 text-center transition-colors hover:bg-osf-canvas-200"
			>
				{#if politician.hasImage}
					<img
						src={resolve('/politici/[slug]/foto', { slug: politician.slug })}
						alt={politician.name}
						width="64"
						height="64"
						loading="lazy"
						class="mb-3 size-16 rounded-full object-cover"
					/>
				{:else}
					<div
						class="mb-3 flex size-16 items-center justify-center rounded-full bg-white font-mono text-2xl text-osf-violet-500"
					>
						{politician.name.slice(0, 1)}
					</div>
				{/if}

				<p class="text-sm leading-snug font-medium">{politician.name}</p>
				<p class="mt-1 text-xs text-osf-canvas-500">
					{politician.fraction ?? politician.fractionName}
					{#if politician.fractionRole === 'chair'}&nbsp;·&nbsp;Fractievoorzitter{/if}
				</p>
			</a>
		{/each}
	</div>
</main>
