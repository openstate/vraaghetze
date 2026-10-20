<script module lang="ts">
	import { enhance } from '$app/forms';
	import type { CommissionsType } from '$lib/politicians';
	import type { ListQuestionQueueType } from '$lib/server/moderation';
	import type { PoliticiansType } from '$lib/politicians';
	import ModerationDialog from './moderation-dialog.svelte';
	import SelectPolitician from './select-politician.svelte';
</script>

<script lang="ts">
	type Props = {
    isOpen: boolean;
    data: unknown;
  };

	// eslint-disable-next-line no-useless-assignment
	let { isOpen = $bindable(), data = $bindable() }: Props = $props();

  type dataProps = {
    sendEmail: boolean;
    question: ListQuestionQueueType;
    politicians: PoliticiansType[];
    commissions: CommissionsType[];
  };

  const dataTyped = $derived(data as dataProps);

	let changePoliticianState: 'select' | 'confirm' = $state('select');

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const hrefForPolitician = (slug: string) => {
		return "#top";
	};

  let selectedPolitician = $derived(dataTyped.question.politicianSlug);

  const selectedHandler = (slug: string) => {
		selectedPolitician = slug;
		changePoliticianState = 'confirm';
	};
</script>

<div class="grid p-6 pt-0 text-sm">
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
    <input type="hidden" name="questionId" value={dataTyped.question.id} />
    <input type="hidden" name="returnTo" value={encodeURIComponent(window.location.href)} />
    <div class="flex gap-4">
      <ModerationDialog
        title="Selecteer ander Kamerlid"
        triggerTitle="Kamerlid aanpassen"
        triggerVariant="primary"
        actionValue="change-politician"
        hideActionButton={changePoliticianState == 'select'}
        closeAfterSubmit={true}
      >
        {#if changePoliticianState == 'select'}
          <div class="max-h-[73vh] overflow-y-auto">
            <SelectPolitician
              politicians={dataTyped.politicians}
              commissions={dataTyped.commissions}
              politiciansPerPage={150}
              slugChosenPolitician={dataTyped.question.politicianSlug}
              {selectedHandler}
              {hrefForPolitician}
            />
          </div>
        {:else}
          <input type="hidden" name="selectedPoliticianSlug" value={selectedPolitician}/>
          <p>
            Bevestig het aanpassen van het Kamerlid naar {selectedPolitician}.
            Zet een vinkje bij <strong>Stuur e-mail</strong> om de vraag ook naar het nieuwe Kamerlid te sturen (gebruik dit als het
            oorspronkelijke Kamerlid de vraag niet al zelf had doorgestuurd).
          </p>
          <label class="text-sm text-osf-canvas-600 mt-2">
            <input
              type="checkbox"
              name="sendEmail"
              value={true}
              bind:checked={dataTyped.sendEmail}
            />
            Stuur e-mail
          </label>
        {/if}
      </ModerationDialog>
    </div>
  </form>
</div>