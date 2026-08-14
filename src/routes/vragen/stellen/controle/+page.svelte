<script lang="ts">
	import { onMount } from 'svelte';
	import { enhance } from '$app/forms';
	import { replaceState } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import {
		ASK_STEPS,
		clearDetails,
		draftFromUrl,
		readDetails,
		stepHref,
		type AskDetails,
		type AskIssues
	} from '$lib/ask';
	import Avatar from '$lib/components/avatar.svelte';
	import Button from '$lib/components/button.svelte';
	import { formatDateLong } from '$lib/date-time';
	import type { SubmitFunction } from './$types';

	let { data, form } = $props();

	let details = $state<AskDetails>({ name: '', email: '' });

	// we don't store personal details in the url, but in sessionStorage, so we prefill seperately
	onMount(() => {
		details = readDetails();
	});

	// a signed-in asker never filled the details step in, we use their account info instead
	const sender = $derived(data.user ?? details);
	const previousStep = $derived(data.user ? 'vraag' : 'gegevens');

	const draft = $derived(draftFromUrl(page.url));

	const issues = $derived<AskIssues>((form && 'issues' in form && form.issues) || {});
	const errorMessage = $derived(form && 'error' in form ? form.error : null);

	const fractionLabel = $derived(data.politician?.fraction ?? data.politician?.fractionName);

	const similarIntro = $derived(
		data.similar.length === 1
			? 'Deze eerdere vraag lijkt op die van jou. Helpt die je niet verder? Verstuur dan gerust je eigen vraag hieronder.'
			: 'Deze eerdere vragen lijken op die van jou. Helpen ze je niet verder? Verstuur dan gerust je eigen vraag hieronder.'
	);

	// the step owning a field the server refused, to send the asker back to
	const refusedStep = $derived(
		ASK_STEPS.find((step) => step.fields.some((field) => issues[field]))
	);

	const submitAsk: SubmitFunction = () => {
		return async ({ result, update }) => {
			await update({ reset: false });

			if (result.type === 'success') {
				clearDetails();
				replaceState(resolve('/vragen/stellen/controle'), {});
			}
		};
	};
</script>

{#snippet changeStep(stepId: string, label: string)}
	{@const href = stepHref(stepId, draft)}
	<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
	<a {href} class="text-sm font-medium text-osf-violet-500 hover:underline">
		{label}
	</a>
{/snippet}

<h1 class="mb-6 font-serif text-4xl">Verstuur je vraag</h1>

<!-- outside the form and above the rule, it is reading material next to the step, not part of it -->
{#if data.similar.length > 0}
	<section aria-label="Gerelateerde vragen" class="mb-10">
		<p class="text-osf-canvas-600">{similarIntro}</p>

		<ul class="mt-8 grid gap-4">
			{#each data.similar as question (question.slug)}
				{@const questionHref = resolve('/vragen/[slug]', { slug: question.slug })}
				{@const politicianHref = resolve('/politici/[slug]', { slug: question.politicianSlug })}
				{@const questionFraction = question.fraction ?? question.fractionName}
				<li class="grid gap-3 rounded bg-osf-canvas-100 p-6">
					<a href={questionHref} class="font-serif text-lg/snug hover:underline">
						{question.title}
					</a>

					<div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
						<p class="text-sm text-osf-canvas-600">
							<!-- matches if the politician answered, the same wording the question cards use -->
							{#if question.answer}
								Antwoord van
							{:else}
								Wacht op antwoord van
							{/if}
							<a href={politicianHref} class="font-medium hover:underline">
								{question.politicianName}
								{#if questionFraction}({questionFraction}){/if}
							</a>
							{#if question.answer}op {formatDateLong(question.answer.createdAt)}{/if}
						</p>

						<!-- the title above links to the same page, so this is no second stop for the keyboard -->
						<a
							href={questionHref}
							tabindex="-1"
							class="flex items-center gap-1 text-sm font-medium text-osf-violet-500 hover:underline"
						>
							Lees meer <span class="iconify size-4 mdi--arrow-right"></span>
						</a>
					</div>
				</li>
			{/each}
		</ul>
	</section>
{/if}

<form method="POST" use:enhance={submitAsk} novalidate class="grid gap-6">
	{#if errorMessage}
		<p role="alert" class="text-sm text-osf-shocking-pink">{errorMessage}</p>
	{/if}

	<p class="mb-2 text-osf-canvas-600">
		Controleer of je vraag, het Kamerlid en je gegevens kloppen, en verstuur dan je vraag.
	</p>

	<dl class="grid gap-5 rounded bg-osf-canvas-100 p-6">
		<div class="grid gap-2">
			<dt class="flex flex-wrap items-baseline justify-between gap-x-4">
				<span class="text-sm font-medium text-osf-canvas-600">Je vraag</span>
				{@render changeStep('vraag', 'Pas vraag aan')}
			</dt>
			<dd class="grid gap-2">
				<p class="font-serif text-xl/snug">{draft.vraag}</p>
				{#if draft.context}
					<p class="whitespace-pre-wrap text-osf-canvas-600">{draft.context}</p>
				{/if}
			</dd>
		</div>

		<div class="grid gap-2">
			<dt class="flex flex-wrap items-baseline justify-between gap-x-4">
				<span class="text-sm font-medium text-osf-canvas-600">Aan</span>
				{@render changeStep('kamerlid', 'Pas Kamerlid aan')}
			</dt>
			<dd class="flex items-center gap-3">
				{#if data.politician}
					<Avatar
						size={40}
						name={data.politician.name}
						src={resolve('/politici/[slug]/foto', { slug: data.politician.slug })}
					/>
					<span>
						{data.politician.name}
						{#if fractionLabel}({fractionLabel}){/if}
					</span>
				{/if}
			</dd>
		</div>

		<div class="grid gap-2">
			<dt class="flex flex-wrap items-baseline justify-between gap-x-4">
				<span class="text-sm font-medium text-osf-canvas-600">Van</span>
				<!-- a signed-in asker fills in no details step, so there is none to send them back to -->
				{#if !data.user}
					{@render changeStep('gegevens', 'Pas gegevens aan')}
				{/if}
			</dt>
			<dd>
				{#if sender.name || sender.email}
					{sender.name} &middot; {sender.email}
				{:else}
					<span class="text-osf-canvas-500">Nog geen gegevens ingevuld.</span>
				{/if}
			</dd>
		</div>
	</dl>

	<input type="hidden" name="name" value={sender.name} />
	<input type="hidden" name="email" value={sender.email} />

	{#if refusedStep}
		<div role="alert" class="grid gap-1 text-sm text-osf-shocking-pink">
			{#each refusedStep.fields as field (field)}
				{@const messages = issues[field]}
				{#if messages}<p>{messages[0]}</p>{/if}
			{/each}

			<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
			<a href={stepHref(refusedStep.id, draft)} class="font-medium hover:underline">
				Ga terug naar {refusedStep.title}
			</a>
		</div>
	{/if}

	<input type="hidden" name="politicianId" value={data.politician?.id ?? ''} />
	<input type="hidden" name="title" value={draft.vraag} />
	<input type="hidden" name="body" value={draft.context} />

	<div class="mt-2 flex flex-wrap items-center justify-end gap-3">
		<Button variant="secondary" class="mr-auto" href={stepHref(previousStep, draft)}>Vorige</Button>
		<Button type="submit" variant="primary" icon="mdi--arrow-right">Verstuur vraag</Button>
	</div>
</form>
