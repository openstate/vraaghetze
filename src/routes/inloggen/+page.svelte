<script lang="ts">
	import { page } from '$app/state';
	import { authClient } from '$lib/auth-client';
	import Page from '$lib/components/page.svelte';
	import RegisterOrLogin from '$lib/components/register-or-login.svelte'
	import { activeModeForFormType, clearDetails, DEFAULT_ASK_DETAILS, readDetails, writeDetails, type ActiveMode, type AskDetails, type AskFormType } from '$lib/ask.js';
	import { onMount } from 'svelte';

	let { data, form } = $props();

	$effect(() => {
		if (form?.initializeNewUser) {
			clearDetails();
		} else if (sent || form?.sent || data.user) {
			clearDetails();
		}
	});

	let details = $state<AskDetails>({ ...DEFAULT_ASK_DETAILS });
	let issues = $derived(form?.issues || {});
	let askForCode = false;
	let sent = $state(false);
	let formTypeFromForm = $derived(form?.formType);
	let activeMode = $derived(activeModeForFormType(formTypeFromForm));
	const setActiveMode = (mode: ActiveMode) => { activeMode = mode }

	const handleSubmit = async (event: SubmitEvent & { currentTarget: EventTarget & HTMLFormElement}) => {
		const currentTarget = event.currentTarget as HTMLFormElement;
		const submitter = event.submitter;

		const formData = new FormData(currentTarget, submitter);
		console.info(formData);
		const formType = formData.get('formType') as AskFormType;
		console.info("NOW HERE: " + formType);
		persist();

		if (formType == 'userLogin') {
			event.preventDefault();
			if (form) form.error = '';

			const { error } = await authClient.signIn.magicLink({
				email: details.emailExisting,
				callbackURL: `${page.url.origin}/mijn-vragen`
			});

			if (error) {
				issues = {...issues, emailExisting: ["E-mailadres is niet geldig"]}
			} else {
				sent = true;
			}
		}
	}

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
	{:else if sent}
		<p class="text-osf-canvas-600">
			Als je bij ons een account hebt is er een inloglink naar je e-mailadres gestuurd. Klik erop om in te loggen.
		</p>
	{:else if form?.sent}
		<p class="text-osf-canvas-600">
			Registratie geslaagd! Er is een inloglink naar je e-mailadres gestuurd. Klik erop om in te loggen.
		</p>
	{:else}
		<RegisterOrLogin
			identifyMode="login"
			user={data.user}
			{form}
			bind:details={details}
			{issues}
			{askForCode}
			{activeMode}
			capjsSiteKey={data.capjsSiteKey}
			{setActiveMode}
			{handleSubmit}
		/>
	{/if}
</Page>
