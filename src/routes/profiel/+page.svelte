<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { authClient } from '$lib/auth-client';
	import Button from '$lib/components/button.svelte';
	import Page from '$lib/components/page.svelte';
	import QuestionCard from '$lib/components/question-card.svelte';

	let { data } = $props();
	const questions = $derived(data.questions);
	const followed = $derived(data.followed);

	async function signOut() {
		const { error } = await authClient.signOut();
		if (error) console.error(error);
		await invalidateAll();
		await goto(resolve('/inloggen'));
	}
</script>

<Page>
	<div class="mb-8 flex flex-wrap items-center justify-between gap-4">
		<h1 class="font-serif text-4xl">Jouw vragen</h1>
		<Button onclick={signOut} variant="secondary">Uitloggen</Button>
	</div>

	{#if questions.length === 0}
		<p class="mb-6 text-osf-canvas-500">Je hebt nog geen vragen gesteld.</p>

		<Button href={resolve('/vragen/stellen')} variant="primary" icon="mdi--arrow-right">
			Stel een vraag
		</Button>
	{:else}
		<!-- TODO: unverified questions are still indistinguishable from verified ones,
		 		 once a design exists reselect verifiedAt in questions.listForUser and mark them -->
		<ul class="grid gap-4">
			{#each questions as question (question.slug)}
				<li>
					<QuestionCard {question} />
				</li>
			{/each}
		</ul>
	{/if}

	<h2 class="mt-12 mb-8 font-serif text-3xl">Vragen die je volgt</h2>

	{#if followed.length === 0}
		<p class="mb-6 text-osf-canvas-500">Je volgt nog geen vragen.</p>

		<Button href={resolve('/vragen')} variant="secondary" icon="mdi--arrow-right">
			Bekijk alle vragen
		</Button>
	{:else}
		<ul class="grid gap-4">
			{#each followed as question (question.slug)}
				<li>
					<QuestionCard {question} />
				</li>
			{/each}
		</ul>
	{/if}
</Page>
