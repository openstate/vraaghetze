<script lang="ts">
	import Button from '$lib/components/button.svelte';
	import { questions } from '$lib/dummy';
</script>

<div data-theme="dark" class="bg-osf-violet-900 text-osf-violet-50">
	<div class="mx-auto max-w-7xl px-4 pt-22 pb-32">
		<p
			class="mx-auto mb-8 max-w-lg text-center font-serif text-6xl leading-[1.1] font-[450] text-balance"
		>
			Wat wil jij de politiek vragen?
		</p>

		<p class="mx-auto mb-10 max-w-lg text-center text-osf-violet-100">
			Stel jouw vraag aan een politicus en ontvang een direct antwoord. Lees mee met anderen en
			ontdek wat er speelt.
		</p>

		<Button href="/vraag/stellen" variant="primary" icon="mdi--arrow-right" class="mx-auto">
			Stel je vraag
		</Button>
	</div>
</div>

<main class="mx-auto max-w-7xl px-6 py-6">
	<section class="my-16">
		<h2 class="mb-8 font-serif text-3xl">Recente antwoorden</h2>

		<div class="grid grid-cols-2 gap-4">
			{#each questions as question, i (i)}
				<article class="flex flex-col rounded bg-osf-canvas-100 p-5">
					<h3 class="grow leading-tight font-medium">
						{question.question}
					</h3>

					<p class="mt-6 line-clamp-6">
						{question.answer}
					</p>

					<div class="mt-6 flex items-center gap-2 text-[15px]">
						<div
							class="flex size-7.5 items-center justify-center rounded-full bg-osf-violet-400 text-center font-mono text-[15px] text-osf-violet-50"
						>
							{question.from.slice(0, 1)}
						</div>
						<span>{question.from}, 20 april</span>
					</div>
				</article>
			{/each}
		</div>
	</section>
</main>
