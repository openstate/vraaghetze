<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import Avatar from '$lib/components/avatar.svelte';
	import Button from '$lib/components/button.svelte';
	import FollowButton from '$lib/components/follow-button.svelte';
	import LinkCard from '$lib/components/link-card.svelte';
	import Page from '$lib/components/page.svelte';
	import QuestionCard from '$lib/components/question-card.svelte';
	import { formatDateLong } from '$lib/date-time';

	let { data } = $props();

	const fractionLabel = $derived(data.question.fraction ?? data.question.fractionName);

	const politicianHref = $derived(
		resolve('/politici/[slug]', { slug: data.question.assigneeSlug })
	);

	const canFollow = $derived(!data.question.isAsker && (!data.answer || data.isFollowing));
</script>

<Page width="wide">
	<h1 class="mb-8 font-serif text-4xl">Vraag &amp; Antwoord</h1>

	{#if data.banner}
		<div class="mb-8 grid gap-3 rounded border border-osf-violet-800 bg-osf-violet-100 p-5">
			<p class="text-osf-violet-800">
				{#if data.banner === 'needs-confirm'}
					Heb jij deze vraag gesteld? Bevestig dat onderstaande vraag van jou is, dan kan een
					moderator hem beoordelen.
				{:else if data.banner === 'verified'}
					Je vraag is bevestigd en wacht nu op moderatie.
				{:else if data.banner === 'follow' && data.question.isAsker}
					Je hebt deze vraag zelf gesteld, dus je krijgt automatisch bericht zodra hij beantwoord
					is.
				{:else if data.banner === 'follow' && data.answer}
					Deze vraag is inmiddels beantwoord. Je leest het antwoord hieronder.
				{:else if data.banner === 'follow'}
					Je e-mailadres is bevestigd. Klik nogmaals op de bel om een mail te krijgen zodra deze
					vraag beantwoord is.
				{/if}
			</p>

			{#if data.banner === 'needs-confirm'}
				<form method="POST" action="?/bevestigen" use:enhance class="flex flex-wrap gap-2">
					<Button type="submit" name="keuze" value="ja" variant="primary">Ja, dit was ik</Button>
					<Button type="submit" name="keuze" value="nee" variant="primary">Nee</Button>
				</form>
			{/if}
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
				{#if data.answer}
					<p class="mb-6 whitespace-pre-wrap">{data.answer.body}</p>
				{/if}

				{#snippet assignee()}
					<a href={politicianHref} class="font-medium hover:underline">
						{data.question.assigneeName}
						{#if fractionLabel}({fractionLabel}){/if}
					</a>
				{/snippet}

				<div class="flex flex-wrap items-center justify-between gap-4">
					<div class="flex min-w-0 flex-1 items-center gap-3 max-sm:basis-full">
						<a href={politicianHref} class="shrink-0" aria-hidden="true" tabindex="-1">
							<Avatar
								size={40}
								name={data.question.assigneeName}
								src={resolve('/politici/[slug]/foto', { slug: data.question.assigneeSlug })}
							/>
						</a>

						<p class="text-balance text-osf-canvas-600">
							{#if data.banner === 'needs-confirm'}
								Deze vraag aan {@render assignee()} gaat pas naar moderatie als je hierboven bevestigt
								dat hij van jou is.
							{:else if data.question.status === 'pending'}
								Deze vraag aan {@render assignee()} wacht op moderatie en is nog niet openbaar
							{:else if data.question.status === 'rejected'}
								Deze vraag aan {@render assignee()} is afgewezen door de moderatoren en wordt niet beantwoord
							{:else if data.answer}
								Antwoord van {@render assignee()} op {formatDateLong(data.answer.createdAt)}
							{:else}
								Wacht op antwoord van {@render assignee()}
							{/if}
						</p>
					</div>

					{#if data.question.status === 'approved'}
						<div class="max-sm:ml-auto">
							<FollowButton
								followers={data.followers}
								isFollowing={data.isFollowing}
								isSignedIn={!!data.user}
								{canFollow}
							/>
						</div>
					{/if}
				</div>

				{#if data.answer?.status === 'pending'}
					<p class="mt-5 text-sm text-osf-canvas-500">
						Dit antwoord wacht op moderatie en is nog niet openbaar.
					</p>
				{/if}
			</div>
		</article>

		<aside class="@container grid lg:sticky lg:top-6 lg:col-start-2 lg:row-span-2 lg:row-start-1">
			<div class="grid gap-4 @lg:grid-cols-2">
				<LinkCard href="{resolve('/vragen/stellen')}?aan={data.question.assigneeSlug}">
					Stel {data.question.isAsker ? 'nog een' : 'ook een'} vraag aan {data.question
						.assigneeName}
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
