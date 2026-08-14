<script lang="ts">
	import { resolve } from '$app/paths';
	import cardDoodle from '$lib/assets/card-doodle.webp';
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

	let { question, featured = false }: { question: Question; featured?: boolean } = $props();

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

<article class="@container h-full overflow-hidden rounded bg-osf-canvas-100">
	<div class={['flex h-full flex-col', featured && '@2xl:grid @2xl:min-h-76 @2xl:grid-cols-2']}>
		<!-- grows so that side-by-side cards line up everything below the rule -->
		<div
			class={[
				'grow p-6',
				featured && 'relative overflow-hidden bg-osf-violet-900 text-osf-violet-50 @2xl:p-8'
			]}
		>
			{#if featured}
				<img
					src={cardDoodle}
					alt=""
					aria-hidden="true"
					class="pointer-events-none absolute -right-5 -bottom-3 hidden w-75 @2xl:block"
				/>
			{/if}

			<div class={[featured && 'relative max-w-lg']}>
				<p class={['text-sm', featured ? 'text-osf-shocking-pink' : 'text-osf-canvas-600']}>
					Vraag van {question.authorName} op {formatDateLong(question.createdAt)}
				</p>

				<p
					class={[
						'mt-4 font-serif text-xl/snug',
						featured && 'mb-6 @2xl:mb-4 @2xl:text-2xl/snug @3xl:text-3xl'
					]}
				>
					<a
						href={questionHref}
						class={[
							'decoration-1 underline-offset-2 hover:underline',
							featured && 'text-shadow-osf-violet-900 text-shadow-xl'
						]}
					>
						{question.title}
					</a>
				</p>
			</div>
		</div>

		{#if !featured}
			<hr class="mx-6 border-osf-canvas-200" />
		{/if}

		<div class={['p-6', featured && '@2xl:flex @2xl:flex-col @2xl:justify-between @2xl:p-8']}>
			{#if question.answer}
				<p
					class={[
						'mb-4 line-clamp-3 text-[15px] text-osf-canvas-600',
						featured && '@2xl:line-clamp-6'
					]}
				>
					&ldquo;{question.answer.body}&rdquo;
				</p>
			{/if}

			<div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
				<div class="flex min-w-0 flex-1 items-center gap-3 @max-2xl:basis-full">
					<a href={politicianHref} class="shrink-0" aria-hidden="true" tabindex="-1">
						<Avatar
							size={40}
							name={question.politicianName}
							src={resolve('/politici/[slug]/foto', { slug: question.politicianSlug })}
						/>
					</a>
					<p class="text-sm text-balance text-osf-canvas-600">
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
					class="flex w-fit items-center gap-1 text-sm font-medium text-osf-violet-500 hover:underline @max-2xl:ml-auto"
				>
					Lees meer <span class="iconify size-4 mdi--arrow-right"></span>
				</a>
			</div>
		</div>
	</div>
</article>
