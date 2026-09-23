<script lang="ts">
	import Button from "./button.svelte";

  type Props = {
		previousUrl?: string;
		formError: string | undefined;
  }
  let {
		previousUrl,
		formError,
  }: Props = $props();
</script>

{#if formError}
  <p class="mb-4 mt-4 text-sm text-osf-shocking-pink">{formError}</p>
{/if}

<div class="mt-2 flex flex-wrap items-center justify-end gap-3">
  {#if previousUrl}
    <Button variant="secondary" href={previousUrl} class="mr-auto">
      Vorige
    </Button>
  {/if}
  <Button
    type="submit" variant="primary" icon="mdi--arrow-right">
    Volgende
  </Button>
</div>
