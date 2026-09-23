<script lang="ts">
	import { type ActiveMode, type AskDetails, type AskField } from "$lib/ask";
	import type { UserType } from "$lib/server/auth";
	import Register from '$lib/components/register.svelte';
	import Login from '$lib/components/login.svelte';
	import AskForCode from '$lib/components/ask-for-code.svelte';
	import type { ActionData as GegevensActionData } from "../../routes/vragen/stellen/gegevens/$types";
  import type { ActionData as InloggenActionData} from "../../routes/inloggen/$types";
	import { onMount } from "svelte";

	export type IdentifyMode = 'asking_question' | 'login';

  type Props = {
		identifyMode: IdentifyMode;
    user?: UserType;
    form?: GegevensActionData | InloggenActionData;
    details: AskDetails;
    issues: Partial<Record<AskField, string[]>>;
    askForCode: boolean;
		activeMode: ActiveMode;
    previousUrl?: string;
		capjsSiteKey?: string;
		setActiveMode: (mode: ActiveMode) => void;
    handleSubmit: (event: SubmitEvent & { currentTarget: EventTarget & HTMLFormElement}) => {};
  }

  let {
		identifyMode,
    user,
    form,
    details = $bindable(),
    issues,
    askForCode,
		activeMode,
    previousUrl,
		capjsSiteKey,
		setActiveMode,
    handleSubmit
  }: Props = $props();

	onMount(() => {
	})
</script>

{#if user}
<div class="grid gap-6">
	<Register
		{identifyMode}
		{user}
		bind:details={details}
		{issues}
		{previousUrl}
		formError={form?.error}
		formType="missingName"
		{handleSubmit}
	/>
</div>
{#if form?.error}
	<p class="mb-4 text-sm text-osf-shocking-pink">{form.error}</p>
{/if}
{:else}
	{#if activeMode == 'login'}
		<div>
			<h1 class="mb-4 font-serif text-2xl">Inloggen</h1>
			{#if askForCode}
				<AskForCode
					bind:details={details}
					issues={issues}
					{previousUrl}
					formError={form?.error}
					{handleSubmit}
				/>
			{:else}
				<Login
					{identifyMode}
					bind:details={details}
					{issues}
					{previousUrl}
					formError={form?.error}
					{setActiveMode}
					{handleSubmit}
				/>
			{/if}
		</div>
	{/if}
	{#if activeMode == 'registering'}
		<div>
			<h1 class="mb-4 font-serif text-2xl">Aanmelden</h1>
			<Register
				{identifyMode}
				{user}
				bind:details={details}
				{issues}
				{previousUrl}
				formError={form?.error}
				{capjsSiteKey}
				formType="newUser"
				{setActiveMode}
				{handleSubmit}
			/>
		</div>
	{/if}
{/if}
