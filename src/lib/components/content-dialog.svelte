<script lang="ts">
	import { Dialog } from 'bits-ui';

	type Props = { title: string; body: string | null };

	let { title, body }: Props = $props();
</script>

<Dialog.Root>
	<Dialog.Trigger
		title="Toon inhoud"
		aria-label="Toon inhoud"
		class="ml-auto flex size-8 cursor-pointer items-center justify-center rounded-sm text-osf-canvas-500 hover:bg-osf-canvas-100 hover:text-osf-violet-900 dark:hover:bg-osf-violet-800 dark:hover:text-osf-canvas-50"
	>
		<span class="iconify size-4.5 mdi--text-box-outline"></span>
	</Dialog.Trigger>

	<Dialog.Portal>
		<Dialog.Overlay class="fixed inset-0 z-40 bg-osf-violet-900/40" />

		<Dialog.Content
			class="fixed top-1/2 left-1/2 z-50 grid max-h-[85vh] w-[min(44rem,calc(100vw-3rem))] -translate-x-1/2 -translate-y-1/2 content-start gap-4 overflow-y-auto rounded border border-osf-canvas-200 bg-osf-neutral-50 p-6 dark:border-osf-violet-700 dark:bg-osf-violet-900"
		>
			<div class="flex items-center justify-between gap-4">
				<Dialog.Title class="font-medium">{title}</Dialog.Title>

				<Dialog.Close
					aria-label="Sluiten"
					class="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-sm text-osf-canvas-500 hover:bg-osf-canvas-100 hover:text-osf-violet-900 dark:hover:bg-osf-violet-800 dark:hover:text-osf-canvas-50"
				>
					<span class="iconify size-5 mdi--close"></span>
				</Dialog.Close>
			</div>

			<Dialog.Description class="text-sm wrap-break-word whitespace-pre-wrap">
				{#if body}
					{body}
				{:else}
					<span class="text-osf-canvas-400">Geen inhoud.</span>
				{/if}
			</Dialog.Description>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
