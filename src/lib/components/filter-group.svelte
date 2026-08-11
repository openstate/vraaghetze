<script lang="ts">
	import { untrack, type Snippet } from 'svelte';

	type Props = {
		label: string;
		/** number of active choices, shown as a chip next to the label */
		selected: number;
		/** whether the group starts unfolded; after that the user is in charge */
		open?: boolean;
		children: Snippet;
	};

	let { label, selected, open: initiallyOpen = true, children }: Props = $props();

	let open = $state(untrack(() => initiallyOpen));
</script>

<details bind:open class="group min-w-0">
	<summary class="flex cursor-pointer items-center gap-2 py-1 font-medium">
		<span
			aria-hidden="true"
			class="iconify size-4 text-osf-canvas-400 mdi--chevron-right group-open:rotate-90"
		></span>
		{label}
		{#if selected > 0}
			<span
				class="rounded-sm bg-osf-violet-100 px-1.5 py-0.5 font-mono text-xs text-osf-violet-700"
			>
				{selected}
			</span>
		{/if}
	</summary>

	{@render children()}
</details>
