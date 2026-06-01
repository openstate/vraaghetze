<script lang="ts">
	import Button from '$lib/components/button.svelte';
	import Page from '$lib/components/page.svelte';
	import QuestionCard from '$lib/components/question-card.svelte';

	let { data } = $props();
</script>

<Page>
	<div class="mb-8 flex flex-wrap items-center justify-between gap-4">
		<h1 class="font-serif text-4xl font-[450]">Vragen & Antwoorden</h1>
		<Button href="/vragen/stellen" variant="primary" icon="mdi--arrow-right">Stel een vraag</Button>
	</div>

	{#if data.questions.length === 0}
		<p class="text-osf-canvas-500">Er zijn nog geen vragen gesteld.</p>
	{:else}
		<ul class="grid gap-3">
			{#each data.questions as question (question.slug)}
				<li>
					<QuestionCard {question} />
				</li>
			{/each}
		</ul>
	{/if}
</Page>
