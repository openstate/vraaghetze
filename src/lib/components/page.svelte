<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		width?: 'content' | 'wide';
		class?: string;
		children: Snippet;
	};

	let { width = 'content', class: className = '', children }: Props = $props();

	const maxWidth = $derived(width === 'wide' ? 'max-w-7xl' : 'max-w-3xl');
</script>

<main class={['mx-auto w-full px-6 py-12', maxWidth, className]}>
	{@render children()}
</main>
