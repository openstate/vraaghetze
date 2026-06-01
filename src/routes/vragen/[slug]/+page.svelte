<script lang="ts">
	import { resolve } from '$app/paths';
	import Page from '$lib/components/page.svelte';

	let { data } = $props();

	const statusLabel = {
		pending: 'Wacht op moderatie',
		approved: 'Goedgekeurd',
		rejected: 'Afgewezen'
	};
</script>

<Page>
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
