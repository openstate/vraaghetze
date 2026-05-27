<script lang="ts">
	import { resolve } from '$app/paths';

	let { data } = $props();
	const { politician } = $derived(data);
</script>

<main class="mx-auto max-w-3xl px-6 py-12">
	<a
		href={resolve('/politici')}
		class="mb-8 inline-flex items-center gap-1 text-sm text-osf-canvas-500 hover:text-osf-canvas-600"
	>
		<span class="iconify size-4 mdi--arrow-left"></span>
		Alle Kamerleden
	</a>

	<div class="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
		{#if politician.hasImage}
			<img
				src={resolve('/politici/[slug]/foto', { slug: politician.slug })}
				alt={politician.name}
				width="128"
				height="128"
				class="size-32 rounded-full object-cover"
			/>
		{:else}
			<div
				class="flex size-32 items-center justify-center rounded-full bg-osf-canvas-100 font-mono text-5xl text-osf-violet-500"
			>
				{politician.name.slice(0, 1)}
			</div>
		{/if}

		<div>
			<h1 class="font-serif text-4xl font-[450]">{politician.name}</h1>
			<p class="mt-2 text-osf-canvas-500">
				{politician.fractionName}
				{#if politician.fraction && politician.fractionName !== politician.fraction}({politician.fraction}){/if}
				{#if politician.fractionRole === 'chair'}· Fractievoorzitter{/if}
			</p>
		</div>
	</div>
</main>
