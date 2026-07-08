<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$lib/components/button.svelte';
	import Page from '$lib/components/page.svelte';
	import QuestionCard from '$lib/components/question-card.svelte';

	let { data, form } = $props();

	const inputClass =
		'rounded border border-osf-canvas-200 px-3 py-2 focus:border-osf-violet-500 focus:outline-none';
</script>

<Page>
	<h1 class="mb-8 font-serif text-4xl font-[450]">Moderatie</h1>

	{#if form?.error}
		<p class="mb-4 text-sm text-osf-shocking-pink">{form.error}</p>
	{/if}

	{#if data.queue.length === 0}
		<p class="text-osf-canvas-500">Geen vragen in de wachtrij.</p>
	{:else}
		<ul class="grid gap-3">
			{#each data.queue as question (question.id)}
				<li>
					<QuestionCard {question} link={false}>
						<form method="POST" use:enhance class="grid gap-4">
							<input type="hidden" name="questionId" value={question.id} />

							<label class="grid gap-1.5">
								<span class="text-sm font-medium">Interne notitie (optioneel)</span>
								<textarea name="note" rows="3" class={inputClass}></textarea>
							</label>

							<div class="flex flex-wrap gap-2">
								<Button type="submit" name="action" value="approved" variant="primary">
									Keur goed
								</Button>
								<Button type="submit" name="action" value="rejected" variant="secondary">
									Wijs af
								</Button>
							</div>
						</form>
					</QuestionCard>
				</li>
			{/each}
		</ul>
	{/if}
</Page>
