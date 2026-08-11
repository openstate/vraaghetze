<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import Avatar from '$lib/components/avatar.svelte';
	import Button from '$lib/components/button.svelte';
	import LinkCard from '$lib/components/link-card.svelte';
	import Page from '$lib/components/page.svelte';
	import QuestionCard from '$lib/components/question-card.svelte';
	import { formatDateLong } from '$lib/date-time';

	let { data } = $props();

	const fractionLabel = $derived(data.question.fraction ?? data.question.fractionName);

	const politicianHref = $derived(
		resolve('/politici/[slug]', { slug: data.question.assigneeSlug })
	);
</script>

<Page width="wide">
	<h1 class="mb-8 font-serif text-4xl">Vraag &amp; Antwoord</h1>

	{#if data.banner === 'needs-confirm'}
		<div class="mb-8 grid gap-3 rounded border border-osf-violet-500 bg-osf-violet-50 p-5">
			<p class="text-sm text-osf-canvas-600">
				Heb jij deze vraag gesteld? Bevestig dat <strong>{data.question.title}</strong> van jou is, dan
				kan een moderator hem beoordelen.
			</p>
			<form method="POST" action="?/bevestigen" use:enhance class="flex flex-wrap gap-2">
				<Button type="submit" name="keuze" value="ja" variant="primary">Ja, dit was ik</Button>
				<Button type="submit" name="keuze" value="nee" variant="secondary">
					Nee, dit was ik niet
				</Button>
			</form>
		</div>
	{:else if data.banner === 'verified'}
		<div class="mb-8 rounded border border-osf-violet-500 bg-osf-violet-50 p-5">
			<p class="text-sm text-osf-canvas-600">Je vraag is bevestigd en wacht nu op moderatie.</p>
		</div>
	{/if}

	<div class="grid items-start gap-x-10 gap-y-10 lg:grid-cols-[1fr_17rem]">
		<article class="overflow-hidden rounded bg-osf-canvas-100 lg:col-start-1 lg:row-start-1">
			<div class="p-6 sm:p-8">
				<p class="text-osf-canvas-600">
					Vraag van {data.question.authorName} op {formatDateLong(data.question.createdAt)}
				</p>

				<h2 class="mt-5 font-serif text-2xl/snug">{data.question.title}</h2>

				{#if data.question.body}
					<p class="mt-5 whitespace-pre-wrap">{data.question.body}</p>
				{/if}
			</div>

			<hr class="mx-6 my-3 border-osf-canvas-200 sm:mx-8" />

			<div class="p-6 sm:p-8">
				<!-- only the author gets here while a question is unpublished, so this addresses them -->
				{#if data.question.status === 'pending'}
					<p class="text-osf-canvas-500">Deze vraag wacht op moderatie en is nog niet openbaar.</p>
				{:else if data.question.status === 'rejected'}
					<p class="text-osf-canvas-500">Deze vraag is afgewezen en wordt niet gepubliceerd.</p>
				{:else}
					{#if data.answer}
						<p class="mb-6 whitespace-pre-wrap">{data.answer.body}</p>
					{/if}

					<div class="flex items-center gap-3">
						<a href={politicianHref} class="shrink-0" aria-hidden="true" tabindex="-1">
							<Avatar
								size={40}
								name={data.question.assigneeName}
								src={resolve('/politici/[slug]/foto', { slug: data.question.assigneeSlug })}
							/>
						</a>

						<p class="text-osf-canvas-600">
							{data.answer ? 'Antwoord van' : 'Wacht op antwoord van'}
							<a href={politicianHref} class="font-medium hover:underline">
								{data.question.assigneeName}
								{#if fractionLabel}({fractionLabel}){/if}
							</a>
							{#if data.answer}op {formatDateLong(data.answer.createdAt)}{/if}
						</p>
					</div>

					{#if data.answer?.status === 'pending'}
						<p class="mt-5 text-sm text-osf-canvas-500">
							Dit antwoord wacht op moderatie en is nog niet openbaar.
						</p>
					{/if}
				{/if}
			</div>
		</article>

		<aside class="@container grid lg:sticky lg:top-6 lg:col-start-2 lg:row-span-2 lg:row-start-1">
			<div class="grid gap-4 @lg:grid-cols-2">
				<LinkCard href="{resolve('/vragen/stellen')}?aan={data.question.assigneeSlug}">
					Stel een vraag aan {data.question.assigneeName}
				</LinkCard>

				<LinkCard href={politicianHref} variant="bright">
					Bekijk profiel van {data.question.assigneeName}
				</LinkCard>
			</div>
		</aside>

		{#if data.related.length > 0}
			<section class="mt-8 lg:col-start-1 lg:row-start-2">
				<h2 class="mb-8 font-serif text-3xl">Gerelateerde vragen</h2>

				<ul class="grid gap-4">
					{#each data.related as question (question.slug)}
						<li>
							<QuestionCard {question} />
						</li>
					{/each}
				</ul>
			</section>
		{/if}
	</div>
</Page>
