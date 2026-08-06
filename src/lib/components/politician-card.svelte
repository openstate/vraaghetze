<script lang="ts">
	import { resolve } from '$app/paths';
	import Avatar from '$lib/components/avatar.svelte';

	type Politician = {
		slug: string;
		name: string;
		fraction: string | null;
		fractionName: string;
		fractionRole: 'member' | 'chair';
	};

	let { politician }: { politician: Politician } = $props();

	const profileHref = $derived(resolve('/politici/[slug]', { slug: politician.slug }));
</script>

<article class="overflow-hidden rounded bg-osf-canvas-100">
	<div class="flex items-center gap-3 p-5">
		<a href={profileHref} class="shrink-0" aria-hidden="true" tabindex="-1">
			<Avatar
				class="size-14 text-xl"
				name={politician.name}
				loading="lazy"
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

		<a
			href="{resolve('/vragen/stellen')}?aan={politician.slug}"
			class="flex w-fit items-center gap-1 text-sm font-medium text-osf-violet-500 hover:underline"
		>
			Stel een vraag <span class="iconify size-4 mdi--arrow-right"></span>
		</a>
	</div>
</article>
