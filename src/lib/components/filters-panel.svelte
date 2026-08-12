<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = { children: Snippet };

	let { children }: Props = $props();
</script>

<aside
	class="min-w-0 lg:sticky lg:top-6 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto"
>
	<!-- the panel starts collapsed below lg. from lg up the content is forced open. 	the
	     toggle is only hidden when the browser understands that rule -->
	<details
		class="group/panel rounded border-osf-canvas-200 max-lg:border max-lg:px-4 max-lg:py-3 lg:details-content:[content-visibility:visible]"
	>
		<summary
			class="flex cursor-pointer list-none items-center gap-2 font-medium supports-[selector(::details-content)]:lg:hidden [&::-webkit-details-marker]:hidden"
		>
			<span aria-hidden="true" class="iconify size-4 text-osf-canvas-400 mdi--filter-variant"
			></span>
			Filters
			<span
				aria-hidden="true"
				class="ml-auto iconify size-4 text-osf-canvas-400 mdi--chevron-right group-open/panel:rotate-90"
			></span>
		</summary>

		<div
			class="divide-y divide-osf-canvas-200 max-lg:mt-3 max-lg:border-t max-lg:border-osf-canvas-200 max-lg:pt-3"
		>
			{@render children()}
		</div>

		<noscript>
			<button
				type="submit"
				class="mt-6 w-full cursor-pointer rounded-sm bg-osf-violet-900 px-4 py-2 text-sm font-medium text-osf-canvas-50"
			>
				Filters toepassen
			</button>
		</noscript>
	</details>
</aside>
