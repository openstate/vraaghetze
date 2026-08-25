<script lang="ts">
	import { browser } from "$app/environment";
	import { resolve } from '$app/paths';
	import openStateLogo from '$lib/assets/open-state-logo.svg?raw';
	import sparks from '$lib/assets/sparks.svg';
	import stepsIllustration from '$lib/assets/steps-illustration.webp';
	import Avatar from '$lib/components/avatar.svelte';
	import Button from '$lib/components/button.svelte';
	import HeroPlanes from '$lib/components/hero-planes.svelte';
	import QuestionCard from '$lib/components/question-card.svelte';

	let { data } = $props();

	const [featuredQuestion, ...otherQuestions] = $derived(data.questions);

	const featuredPoliticians = [
		{ slug: 'lisa-westerveld', name: 'Lisa Westerveld' },
		{ slug: 'henk-vermeer', name: 'Henk Vermeer' },
		{ slug: 'laurens-dassen', name: 'Laurens Dassen' }
	];

	const QUESTION_MAX_LENGTH = 200;

	// TODO: implement the actual stats. discuss with team whether these are the right stats to show.
	const stats = [
		{ icon: 'mdi--help-circle', value: '0', label: 'Vragen gesteld' },
		{ icon: 'mdi--account-group', value: '0', label: 'Vragen beantwoord' },
		{ icon: 'mdi--bullhorn', value: '0', label: 'Kamerleden' },
		{ icon: 'mdi--message-text', value: '0', label: 'Gemiddelde wachttijd' }
	];

	const steps = [
		{
			title: 'Lorem ipsum dolor',
			description:
				'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut blandit ex a congue dignissim. Maecenas vitae lobortis ligula.'
		},
		{
			title: 'Lorem ipsum dolor',
			description:
				'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut blandit ex a congue dignissim. Maecenas vitae lobortis ligula.'
		},
		{
			title: 'Lorem ipsum dolor',
			description:
				'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut blandit ex a congue dignissim. Maecenas vitae lobortis ligula.'
		}
	];
</script>

<section class="relative overflow-hidden bg-osf-canvas-50">
	<!-- one design unit is 0.8px at the 895px wide viewport the compact planes were placed on;
	     the space under the form holds those planes below lg, so it scales along with them -->
	<div
		class="relative isolate mx-auto max-w-380 px-6 pt-[calc(125*var(--plane-unit))] pb-[min(calc(300*var(--plane-unit)),190px)] [--plane-unit:calc(100vw/1119)] lg:pt-36 lg:pb-38"
	>
		<HeroPlanes />

		<p
			class="mx-auto max-w-2xl text-center font-serif text-[2.75rem] leading-[1.2] text-balance md:text-6xl"
		>
			Wat wil jij de politiek vragen?
		</p>

		<p class="mx-auto mt-8 max-w-lg text-center max-md:text-lg">
			Stel jouw vraag aan een politicus en ontvang een direct antwoord. Lees mee met anderen en
			ontdek wat er speelt.
		</p>

		<form
			method="GET"
			action={resolve('/vragen/stellen')}
			class="mx-auto mt-10 flex max-w-xl flex-col gap-2 rounded border border-osf-canvas-200 bg-osf-neutral-50 p-2 md:flex-row md:items-center md:justify-between md:gap-8 md:pl-5"
		>
			<label class="min-w-0 grow">
				<span class="sr-only">Je vraag</span>
				<input
					name="vraag"
					maxlength={QUESTION_MAX_LENGTH}
					placeholder="Bijvoorbeeld... Wat doet u tegen de wooncrisis?"
					class="w-full px-3 py-2.5 text-sm placeholder:text-osf-canvas-400 focus:outline-none md:p-0"
				/>
			</label>
			<Button type="submit" variant="primary" class="shrink-0 max-md:w-full">Stel je vraag</Button>
		</form>

		<div class="mt-6 flex items-center justify-center gap-3">
			<p class="text-sm text-osf-canvas-600">Stel een vraag aan...</p>

			<div class="isolate flex -space-x-2">
				{#each featuredPoliticians as politician, index (politician.slug)}
					<a
						href={resolve('/politici/[slug]', { slug: politician.slug })}
						class="relative shrink-0"
						style:z-index={featuredPoliticians.length - index}
					>
						<Avatar
							size={36}
							name={politician.name}
							alt={politician.name}
							src={resolve('/politici/[slug]/foto', { slug: politician.slug })}
						/></a
					>
				{/each}

				<a
					href={resolve('/politici')}
					class="flex size-9 shrink-0 items-center justify-center rounded-full bg-osf-neutral-50 pl-1 text-xs font-medium text-osf-canvas-400 ring ring-osf-canvas-200"
				>
					+147
				</a>
			</div>
		</div>
	</div>
</section>

<section
	class="mx-auto grid max-w-7xl px-6 py-20 md:grid-cols-[1fr_auto] md:items-end md:gap-x-6 md:py-28"
>
	<div class="mb-8 md:mb-12">
		<p class="font-mono text-xs font-semibold text-osf-shocking-pink">Uitgelicht</p>
		<h2 class="mt-4 font-serif text-3xl md:text-4xl">Recent beantwoorde vragen</h2>
	</div>

	<!-- below md the button sits under the questions instead of next to the heading -->
	<Button
		href="/vragen"
		variant="primary"
		icon="mdi--arrow-right"
		class="max-md:order-last max-md:mt-10 max-md:justify-self-end md:mb-12"
	>
		Bekijk alle vragen
	</Button>

	<div class="md:col-span-2">
		{#if featuredQuestion}
			<QuestionCard question={featuredQuestion} featured />
		{:else}
			<p class="text-osf-canvas-500">Er zijn nog geen beantwoorde vragen.</p>
		{/if}
	</div>

	<ul class="mt-4 grid gap-4 md:col-span-2 md:grid-cols-3">
		{#each otherQuestions as question (question.slug)}
			<li>
				<QuestionCard {question} featured />
			</li>
		{/each}
	</ul>
</section>

<section class="relative overflow-hidden bg-osf-violet-900 text-osf-violet-50">
	<div
		aria-hidden="true"
		class="pointer-events-none absolute inset-0 overflow-hidden text-osf-violet-800/35"
	>
		<div
			class="absolute top-1/2 left-0 w-[1456.3%] translate-x-[-2.11%] translate-y-[-75.5%] [&_path]:fill-current [&>svg]:h-auto [&>svg]:w-full"
		>
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html openStateLogo}
		</div>
	</div>

	<div class="relative mx-auto max-w-7xl px-6 py-24 md:py-32">
		<h2 class="text-center font-serif text-3xl md:text-4xl">VraagHetZe in cijfers</h2>

		<div class="mx-auto mt-14 grid max-w-5xl grid-cols-2 gap-x-8 gap-y-12 md:grid-cols-4">
			{#each stats as stat (stat.label)}
				<div>
					<span aria-hidden="true" class={['iconify size-9 text-osf-shocking-pink', stat.icon]}
					></span>
					<p class="mt-5 font-serif text-4xl md:text-6xl">{stat.value}</p>
					<p class="mt-3">{stat.label}</p>
				</div>
			{/each}
		</div>
	</div>
</section>

<section class="overflow-hidden bg-osf-canvas-50">
	<div class="relative isolate mx-auto max-w-7xl px-6 pt-20 pb-24 md:pt-28 md:pb-32">
		<div class="md:max-w-md lg:max-w-lg">
			<p class="font-mono text-xs font-semibold text-osf-shocking-pink">Hoe werkt het</p>

			<h2 class="mt-4 max-w-sm font-serif text-3xl md:text-4xl">
				Lorem ipsum dolor sit amet consectetur
			</h2>

			<div class="mt-10 grid gap-5">
				{#each steps as step, index (index)}
					<article
						class={[
							'rounded bg-osf-neutral-50 p-5 md:max-w-md',
							index === 1 && 'lg:ml-8',
							index === 2 && 'lg:ml-16'
						]}
					>
						<h3 class="flex items-center gap-4 font-serif text-xl md:text-2xl">
							<span
								class="flex size-8 shrink-0 items-center justify-center rounded-sm bg-osf-shocking-pink font-mono text-sm font-medium text-osf-neutral-50"
							>
								{index + 1}
							</span>
							{step.title}
						</h3>

						<p class="mt-3 text-sm text-osf-canvas-600">{step.description}</p>
					</article>
				{/each}
			</div>
		</div>

		<img
			src={stepsIllustration}
			alt=""
			aria-hidden="true"
			class={[
				'pointer-events-none mt-10 w-full max-w-2xl',
				'max-md:relative max-md:left-1/2 max-md:w-[120vw] max-md:max-w-lg max-md:-translate-x-1/2',
				'md:absolute md:top-1/2 md:right-0 md:-z-10 md:mt-0 md:w-[65%] md:-translate-y-1/2',
				'lg:right-6 lg:w-1/2 lg:scale-120'
			]}
		/>
	</div>
</section>

<section class="bg-osf-canvas-50">
	<div class="mx-auto max-w-7xl px-6">
		<div
			class="relative isolate overflow-hidden rounded-xl bg-osf-violet-900 px-6 py-14 text-center text-osf-violet-50 md:py-22"
		>
			<img
				src={sparks}
				alt=""
				aria-hidden="true"
				class="pointer-events-none absolute inset-0 -z-10 size-full object-cover max-md:hidden"
			/>

			<p class="font-mono text-xs font-semibold text-osf-shocking-pink">Nieuwsbrief</p>

			<h2 class="mt-4 font-serif text-3xl md:text-4xl">Blijf op de hoogte</h2>

			<p class="mx-auto mt-4 max-w-md">
				Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam nulla ipsum, ultricies vel
				purus non.
			</p>

			<form action="https://openstate.us4.list-manage.com/subscribe/post?u=03355fd4f1a7935cae63b21aa&amp;id=2f09e8274d" method="post" id="mc-embedded-subscribe-form" name="mc-embedded-subscribe-form" class="validate" target="_blank" novalidate>
				<div
					class="mx-auto mt-10 flex max-w-md flex-col gap-2 rounded border border-osf-canvas-200 bg-osf-neutral-50 p-2 md:flex-row md:items-center md:justify-between md:gap-8 md:pl-5"
				>
					<label class="min-w-0 grow">
						<span class="sr-only">Je e-mailadres</span>
						<input
							type="email"
							autocomplete="email"
							placeholder="Je emailadres"
							class="w-full px-3 py-2.5 text-sm text-osf-violet-900 placeholder:text-osf-canvas-400 focus:outline-none md:p-0"
							name="EMAIL"
							id="mce-EMAIL"
						/>
					</label>
					<Button type="submit" variant="primary" class="shrink-0 max-md:w-full" name="subscribe" id="mc-embedded-subscribe">Aanmelden</Button>
				</div>
				<div style="position: absolute; left: -5000px;" aria-hidden="true">
					<input type="text" name="b_03355fd4f1a7935cae63b21aa_2f09e8274d" tabindex="-1" value="">
				</div>
				<div id="mce-responses" class="clear mt-[8px]">
					<div class="response text-white" id="mce-error-response" style="display:none"></div>
					<div class="response text-white" id="mce-success-response" style="display:none"></div>
				</div>
			</form>
		</div>
	</div>
</section>

<section class="bg-osf-canvas-50">
	<div class="mx-auto grid max-w-7xl gap-10 px-6 py-20 md:py-32 lg:grid-cols-2 lg:gap-16">
		<div>
			<p class="font-mono text-xs font-semibold text-osf-shocking-pink">Over het platform</p>

			<h2 class="mt-4 font-serif text-3xl md:text-4xl">Waarom VraagHetZe?</h2>
		</div>

		<div class="flex flex-col items-start gap-4 lg:mt-8">
			<p>
				Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse finibus quis odio nec
				finibus. Quisque volutpat consequat risus, non aliquet felis semper vitae. Vestibulum ante
				ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Mauris porttitor
				lorem at lacus lobortis condimentum.
			</p>

			<p>
				Mauris hendrerit diam sed eros elementum facilisis. Duis convallis posuere nulla. Sed
				dignissim lacinia tortor, ac auctor felis rutrum ac. Proin in sapien lacinia nisl rutrum
				condimentum in vitae lacus. Maecenas vitae.
			</p>

			<Button
				href={resolve('/over')}
				variant="primary"
				icon="mdi--arrow-right"
				class="mt-4 max-md:self-end"
			>
				Lees meer
			</Button>
		</div>
	</div>
</section>
{#if browser}
<script src='https://s3.amazonaws.com/downloads.mailchimp.com/js/mc-validate.js'></script>
{/if}
