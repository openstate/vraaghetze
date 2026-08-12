<script lang="ts">
	import type { Snippet } from 'svelte';
	import Page from '$lib/components/page.svelte';

	type Props = { title: string; children: Snippet };

	let { title, children }: Props = $props();
</script>

<Page>
	<h1 class="font-serif text-4xl">{title}</h1>

	<div class="content mt-10">
		{@render children()}
	</div>
</Page>

<style>
	.content :global(h2) {
		margin-top: 2.5rem;
		font-family: var(--font-serif);
		font-size: 1.5rem;
		line-height: 1.3;
	}

	.content :global(p),
	.content :global(ul),
	.content :global(ol) {
		margin-top: 1rem;
	}

	.content :global(> *:first-child) {
		margin-top: 0;
	}

	.content :global(ul),
	.content :global(ol) {
		padding-left: 1.5rem;
	}

	.content :global(ul) {
		list-style: disc;
	}

	.content :global(ol) {
		list-style: decimal;
	}

	.content :global(li) {
		margin-top: 0.5rem;
	}

	.content :global(strong) {
		font-weight: 500;
	}

	.content :global(a) {
		color: var(--color-osf-violet-500);
		font-weight: 500;
	}

	.content :global(a:hover) {
		text-decoration: underline;
		text-underline-offset: 2px;
	}
</style>
