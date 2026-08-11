<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = { href: string; variant?: 'dark' | 'bright'; children: Snippet };

	let { href, variant = 'dark', children }: Props = $props();

	const cardClass = $derived([
		'group flex lg:min-h-52 flex-col justify-between rounded p-6 text-osf-violet-50',
		variant === 'dark' ? 'bg-osf-violet-900' : 'bg-osf-violet-500'
	]);

	const arrowClass =
		'mt-8 ml-auto flex size-11 items-center justify-center rounded-full bg-osf-neutral-50 text-osf-violet-900';
</script>

<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
<a {href} class={cardClass}>
	<span class="font-serif text-2xl/snug">{@render children()}</span>

	<span aria-hidden="true" class={arrowClass}>
		<span
			class="iconify size-4.5 transition-transform duration-200 mdi--arrow-right motion-safe:group-hover:scale-125 motion-safe:group-hover:-rotate-45"
		></span>
	</span>
</a>
