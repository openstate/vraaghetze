<script lang="ts">
	import { page } from '$app/state';
	import { ASK_STEPS, draftFromUrl, stepHref, stepIsAhead } from '$lib/ask';
	import Page from '$lib/components/page.svelte';

	let { data, children } = $props();

	const draft = $derived(draftFromUrl(page.url));

	// a signed-in asker has no personal details left to fill in
	const steps = $derived(
		data.user ? ASK_STEPS.filter((step) => step.id !== 'gegevens') : ASK_STEPS
	);

	// the step is the folder it lives in, /vragen/stellen/<id>
	const currentStep = $derived(page.url.pathname.split('/')[3] ?? '');
	const currentIndex = $derived(
		Math.max(
			steps.findIndex((step) => step.id === currentStep),
			0
		)
	);

	// the mail an anonymous asker has to confirm, sent by the action on the last step
	const sentEmail = $derived(page.form && 'email' in page.form ? String(page.form.email) : null);
</script>

<Page>
	{#if sentEmail}
		<h1 class="mb-4 font-serif text-4xl">Bijna klaar!</h1>
		<p class="text-osf-canvas-600">
			We hebben een link naar <strong>{sentEmail}</strong> gestuurd. Klik erop om je vraag te bevestigen
			en te bekijken.
		</p>
	{:else if !data.mayAsk}
		<h1 class="mb-4 font-serif text-4xl">Stel een vraag</h1>
		<p class="text-osf-canvas-600">Met dit account kun je geen vragen stellen.</p>
	{:else}
		<nav aria-label="Voortgang" class="mb-8">
			<ol class="flex flex-wrap items-center gap-y-2">
				{#each steps as step, index (step.id)}
					{@const ahead = stepIsAhead(step.id, draft)}
					<li class="flex items-center">
						{#if index > 0}
							<span
								aria-hidden="true"
								class="mx-1 iconify size-4 text-osf-canvas-400 mdi--chevron-right"
							></span>
						{/if}

						<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
						<svelte:element
							this={ahead ? 'span' : 'a'}
							href={ahead ? undefined : stepHref(step.id, draft)}
							aria-current={index === currentIndex ? 'step' : undefined}
							class={[
								'flex items-center gap-2 rounded p-1 text-sm',
								ahead ? 'text-osf-canvas-400' : 'hover:underline',
								index !== currentIndex && !ahead && 'text-osf-canvas-600'
							]}
						>
							<span
								aria-hidden="true"
								class={[
									'flex size-6 shrink-0 items-center justify-center rounded-full font-mono text-xs',
									index === currentIndex
										? 'bg-osf-violet-900 text-osf-canvas-50'
										: index < currentIndex
											? 'bg-osf-violet-100 text-osf-violet-700'
											: 'bg-osf-canvas-100 text-osf-canvas-500'
								]}
							>
								{#if index < currentIndex}
									<span class="iconify size-3.5 mdi--check"></span>
								{:else}
									{index + 1}
								{/if}
							</span>

							<span class="max-sm:sr-only">{step.title}</span>
						</svelte:element>
					</li>
				{/each}
			</ol>
		</nav>

		{@render children()}
	{/if}
</Page>
