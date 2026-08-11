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

<div class={['mx-auto w-full px-6 pt-12 pb-20 md:pb-28', maxWidth, className]}>
	{@render children()}
</div>
