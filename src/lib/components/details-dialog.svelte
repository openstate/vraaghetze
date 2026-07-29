<script module lang="ts">
	export type Detail = [label: string, value: string | Date | null];
</script>

<script lang="ts">
	import { Dialog } from 'bits-ui';
	import { formatDateTime } from '$lib/components/date-time.svelte';

	type Props = { title: string; details: Detail[] };

	let { title, details }: Props = $props();

	const cellClass = 'border-osf-canvas-200 dark:border-osf-violet-700';
	const valueClass = 'font-medium wrap-anywhere whitespace-pre-wrap';
</script>

<Dialog.Root>
	<Dialog.Trigger
		title="Toon details"
		aria-label="Toon details"
		class="flex size-8 cursor-pointer items-center justify-center rounded-sm text-osf-canvas-500 hover:bg-osf-canvas-100 hover:text-osf-violet-900 dark:hover:bg-osf-violet-800 dark:hover:text-osf-canvas-50"
	>
		<span class="iconify size-4.5 mdi--text-box-outline"></span>
	</Dialog.Trigger>

	<Dialog.Portal>
		<Dialog.Overlay class="fixed inset-0 z-40 bg-osf-violet-900/40" />

		<Dialog.Content
			aria-describedby={undefined}
			class="fixed top-1/2 left-1/2 z-50 flex max-h-[85vh] w-[min(44rem,calc(100vw-3rem))] -translate-x-1/2 -translate-y-1/2 flex-col rounded border border-osf-canvas-200 bg-osf-neutral-50 dark:border-osf-violet-700 dark:bg-osf-violet-900"
		>
			<div class="flex items-center justify-between gap-4 p-6 pb-4">
				<Dialog.Title class="font-medium">{title}</Dialog.Title>

				<Dialog.Close
					aria-label="Sluiten"
					class="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-sm text-osf-canvas-500 hover:bg-osf-canvas-100 hover:text-osf-violet-900 dark:hover:bg-osf-violet-800 dark:hover:text-osf-canvas-50"
				>
					<span class="iconify size-5 mdi--close"></span>
				</Dialog.Close>
			</div>

			<dl class="grid overflow-y-auto p-6 pt-0 text-sm sm:grid-cols-[minmax(0,1fr)_2fr]">
				{#each details.filter(([, value]) => value) as [label, value] (label)}
					<dt class={[cellClass, 'border-t pt-2 pr-6 first-of-type:border-t-0 sm:pb-2']}>
						{label}
					</dt>
					<dd
						class={[cellClass, valueClass, 'pb-2 sm:border-t sm:pt-2 sm:first-of-type:border-t-0']}
					>
						{value instanceof Date ? formatDateTime(value) : value}
					</dd>
				{/each}
			</dl>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
