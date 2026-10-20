<script module lang="ts">
	import { enhance } from '$app/forms';
	import Button from './button.svelte';
</script>

<script lang="ts">
	import { inboxStatusPills } from './status-pill.svelte';

	type Props = {
    isOpen: boolean;
    inboxId: string;
  };

	// eslint-disable-next-line no-useless-assignment
	let { isOpen = $bindable(), inboxId }: Props = $props();

	let disabled = $state(false);
</script>

<div class="grid p-6 pt-0 text-sm">
  <h2 class="font-serif text-xl">Acties</h2>
  <p>
    Dit antwoord is genegeerd omdat de afzender niet het Kamerlid is.
  </p>
  <ul class="text-body mb-3 list-inside list-disc space-y-1 text-sm">
    <li>
      Kies <strong>Toch verwerken</strong> om van deze mail een antwoord te maken dat vervolgens gemodereerd
      moet worden. Het antwoord zal afkomstig lijken van het oorspronkelijke Kamerlid waaraan de vraag gesteld was.
    </li>
    <li>
      Kies <strong>Negeren</strong> om deze mail te negeren. De status
      <strong>{inboxStatusPills['ignored_different_sender'].label}</strong> zal aangepast
      worden naar <strong>{inboxStatusPills['ignored'].label}</strong>.
    </li>
  </ul>
  <form
    method="POST"
    use:enhance={() => {
      disabled = true;

      return async ({ update }) => {
        await update();
        disabled = false;
        isOpen = false;
      };
    }}
  >
    <input type="hidden" name="inboxId" value={inboxId} />
    <input type="hidden" name="returnTo" value={encodeURIComponent(window.location.href)} />
    <div class="flex gap-4">
      <Button
        type="submit"
        variant="primary"
        name="action"
        value="process_anyway"
        {disabled}
        class={disabled ? 'disabled:opacity-40' : ''}
      >
        Toch verwerken
      </Button>
      <Button
        type="submit"
        variant="secondary"
        name="action"
        value="ignore"
        {disabled}
        class={disabled ? 'disabled:opacity-40' : ''}
      >
        Negeren
      </Button>
    </div>
  </form>
</div>
