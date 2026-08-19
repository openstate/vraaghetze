<script lang="ts">
	import { resolve } from '$app/paths';
	import { Meter } from 'bits-ui';
	import Avatar from '$lib/components/avatar.svelte';
	import Button from '$lib/components/button.svelte';
	import LinkCard from '$lib/components/link-card.svelte';
	import Page from '$lib/components/page.svelte';
	import QuestionCard from '$lib/components/question-card.svelte';

	let { data } = $props();

	const allQuestionsHref = $derived(`${resolve('/vragen')}?kamerlid=${data.politician.slug}`);

	const answeredShare = $derived(
		data.stats.total === 0 ? 0 : Math.round((data.stats.answered / data.stats.total) * 100)
	);

	// an answered card is a lot taller, so two of those already fill the column beside the cards
	const showGhost = $derived(
		data.questions.length < 3 &&
			(data.questions.length < 2 || data.questions.every((question) => question.answer === null))
	);

	const roleLabel = $derived(
		data.politician.fractionRole === 'chair' ? 'Fractievoorzitter van' : 'Kamerlid namens'
	);
</script>

<Page width="wide">
	<header
		class="grid items-start gap-x-10 gap-y-9 border-b border-osf-canvas-200 pb-12 lg:grid-cols-[1fr_auto]"
	>
		<div class="flex flex-wrap items-center gap-x-8 gap-y-5">
			<Avatar
				class="text-6xl"
				size={144}
				loading="eager"
				name={data.politician.name}
				src={resolve('/politici/[slug]/foto', { slug: data.politician.slug })}
			/>

			<div class="min-w-0">
				<h1 class="font-serif text-5xl/none">{data.politician.name}</h1>

				<p class="mt-3 text-lg text-osf-canvas-600">
					{roleLabel}
					<a
						href="{resolve('/politici')}?fractie={data.politician.fractionSlug}"
						title={data.politician.fractionName}
						class="font-medium hover:underline"
					>
						{data.politician.fraction ?? data.politician.fractionName}
					</a>
				</p>
			</div>
		</div>

		<aside class="w-full sm:w-64 lg:self-center">
			<h2 id="answered-label" class="font-mono text-xs tracking-wide text-osf-canvas-500 uppercase">
				Vragen beantwoord
			</h2>

			<p class="mt-3 font-serif text-4xl/none">
				{data.stats.answered}&nbsp;van&nbsp;{data.stats.total}
			</p>

			<Meter.Root
				value={data.stats.answered}
				max={data.stats.total}
				aria-labelledby="answered-label"
				class="mt-4 h-1.5 rounded-sm bg-osf-canvas-200"
				title="{answeredShare}% beantwoord"
			>
				<div class="h-full rounded-sm bg-osf-shocking-pink" style:width="{answeredShare}%"></div>
			</Meter.Root>
		</aside>

		{#if data.commissions.length > 0}
			<div class="lg:col-start-1">
				<h2 class="font-mono text-xs tracking-wide text-osf-canvas-500 uppercase">Commissies</h2>

				<ul class="mt-3 flex flex-wrap gap-2">
					{#each data.commissions as commission (commission.abbreviation)}
						<li>
							<a
								href="{resolve('/politici')}?commissie={encodeURIComponent(
									commission.abbreviation
								)}"
								title={commission.name}
								class="block rounded-sm bg-osf-canvas-100 px-2.5 py-1 text-sm text-osf-canvas-600 hover:underline"
							>
								{commission.shortName}
							</a>
						</li>
					{/each}
				</ul>
			</div>
		{/if}
	</header>

	<h2 class="mt-12 mb-8 font-serif text-3xl">Vragen &amp; Antwoorden</h2>

	<div class="grid items-start gap-x-10 gap-y-10 lg:grid-cols-[1fr_17rem]">
		<!-- h-full stretches this to the cards beside it, so the ghost card fills whatever is left -->
		<div class="flex flex-col gap-4 lg:col-start-1 lg:row-start-1 lg:h-full">
			{#if data.questions.length > 0}
				<ul class="grid gap-4">
					{#each data.questions as question (question.slug)}
						<li>
							<QuestionCard {question} />
						</li>
					{/each}
				</ul>
			{/if}

			{#if showGhost}
				<div
					class="flex min-h-32 flex-1 items-center justify-center rounded border border-osf-canvas-200 p-6 text-center"
				>
					<a
						href="{resolve('/vragen/stellen')}?aan={data.politician.slug}"
						class="font-serif text-xl/snug text-osf-canvas-500 hover:underline"
					>
						Stel jij de {data.questions.length === 0 ? 'eerste' : 'volgende'} vraag aan {data
							.politician.name}?
					</a>
				</div>
			{/if}

			{#if data.stats.total > data.questions.length}
				<Button href={allQuestionsHref} variant="primary" icon="mdi--arrow-right" class="mt-2">
					Bekijk alle {data.stats.total} vragen
				</Button>
			{/if}
		</div>

		<aside class="@container grid lg:sticky lg:top-6 lg:col-start-2 lg:row-start-1">
			<div class="grid gap-4 @lg:grid-cols-2">
				<LinkCard href="{resolve('/vragen/stellen')}?aan={data.politician.slug}">
					Stel een vraag aan {data.politician.name}
				</LinkCard>

				{#if data.stats.total > data.questions.length}
					<LinkCard href={allQuestionsHref} variant="bright">
						Bekijk alle {data.stats.total} vragen aan {data.politician.name}
					</LinkCard>
				{:else}
					<LinkCard href={resolve('/vragen')} variant="bright">
						Bekijk vragen aan andere Kamerleden
					</LinkCard>
				{/if}
			</div>
		</aside>
	</div>
</Page>
