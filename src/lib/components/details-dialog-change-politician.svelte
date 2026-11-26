<script module lang="ts">
	import { enhance } from '$app/forms';
  import DetailsDialogChangePoliticianFormContents from './details-dialog-change-politician-form-contents.svelte';
</script>

<script lang="ts">
	type Props = {
    isOpen: boolean;
    buttonOnly?: boolean;
    data: unknown;
  };

	let { isOpen = $bindable(), buttonOnly = false, data = $bindable() }: Props = $props();

  const margin = $derived(buttonOnly ? '' : 'p-6 pt-0');
</script>

<div class="grid {margin} text-sm">
  {#if buttonOnly}
    <DetailsDialogChangePoliticianFormContents bind:isOpen={isOpen} {data} />
  {:else}
    <h2 class="font-serif text-xl">Acties</h2>
    <p>
      Als het Kamerlid een ander Kamerlid voorstelt gebruik dan "Kamerlid aanpassen".
    </p>
    <ul class="text-body mb-3 list-inside list-disc space-y-1 text-sm">
      <li>
        Kies <strong>Kamerlid aanpassen</strong> om het Kamerlid aan te passen. De termijn om een herinnering te
        sturen zal worden gereset. Zet in het bevestigingsscherm een vinkje bij
        <strong>Stuur e-mail</strong> om de vraag ook naar het nieuwe Kamerlid te sturen (gebruik dit als het
        oorspronkelijke Kamerlid de vraag niet al zelf had doorgestuurd).
      </li>
    </ul>
    <form
      method="POST"
      use:enhance={() => {
        return async ({ update }) => {
          await update();
          isOpen = false;
        };
      }}
    >
      <DetailsDialogChangePoliticianFormContents bind:isOpen={isOpen} {data} />
    </form>
  {/if}
</div>