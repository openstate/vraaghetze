<script lang="ts">
	import { resolve } from '$app/paths';
	import Avatar from '$lib/components/avatar.svelte';
	import { formatDateLong } from '$lib/date-time';

	type Question = {
		slug: string;
		title: string;
		createdAt: Date;
		status?: 'pending' | 'approved' | 'rejected';
		authorName: string;
		politicianName: string;
		politicianSlug: string;
		fraction: string | null;
		fractionName: string | null;
		answer: { body: string; createdAt: Date } | null;
	};

	let { question }: { question: Question } = $props();

	const recipientLabel = $derived(
		question.status === 'pending'
			? 'Wacht op moderatie, gesteld aan'
			: question.status === 'rejected'
				? 'Afgewezen, was gesteld aan'
				: question.answer
					? 'Antwoord van'
					: 'Wacht op antwoord van'
	);

	const fractionLabel = $derived(question.fraction ?? question.fractionName);
	const questionHref = $derived(resolve('/vragen/[slug]', { slug: question.slug }));
	const politicianHref = $derived(resolve('/politici/[slug]', { slug: question.politicianSlug }));
</script>

<article class="overflow-hidden rounded bg-osf-canvas-100">
	<div class="p-5">
		<p class="text-sm text-osf-canvas-600">
			Vraag van {question.authorName} op {formatDateLong(question.createdAt)}
		</p>

		<p class="mt-3 font-serif text-xl/snug font-[450]">
			<a href={questionHref} class="decoration-1 underline-offset-2 hover:underline"
				>{question.title}</a
			>
		</p>
	</div>

	<hr class="mx-5 border-osf-canvas-200" />

	<div class="p-5">
		{#if question.answer}
			<p class="mb-4 line-clamp-3 text-[15px] text-osf-canvas-600">
				&ldquo;{question.answer.body}&rdquo;
			</p>
		{/if}

		<div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
			<div class="flex min-w-0 flex-1 items-center gap-3">
				<a href={politicianHref} class="shrink-0" aria-hidden="true" tabindex="-1">
					<Avatar
						size={40}
						name={question.politicianName}
						src={resolve('/politici/[slug]/foto', { slug: question.politicianSlug })}
					/>
				</a>
				<p class="text-sm text-osf-canvas-600">
					{recipientLabel}
					<a href={politicianHref} class="font-medium hover:underline">
						{question.politicianName}
						{#if fractionLabel}({fractionLabel}){/if}
					</a>
					{#if question.answer}op {formatDateLong(question.answer.createdAt)}{/if}
				</p>
			</div>

			<a
				href={questionHref}
				tabindex="-1"
				class="flex w-fit items-center gap-1 text-sm font-medium text-osf-violet-500 hover:underline"
			>
				Lees meer <span class="iconify size-4 mdi--arrow-right"></span>
			</a>
		</div>
	</div>
</article>
