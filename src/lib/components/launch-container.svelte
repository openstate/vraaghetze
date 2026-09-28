<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		children: Snippet;
	};

	let { children }: Props = $props();

</script>

<style>
  .container {
    max-width: 100%;
    opacity: var(--opacity);
    position: relative;
    height: var(--height);
    max-height: var(--height);
    transition: opacity 2s linear;
  }
</style>

<div class="container">
	{@render children()}
</div>