<script lang="ts">
	import { resolve } from '$app/paths';
	import { Meter } from 'bits-ui';
	import Avatar from '$lib/components/avatar.svelte';
	import Button from '$lib/components/button.svelte';
	import Page from '$lib/components/page.svelte';
	import QuestionCard from '$lib/components/question-card.svelte';

	let { data } = $props();

	const allQuestionsHref = $derived(`${resolve('/vragen')}?kamerlid=${data.politician.slug}`);

	const answeredShare = $derived(
		data.stats.total === 0 ? 0 : Math.round((data.stats.answered / data.stats.total) * 100)
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
				class="text-6xl ring ring-osf-canvas-200"
				size={144}
				loading="eager"
				name={data.politician.name}
				src={resolve('/politici/[slug]/foto', { slug: data.politician.slug })}
			/>

			<div class="min-w-0">
				<h1 class="font-serif text-5xl/none font-[450]">{data.politician.name}</h1>

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

		{#if data.stats.total > 0}
			<aside class="w-full sm:w-64 lg:self-center">
				<h2
					id="answered-label"
					class="font-mono text-xs tracking-wide text-osf-canvas-500 uppercase"
				>
					Vragen beantwoord
				</h2>

				<p class="mt-3 font-serif text-4xl/none font-[450]">
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
		{/if}

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

	<h2 class="mt-12 mb-8 font-serif text-3xl font-[450]">Vragen &amp; Antwoorden</h2>

	<div class="grid items-start gap-x-10 gap-y-3 lg:grid-cols-[1fr_17rem]">
		<aside class="lg:sticky lg:top-6 lg:col-start-2 lg:row-start-1">
			<a
				href="{resolve('/vragen/stellen')}?aan={data.politician.slug}"
				class="group flex min-h-52 flex-col justify-between rounded bg-osf-violet-900 p-6 text-osf-violet-50"
			>
				<span class="font-serif text-2xl/snug font-[450] text-balance">
					Stel {data.stats.total > 0 ? 'ook ' : ''}een vraag aan {data.politician.name}
				</span>

				<span
					aria-hidden="true"
					class="mt-8 ml-auto flex size-11 items-center justify-center rounded-full bg-osf-neutral-50 text-osf-violet-900"
				>
					<span
						class="iconify size-4.5 mdi--arrow-right group-hover:scale-125 group-hover:-rotate-45 motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-in-out motion-reduce:group-hover:scale-100 motion-reduce:group-hover:rotate-0"
					></span>
				</span>
			</a>
		</aside>

		<div class="lg:col-start-1 lg:row-start-1">
			{#if data.questions.length === 0}
				<div class="flex min-h-52 flex-col justify-between rounded bg-osf-canvas-100 p-8 lg:h-full">
					<div>
						<p class="font-serif text-xl/snug font-[450]">
							Nog geen vragen aan {data.politician.name}
						</p>

						<p class="mt-3 text-osf-canvas-600">
							Wees de eerste die iets vraagt of bekijk vragen aan andere Kamerleden.
						</p>
					</div>

					<Button href={resolve('/vragen')} variant="primary" icon="mdi--arrow-right" class="mt-8">
						Bekijk andere vragen
					</Button>
				</div>
			{:else}
				<ul class="grid gap-3">
					{#each data.questions as question (question.slug)}
						<li>
							<QuestionCard {question} />
						</li>
					{/each}
				</ul>

				{#if data.stats.total > data.questions.length}
					<Button href={allQuestionsHref} variant="primary" icon="mdi--arrow-right" class="mt-8">
						Bekijk alle {data.stats.total} vragen
					</Button>
				{:else}
					<Button href={resolve('/vragen')} variant="primary" icon="mdi--arrow-right" class="mt-8">
						Bekijk andere vragen
					</Button>
				{/if}
			{/if}
		</div>
	</div>
</Page>
