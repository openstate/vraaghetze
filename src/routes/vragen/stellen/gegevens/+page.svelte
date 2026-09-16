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
	import { authClient } from '$lib/auth-client.js';
	import { submitDirectly } from '$lib/general.js';
	import RegisterOrLogin from '$lib/components/register-or-login.svelte'

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

<RegisterOrLogin
	identifyMode='asking_question'
	{formType}
	user={data.user}
	{form}
	{details}
	{issues}
	{loginActive}
	{askForCode}
	{newUserActive}
	previousUrl={stepHref('vraag', draft)}
	{handleSubmit}
/>
