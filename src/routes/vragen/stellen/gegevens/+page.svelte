<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import {
		deducedFormType,
		DEFAULT_ASK_DETAILS,
		draftFromUrl,
		loginFormActive,
		newUserFormActive,
		readDetails,
		stepHref,
		writeDetails,
		type AskDetails,
		type AskFormType,
	} from '$lib/ask';
	import Button from '$lib/components/button.svelte';
	import Register from '$lib/components/register.svelte';
	import Login from '$lib/components/login.svelte';
	import AskForCode from '$lib/components/ask-for-code.svelte';
	import { authClient } from '$lib/auth-client.js';
	import { submitDirectly } from '$lib/general.js';

	let { data, form } = $props();

	let details = $state<AskDetails>({ ...DEFAULT_ASK_DETAILS });
	$effect(() => {
		if (form?.initializeNewUser) {
			details.name = '';
			details.email = '';
		}
	});
	let issues = $derived(form?.issues || {});
	let formType = $derived(details.formType ?? 'newUser') as AskFormType;
	let askForCode = $derived(form?.askForCode || formType == 'codeFromEmail');
	let newUserActive = $derived(newUserFormActive(details, data.user));
	let loginActive = $derived(newUserActive ? false : loginFormActive(details));

	const draft = $derived({ ...draftFromUrl(page.url), aan: data.politician?.slug ?? '' });

	// we don't store personal details in the url, but in sessionStorage, so we prefill seperately
	onMount(() => {
		details = readDetails();
	});

	const persist = () => writeDetails(details);

	const handleSubmit = async (event: SubmitEvent & { currentTarget: EventTarget & HTMLFormElement}) => {
		const currentTarget = event.currentTarget as HTMLFormElement;
		const submitter = event.submitter;

		formType = deducedFormType(details, askForCode, data.user);
		if (formType != 'codeFromEmail') {
			details = { ...details, formType: formType};
			persist();
		}

		if (formType == 'userLogin') {
			event.preventDefault();
			if (form) form.error = '';

			const { error } = await authClient.signIn.magicLink({
				email: details.emailExisting,
				metadata: { sendCode: true }
			});

			if (error) {
				issues = {...issues, emailExisting: [error.message ?? '']}
			} else {
				submitDirectly(currentTarget, submitter, { formType: formType ?? '' });
			}
		}
	}
</script>
<h1 class="mb-6 font-serif text-4xl">Vul je gegevens in</h1>

<form
	method="POST"
	novalidate
	class="grid gap-6"
	onsubmit={handleSubmit}
>
	<input type="hidden" name="formType" value={formType} />

	{#if data.user}
	<div class="grid gap-6">
		<Register
			user={data.user}
			bind:details={details}
			issues={issues}
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
				user={data.user}
				bind:details={details}
				issues={issues}
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
					bind:details={details}
					issues={issues}
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
		<Button variant="secondary" class="mr-auto" href={stepHref('vraag', draft)}>Vorige</Button>
		<Button type="submit" variant="primary" icon="mdi--arrow-right">Volgende</Button>
</div>
</form>
