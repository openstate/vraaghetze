<script lang="ts">
	import { resolve } from '$app/paths';
	import Avatar from '$lib/components/avatar.svelte';
	import Button from '$lib/components/button.svelte';
	import Page from '$lib/components/page.svelte';
	import QuestionCard from '$lib/components/question-card.svelte';

	let { data } = $props();
</script>

<Page>
	<div class="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
		<Avatar
			class="text-5xl"
			size={128}
			name={data.politician.name}
			src={resolve('/politici/[slug]/foto', { slug: data.politician.slug })}
		/>

		<div>
			<h1 class="font-serif text-4xl font-[450]">{data.politician.name}</h1>
			<p class="mt-2 text-osf-canvas-500">
				{data.politician.fractionName}
				{#if data.politician.fraction && data.politician.fractionName !== data.politician.fraction}({data
						.politician.fraction}){/if}
				{#if data.politician.fractionRole === 'chair'}· Fractievoorzitter{/if}
			</p>

			<Button
				href={`/vragen/stellen?aan=${data.politician.slug}`}
				variant="primary"
				icon="mdi--arrow-right"
				class="mt-4"
			>
				Stel je vraag
			</Button>
		</div>
	</div>

	<section class="mt-12">
		<h2 class="mb-4 font-serif text-2xl font-[450]">Vragen aan {data.politician.name}</h2>

		{#if data.questions.length === 0}
			<p class="text-osf-canvas-500">Er zijn nog geen vragen aan {data.politician.name} gesteld.</p>
		{:else}
			<ul class="grid gap-3">
				{#each data.questions as question (question.slug)}
					<li>
						<QuestionCard {question} />
					</li>
				{/each}
			</ul>
		{/if}
	</section>
</Page>
