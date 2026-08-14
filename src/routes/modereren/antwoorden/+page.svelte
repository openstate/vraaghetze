<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import Avatar from '$lib/components/avatar.svelte';
	import Button from '$lib/components/button.svelte';
	import { formatDateLong } from '$lib/date-time';

	let { data, form } = $props();
</script>

{#if form?.error}
	<p class="mb-4 text-sm text-osf-shocking-pink">{form.error}</p>
{/if}

{#if data.queue.length === 0}
	<p class="text-osf-canvas-500">Geen antwoorden in de wachtrij.</p>
{:else}
	<ul class="grid gap-3">
		{#each data.queue as answer (answer.id)}
			<li>
				<article class="overflow-hidden rounded bg-osf-canvas-100">
					<div class="p-5">
						<p class="mb-3 text-sm text-osf-canvas-600">
							Vraag van {answer.authorName} op {formatDateLong(answer.questionCreatedAt)}
						</p>

						<a
							href={resolve('/vragen/[slug]', { slug: answer.questionSlug })}
							class="block font-serif text-xl/snug hover:underline"
						>
							{answer.questionTitle}
						</a>

						{#if answer.questionBody}
							<p class="mt-2 whitespace-pre-wrap text-osf-canvas-500">
								{answer.questionBody}
							</p>
						{/if}
					</div>

					<hr class="mx-5 border-osf-canvas-200" />

					<div class="p-5">
						<p class="whitespace-pre-wrap">{answer.body}</p>

						<div class="mt-4 flex items-center gap-3">
							<a
								href={resolve('/politici/[slug]', { slug: answer.politicianSlug })}
								class="shrink-0"
								aria-hidden="true"
								tabindex="-1"
							>
								<Avatar
									size={40}
									name={answer.politicianName}
									src={resolve('/politici/[slug]/foto', { slug: answer.politicianSlug })}
								/>
							</a>
							<p class="text-sm text-osf-canvas-600">
								Antwoord van
								<a
									href={resolve('/politici/[slug]', { slug: answer.politicianSlug })}
									class="hover:underline"
									>{answer.politicianName}
									{#if answer.fraction ?? answer.fractionName}({answer.fraction ??
											answer.fractionName}){/if}</a
								>
								op {formatDateLong(answer.createdAt)}
							</p>
						</div>
					</div>

					<hr class="mx-5 border-osf-canvas-200" />

					<form method="POST" use:enhance class="flex flex-wrap gap-2 p-5">
						<input type="hidden" name="answerId" value={answer.id} />

						<Button type="submit" name="action" value="approved" variant="primary">
							Keur goed
						</Button>
						<Button type="submit" name="action" value="rejected" variant="secondary">Negeer</Button>
					</form>
				</article>
			</li>
		{/each}
	</ul>
{/if}
