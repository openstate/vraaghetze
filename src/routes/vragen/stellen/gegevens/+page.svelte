<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import {
		activeModeForFormType,
		clearDetails,
		DEFAULT_ASK_DETAILS,
		draftFromUrl,
		readDetails,
		stepHref,
		writeDetails,
		type ActiveMode,
		type AskDetails,
		type AskFormType
	} from '$lib/ask';
	import RegisterOrLogin from '$lib/components/register-or-login.svelte';

	let { data, form } = $props();

	$effect(() => {
		if (form?.initializeNewUser) {
			clearDetails();
		}
	});

	let details = $state<AskDetails>({ ...DEFAULT_ASK_DETAILS });
	let issues = $derived(form?.issues || {});
	let askForCode = $derived(form?.askForCode ?? false);
	let formTypeFromForm = $derived(form?.formType ?? 'newUser');
	let activeMode = $derived(activeModeForFormType(formTypeFromForm, !!data.changing));
	const setActiveMode = (mode: ActiveMode) => {
		activeMode = mode;
	};

	const draft = $derived({ ...draftFromUrl(page.url), aan: data.politician?.slug ?? '' });

	// we don't store personal details in the url, but in sessionStorage, so we prefill seperately
	onMount(() => {
		details = readDetails();
	});

	const persist = () => writeDetails(details);

	const handleSubmit = async (
		event: SubmitEvent & { currentTarget: EventTarget & HTMLFormElement }
	) => {
		const currentTarget = event.currentTarget as HTMLFormElement;
		const submitter = event.submitter;

		const formData = new FormData(currentTarget, submitter);
		const formType = formData.get('formType') as AskFormType;
		if (formType != 'codeFromEmail') {
			persist();
		}
	};
</script>

<h1 class="mb-6 font-serif text-4xl">Vul je gegevens in</h1>

<RegisterOrLogin
	identifyMode="asking_question"
	user={data.user}
	{form}
	bind:details
	{issues}
	{askForCode}
	{activeMode}
	previousUrl={stepHref('vraag', draft)}
	{setActiveMode}
	{handleSubmit}
/>
