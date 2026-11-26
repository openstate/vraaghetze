<script module lang="ts">
	import { browser } from '$app/environment';
	import type { CommissionsType } from '$lib/politicians';
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
    questionSlug: string;
    politicianSlug: string;
    politicians: PoliticiansType[];
    commissions: CommissionsType[];
  };

  const dataTyped = $derived(data as dataProps);

  const returnTo = browser ? encodeURIComponent(window.location.href) : '';

  let sendEmail = $state(false);
	let changePoliticianState: 'select' | 'confirm' = $state('select');

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const hrefForPolitician = (slug: string) => {
		return "#top";
	};

  let selectedPolitician = $derived(dataTyped.politicianSlug);

  const selectedHandler = (slug: string) => {
		selectedPolitician = slug;
		changePoliticianState = 'confirm';
	};

  const title = $derived(changePoliticianState == 'select' ? "Selecteer ander Kamerlid" : "Bevestig het aanpassen van het Kamerlid");
</script>

<input type="hidden" name="questionSlug" value={dataTyped.questionSlug} />
<input type="hidden" name="returnTo" value={returnTo} />
<div class="flex gap-4">
  <ModerationDialog
    title={title}
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
          slugChosenPolitician={dataTyped.politicianSlug}
          {selectedHandler}
          {hrefForPolitician}
        />
      </div>
    {:else}
      <input type="hidden" name="selectedPoliticianSlug" value={selectedPolitician}/>
      <p>
        Bevestig het aanpassen van het Kamerlid naar {selectedPolitician}. De termijn om een herinnering te
        sturen zal worden gereset.
        Zet een vinkje bij <strong>Stuur e-mail</strong> om de vraag ook naar het nieuwe Kamerlid te sturen (gebruik dit als het
        oorspronkelijke Kamerlid de vraag niet al zelf had doorgestuurd).
      </p>
      <label class="text-sm text-osf-canvas-600 mt-2">
        <input
          type="checkbox"
          name="sendEmail"
          value={true}
          bind:checked={sendEmail}
        />
        Stuur e-mail
      </label>
    {/if}
  </ModerationDialog>
</div>
