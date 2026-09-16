<script lang="ts">
	import type { AskDetails, AskField, AskFormType } from "$lib/ask";
	import type { UserType } from "$lib/server/auth";
	import Button from '$lib/components/button.svelte';
	import Register from '$lib/components/register.svelte';
	import Login from '$lib/components/login.svelte';
	import AskForCode from '$lib/components/ask-for-code.svelte';
	import type { ActionData as GegevensActionData } from "../../routes/vragen/stellen/gegevens/$types";
  import type { ActionData as InloggenActionData} from "../../routes/inloggen/$types";

	export type IdentifyMode = 'asking_question' | 'login';

  type Props = {
		identifyMode: IdentifyMode,
    formType: AskFormType,
    user?: UserType,
    form?: GegevensActionData | InloggenActionData,
    details: AskDetails,
    issues: Partial<Record<AskField, string[]>>,
    loginActive: boolean,
    askForCode: boolean,
    newUserActive: boolean,
    previousUrl?: string
    handleSubmit: (event: SubmitEvent & { currentTarget: EventTarget & HTMLFormElement}) => {}
  }

  let {
		identifyMode,
    formType,
    user,
    form,
    details = $bindable(),
    issues,
    loginActive,
    askForCode,
    newUserActive,
    previousUrl,
    handleSubmit
  }: Props = $props();
</script>

<form
	method="POST"
	novalidate
	class="grid gap-6"
	onsubmit={handleSubmit}
>
	<input type="hidden" name="formType" value={formType} />

	{#if user}
	<div class="grid gap-6">
		<Register
			{identifyMode}
			{user}
			bind:details={details}
			{issues}
			 />
	</div>
	{#if form?.error}
		<p class="mb-4 text-sm text-osf-shocking-pink">{form.error}</p>
	{/if}
	{:else}
	<div class="grid grid-cols-2 gap-x-12">
		<div class={loginActive || askForCode ? 'opacity-30' : ''}>
			<h1 class="mb-4 font-serif text-2xl">Aanmelden</h1>
			<Register
				{identifyMode}
				{user}
				bind:details={details}
				{issues}
				disabled={loginActive}
				setIsActive={(value => newUserActive = value)}
			/>
			{#if form?.error && formType && ['newUser', 'missingName'].includes(formType)}
				<p class="mb-4 mt-4 text-sm text-osf-shocking-pink">{form.error}</p>
			{/if}
		</div>
		<div class={newUserActive ? 'opacity-30' : ''}>
			<h1 class="mb-4 font-serif text-2xl">Inloggen</h1>
			{#if askForCode}
				<AskForCode
					bind:details={details}
					issues={issues}
				/>
			{:else}
				<Login
					{identifyMode}
					bind:details={details}
					{issues}
					disabled={newUserActive}
					setIsActive={(value) => loginActive = value}
				/>
			{/if}
			{#if form?.error && formType && ['userLogin', 'codeFromEmail'].includes(formType)}
				<p class="mb-4 mt-4 text-sm text-osf-shocking-pink">{form.error}</p>
			{/if}
		</div>
	</div>
	{/if}

	<div class="mt-2 flex flex-wrap items-center justify-end gap-3">
    {#if previousUrl}
		  <Button variant="secondary" class="mr-auto" href={previousUrl}>Vorige</Button>
    {/if}
		<Button type="submit" variant="primary" icon="mdi--arrow-right">Volgende</Button>
</div>
</form>
