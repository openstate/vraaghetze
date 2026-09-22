<script lang="ts">
	import { page } from '$app/state';
	import { authClient } from '$lib/auth-client';
	import Page from '$lib/components/page.svelte';
	import RegisterOrLogin from '$lib/components/register-or-login.svelte'
	import { clearDetails, deducedFormType, DEFAULT_ASK_DETAILS, loginFormActive, newUserFormActive, readDetails, writeDetails, type AskDetails, type AskFormType } from '$lib/ask.js';
	import { onMount } from 'svelte';

	let { data, form } = $props();

	let details = $state<AskDetails>({ ...DEFAULT_ASK_DETAILS });
	$effect(() => {
		if (form?.initializeNewUser) {
			details.name = '';
			details.email = '';
			form.initializeNewUser = false;
		} else if (sent || form?.sent || data.user) {
			clearDetails();
		}
	});
	let issues = $derived(form?.issues || {});
	let formType = $derived(details.formType ?? 'newUser') as AskFormType;
	let askForCode = false;
	let newUserActive = $derived(newUserFormActive(details, data.user));
	let loginActive = $derived(newUserActive ? false : loginFormActive(details));
	let sent = $state(false);

	const handleSubmit = async (event: SubmitEvent & { currentTarget: EventTarget & HTMLFormElement}) => {
		formType = deducedFormType(details, askForCode, data.user);
		details = { ...details, formType: formType};
		persist();

		if (formType == 'userLogin') {
			event.preventDefault();
			if (form) form.error = '';

			const { error } = await authClient.signIn.magicLink({
				email: details.emailExisting,
				callbackURL: `${page.url.origin}/mijn-vragen`
			});

			if (error) {
				issues = {...issues, emailExisting: [error.message ?? '']}
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
	{:else if sent || form?.sent}
		<p class="text-osf-canvas-600">
			Als je bij ons een account hebt is er een inloglink naar je e-mailadres gestuurd. Klik erop om in te loggen.
		</p>
	{:else}
		<RegisterOrLogin
			identifyMode='login'
			{formType}
			user={data.user}
			{form}
			bind:details={details}
			{issues}
			{loginActive}
			{askForCode}
			{newUserActive}
			capjsSiteKey={data.capjsSiteKey}
			{handleSubmit}
		/>
	{/if}
</Page>
