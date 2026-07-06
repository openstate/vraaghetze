<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { authClient } from '$lib/auth-client';
	import Button from '$lib/components/button.svelte';
	import Page from '$lib/components/page.svelte';
	import QuestionCard from '$lib/components/question-card.svelte';

	let { data } = $props();
	const questions = $derived(data.questions);

	async function signOut() {
		const { error } = await authClient.signOut();
		if (error) console.error(error);
		await invalidateAll();
		await goto(resolve('/inloggen'));
	}
</script>

<Page>
	<div class="mb-8 flex flex-wrap items-center justify-between gap-4">
		<h1 class="font-serif text-4xl font-[450]">Jouw vragen</h1>
		<Button onclick={signOut} variant="secondary">Uitloggen</Button>
	</div>

	{#if questions.length === 0}
		<p class="text-osf-canvas-500">Je hebt nog geen vragen gesteld.</p>
	{:else}
		<ul class="grid gap-3">
			{#each questions as question (question.slug)}
				<li>
					<QuestionCard {question} statusDisplay="always" showVerification />
				</li>
			{/each}
		</ul>
	{/if}
</Page>
