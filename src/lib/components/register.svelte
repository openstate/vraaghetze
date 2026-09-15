<script lang="ts">
	import { onMount } from 'svelte';
	import {
	newUserFormActive,
		type AskDetails,
		type AskIssues
	} from '$lib/ask';
	import Field from '$lib/components/field.svelte';
	import type { UserType } from '$lib/server/auth';

  type Props = {
    user?: UserType,
    details: AskDetails,
    issues: AskIssues,
    disabled?: boolean,
    setIsActive?: (value: boolean) => void
  }
  let { user, details = $bindable(), issues, disabled, setIsActive }: Props = $props();

  function inputHandler() {
    if (!setIsActive) return;

    const isActive = newUserFormActive(details, user);
    setIsActive(isActive);
  }

	onMount(() => {
		inputHandler();
	});
</script>

<p class="mb-4 text-osf-canvas-600">
  {#if !user}
    Voor nieuwe gebruikers.
  {/if}
  Je vraag wordt openbaar onder jouw naam. Je emailadres blijft privé.
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
  {/if}
</div>
