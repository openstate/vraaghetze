<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import Avatar from '$lib/components/avatar.svelte';
	import Button from '$lib/components/button.svelte';
	import { formatDateLong } from '$lib/date-time';

	let { data, form } = $props();

	const inputClass =
		'rounded border bg-white border-osf-canvas-200 px-3 py-2 focus:border-osf-violet-500 focus:outline-none';
</script>

{#if form?.error}
	<p class="mb-4 text-sm text-osf-shocking-pink">{form.error}</p>
{/if}

{#if data.queue.length === 0}
	<p class="text-osf-canvas-500">Geen vragen in de wachtrij.</p>
{:else}
	<ul class="grid gap-3">
		{#each data.queue as question (question.id)}
			<li>
				<article class="overflow-hidden rounded bg-osf-canvas-100">
					<div class="p-5">
						<p class="text-sm text-osf-canvas-600">
							Vraag van {question.authorName} op {formatDateLong(question.createdAt)}
						</p>

						<p class="mt-3 font-serif text-xl/snug">{question.title}</p>

						<p class="mt-2 text-sm whitespace-pre-wrap text-osf-canvas-500">{question.body}</p>

						<div class="mt-4 flex items-center gap-3">
							<a
								href={resolve('/politici/[slug]', { slug: question.politicianSlug })}
								class="shrink-0"
								aria-hidden="true"
								tabindex="-1"
							>
								<Avatar
									size={40}
									name={question.politicianName}
									src={resolve('/politici/[slug]/foto', { slug: question.politicianSlug })}
								/>
							</a>
							<p class="text-sm text-osf-canvas-600">
								Gesteld aan
								<a
									href={resolve('/politici/[slug]', { slug: question.politicianSlug })}
									class="hover:underline"
									>{question.politicianName}
									{#if question.fraction ?? question.fractionName}({question.fraction ??
											question.fractionName}){/if}</a
								>
							</p>
						</div>
					</div>

					<hr class="mx-5 border-osf-canvas-200" />

					<form method="POST" use:enhance class="grid gap-4 p-5">
						<input type="hidden" name="questionId" value={question.id} />

						<label class="grid gap-1.5">
							<span class="text-sm font-medium">Interne notitie (optioneel)</span>
							<textarea name="note" rows="2" class={inputClass}></textarea>
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
				</article>
			</li>
		{/each}
	</ul>
{/if}
