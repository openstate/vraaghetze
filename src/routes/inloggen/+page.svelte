<script lang="ts">
	import Page from '$lib/components/page.svelte';
	import RegisterOrLogin from '$lib/components/register-or-login.svelte';
	import {
		activeModeForFormType,
		clearDetails,
		DEFAULT_ASK_DETAILS,
		readDetails,
		writeDetails,
		type ActiveMode,
		type AskDetails
	} from '$lib/ask.js';
	import { onMount } from 'svelte';

	let { data, form } = $props();

	$effect(() => {
		if (form?.initializeNewUser) {
			clearDetails();
		} else if (form?.sent || data.user) {
			clearDetails();
		}
	});

	let details = $state<AskDetails>({ ...DEFAULT_ASK_DETAILS });
	let issues = $derived(form?.issues || {});
	let askForCode = false;
	let formTypeFromForm = $derived(form?.formType ?? 'userLogin');
	let activeMode = $derived(activeModeForFormType(formTypeFromForm));
	const setActiveMode = (mode: ActiveMode) => {
		activeMode = mode;
	};

	const handleSubmit = async (
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		event: SubmitEvent & { currentTarget: EventTarget & HTMLFormElement }
	) => {
		persist();
	};

	onMount(() => {
		details = readDetails();
	});

	const persist = () => writeDetails(details);
</script>

<Page>
	<h1 class="mb-8 font-serif text-4xl">Aanmelden of inloggen</h1>
	{#if data.user}
		<p class="mb-6 text-osf-canvas-600">
			Je bent ingelogd als <strong>{data.user.email}</strong>.
		</p>
	{:else if form?.sent && form?.formType == 'userLogin'}
		<p class="text-osf-canvas-600">
			Als je bij ons een account hebt is er een inloglink naar je e-mailadres gestuurd. Klik erop om
			in te loggen.
		</p>
	{:else if form?.sent && form?.formType == 'newUser'}
		<p class="text-osf-canvas-600">
			Registratie geslaagd! Er is een inloglink naar je e-mailadres gestuurd. Klik erop om in te
			loggen.
		</p>
	{:else if form?.error}
		<p class="mb-4 text-sm text-osf-shocking-pink">{form.error}</p>
	{:else}
		<RegisterOrLogin
			identifyMode="login"
			user={data.user}
			{form}
			bind:details
			{issues}
			{askForCode}
			{activeMode}
			capjsSiteKey={data.capjsSiteKey}
			{setActiveMode}
			{handleSubmit}
		/>
	{/if}
</Page>
