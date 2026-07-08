<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import Button from '$lib/components/button.svelte';
	import Page from '$lib/components/page.svelte';

	let { data } = $props();

	const statusLabel = {
		pending: 'Wacht op moderatie',
		approved: 'Goedgekeurd',
		rejected: 'Afgewezen'
	};

	const fractionLabel = $derived(data.question.fraction ?? data.question.fractionName);
</script>

<Page>
	{#if data.banner === 'needs-confirm'}
		<div class="mb-4 grid gap-3 rounded border border-osf-violet-500 bg-osf-violet-50 p-5">
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
		<div class="mb-4 rounded border border-osf-violet-500 bg-osf-violet-50 p-5">
			<p class="text-sm text-osf-canvas-600">Je vraag is bevestigd en wacht nu op moderatie.</p>
		</div>
	{/if}

	<div class="grid gap-4">
		<article class="rounded border border-osf-canvas-200 p-5">
			<header class="mb-3 flex flex-wrap items-center gap-2 text-sm text-osf-canvas-500">
				<span class="font-medium text-osf-canvas-600">{data.question.authorName}</span>
				<span class="whitespace-nowrap">
					· aan
					<a
						href={resolve('/politici/[slug]', { slug: data.question.assigneeSlug })}
						class="underline hover:text-osf-canvas-600">{data.question.assigneeName}</a
					>
					{#if fractionLabel}({fractionLabel}){/if}
				</span>
				<span>·&nbsp;{new Date(data.question.createdAt).toLocaleDateString('nl-NL')}</span>
				<span
					class="ml-auto rounded-full bg-osf-canvas-100 px-2 py-0.5 text-xs text-osf-canvas-500"
				>
					{statusLabel[data.question.status] ?? data.question.status}
				</span>
			</header>

			<h1 class="font-serif text-2xl leading-snug font-[450]">{data.question.title}</h1>

			{#if data.question.body}
				<p class="mt-2 whitespace-pre-wrap">{data.question.body}</p>
			{/if}
		</article>

		{#if data.answer}
			<article class="rounded border border-osf-canvas-200 p-5">
				<header class="mb-3 flex flex-wrap items-center gap-2 text-sm text-osf-canvas-500">
					<span class="font-medium text-osf-canvas-600">{data.answer.authorName}</span>
					<span>·&nbsp;{new Date(data.answer.createdAt).toLocaleDateString('nl-NL')}</span>
					<span
						class="ml-auto rounded-full bg-osf-canvas-100 px-2 py-0.5 text-xs text-osf-canvas-500"
					>
						{statusLabel[data.answer.status] ?? data.answer.status}
					</span>
				</header>

				<p class="whitespace-pre-wrap">{data.answer.body}</p>
			</article>
		{/if}
	</div>
</Page>
