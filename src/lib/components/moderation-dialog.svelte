<script lang="ts">
	import { Dialog } from 'bits-ui';
	import Button from './button.svelte';
	import type { Snippet } from 'svelte';

	type Props = {
    title: string;
    triggerTitle: string;
    triggerVariant: "primary" | "secondary";
    actionValue: string;
    buttonDisabled?: boolean;
    children: Snippet;
  };

	let { title, triggerTitle, triggerVariant, actionValue, buttonDisabled, children }: Props = $props();
</script>

<Dialog.Root>
	<Dialog.Trigger>
    <Button type="button" name="action" variant={triggerVariant}
            title={triggerTitle} aria-label={triggerTitle}>
      {triggerTitle}
    </Button>
	</Dialog.Trigger>

	<Dialog.Portal disabled>
		<Dialog.Overlay class="fixed inset-0 z-40 bg-osf-violet-900/40" />
		<Dialog.Content
			aria-describedby={undefined}
			class="fixed top-1/2 left-1/2 z-50 flex max-h-[85vh] w-[min(44rem,calc(100vw-3rem))] -translate-x-1/2 -translate-y-1/2 flex-col rounded border border-osf-canvas-200 bg-osf-neutral-50"
		>
			<div class="flex items-center justify-between gap-4 p-6 pb-4">
				<Dialog.Title class="font-medium">{title}</Dialog.Title>

				<Dialog.Close
					aria-label="Sluiten"
					class="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-sm text-osf-canvas-500 hover:bg-osf-canvas-100 hover:text-osf-violet-900"
				>
					<span class="iconify size-5 mdi--close"></span>
				</Dialog.Close>
			</div>
      <div class="flex flex-col items-start gap-1 pb-11 pt-7 ps-6">
        {@render children()}
        <Button
            type="submit"
            name="action"
            value={actionValue}
            variant="primary"
            class="mt-3 {buttonDisabled ? 'disabled:opacity-40' : ''}"
            disabled={buttonDisabled}
        >
          {triggerTitle}
        </Button>
      </div>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
