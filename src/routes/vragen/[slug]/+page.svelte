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
</script>

<Page>
	{#if data.banner === 'needs-confirm'}
		<div class="mb-4 grid gap-3 rounded border border-osf-violet-500 bg-osf-violet-50 p-5">
			<p class="text-sm text-osf-canvas-600">
				Heb jij deze vraag gesteld? Bevestig dat <strong>{data.thread.title}</strong> van jou is, dan
				kan een moderator hem beoordelen.
			</p>
			<form method="POST" action="?/bevestigen" use:enhance class="flex flex-wrap gap-2">
				<Button type="submit" name="keuze" value="ja" variant="primary">
					Ja, dit was ik
				</Button>
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
		{#each data.posts as post, index (post.id)}
			<article class="rounded border border-osf-canvas-200 p-5">
				<header class="mb-3 flex flex-wrap items-center gap-2 text-sm text-osf-canvas-500">
					<span class="font-medium text-osf-canvas-600">{post.authorName}</span>
					{#if post.assigneeName}
						{@const fractionLabel = post.fraction ?? post.fractionName}
						<span class="whitespace-nowrap">
							· aan
							{#if post.assigneeSlug}
								<a
									href={resolve('/politici/[slug]', { slug: post.assigneeSlug })}
									class="underline hover:text-osf-canvas-600">{post.assigneeName}</a
								>
							{:else}
								{post.assigneeName}
							{/if}
							{#if fractionLabel}({fractionLabel}){/if}
						</span>
					{/if}
					<span>·&nbsp;{new Date(post.createdAt).toLocaleDateString('nl-NL')}</span>
					<span
						class="ml-auto rounded-full bg-osf-canvas-100 px-2 py-0.5 text-xs text-osf-canvas-500"
					>
						{statusLabel[post.status] ?? post.status}
					</span>
				</header>

				{#if index === 0}
					<h1 class="font-serif text-2xl leading-snug font-[450]">{data.thread.title}</h1>
				{/if}

				{#if post.body}
					<p class="mt-2 whitespace-pre-wrap">{post.body}</p>
				{/if}
			</article>
		{/each}
	</div>
</Page>
