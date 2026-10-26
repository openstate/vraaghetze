<script lang="ts">
	import { resolve } from "$app/paths";
	import Avatar from "$lib/components/avatar.svelte";
	import type { SimilarType } from "$lib/server/questions";

	type Props = {
		question: SimilarType;
	};

	const { question }: Props = $props();
</script>

<li>
	<article class="overflow-hidden rounded bg-osf-canvas-100">
		<div class="p-5">
			<p class="text-sm text-osf-canvas-600">
				Vraag van {question.authorName} op {question.createdAt}
			</p>

			<p class="mt-3 font-serif text-xl/snug">{question.title}</p>

			<p class="mt-2 whitespace-pre-wrap text-osf-canvas-500">{question.body}</p>

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
					>
						{question.politicianName}
						{#if question.fraction ?? question.fractionName}
							({question.fraction ?? question.fractionName})
						{/if}
					</a>
				</p>
			</div>
    </div>
  </article>
</li>