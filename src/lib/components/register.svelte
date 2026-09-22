<script lang="ts">
	import { onMount } from 'svelte';
	import {
	newUserFormActive,
		type AskDetails,
		type AskIssues
	} from '$lib/ask';
	import Field from '$lib/components/field.svelte';
	import CapWidget from '$lib/components/cap-widget.svelte';
	import type { UserType } from '$lib/server/auth';
	import type { IdentifyMode } from './register-or-login.svelte';
	import { resolve } from '$app/paths';
  
  type Props = {
    identifyMode: IdentifyMode;
    user?: UserType;
    details: AskDetails;
    issues: AskIssues;
    disabled?: boolean;
    capjsSiteKey?: string;
    setIsActive?: (value: boolean) => void;
  }
  let {
    identifyMode,
    user,
    details = $bindable(),
    issues,
    disabled,
    capjsSiteKey,
    setIsActive
  }: Props = $props();


  function inputHandler() {
    if (!setIsActive) return;

    const isActive = newUserFormActive(details, user);
    setIsActive(isActive);
  }

  let capToken = $state('');

	onMount(() => {
		inputHandler();
	});
</script>

<p class="mb-4 text-osf-canvas-600">
  {#if !user}
    Voor nieuwe gebruikers.
  {/if}
  {#if identifyMode == 'asking_question'}
    Je vraag wordt openbaar onder jouw naam. Je emailadres blijft privé.
  {/if}
</p>
<div class="grid gap-6">
  <Field name="name" label="Je volledige naam" issues={issues.name}>
    {#snippet children(control)}
      <input
        {...control}
        bind:value={details.name}
        required
        autocomplete="name"
        placeholder="Sanne de Vries"
  			disabled={disabled}
        oninput={inputHandler}
      />
    {/snippet}
  </Field>

  {#if user}
    <p class="text-osf-canvas-600">Je e-mailadres: {user.email}</p>
  {:else}
    <Field name="email" label="Je e-mailadres" issues={issues.email}>
      {#snippet children(control)}
        <input
          {...control}
          type="email"
          bind:value={details.email}
          required
          autocomplete="email"
          placeholder="sanne@voorbeeld.nl"
          disabled={disabled}
          oninput={inputHandler}
        />
      {/snippet}
    </Field>
    <Field name="emailConfirmation" label="Bevestiging e-mailadres" issues={issues.emailConfirmation}>
      {#snippet children(control)}
        <input
          {...control}
          type="email"
          bind:value={details.emailConfirmation}
          required
          autocomplete="email"
          placeholder="sanne@voorbeeld.nl"
          disabled={disabled}
          oninput={inputHandler}
        />
      {/snippet}
    </Field>

    <p class="text-osf-canvas-600 text-sm">
      Bekijk onze
      <a href={resolve('/privacy')} target="_blank" class="hover:underline text-osf-violet-500">Privacyverklaring</a>
      voor informatie over de
      verwerking van je persoonsgegevens.
    </p>

    <Field name="acceptTandC" issues={issues.acceptTandC}>
      {#snippet children(control)}
        <label class="text-osf-canvas-600 text-sm">
          <input
            type="checkbox"
            name="acceptTandC"
            value="1"
            bind:checked={details.acceptTandC}
            disabled={disabled}
          />
          Ik ga akkoord met de
          <a href={resolve('/voorwaarden')} target="_blank" class="hover:underline text-osf-violet-500">Algemene voorwaarden</a>.
        </label>
      {/snippet}
    </Field>

    <Field name="ageChecked" issues={issues.ageChecked}>
      {#snippet children(control)}
        <label class="text-osf-canvas-600 text-sm">
          <input
            type="checkbox"
            name="ageChecked"
            value="1"
            bind:checked={details.ageChecked}
            disabled={disabled}
          />
          Ik ben 16 jaar of ouder, of ik ben jonger en hierbij geven mijn ouders/verzorgers toestemming.
        </label>
      {/snippet}
    </Field>

    {#if capjsSiteKey && details.acceptTandC && details.ageChecked}
      <Field name="capToken">
        {#snippet children(control)}
          <CapWidget bind:token={capToken} capjsSiteKey={capjsSiteKey} />
          <input type="hidden" name="capToken" value={capToken} />
        {/snippet}
      </Field>
    {/if}
  {/if}
</div>
