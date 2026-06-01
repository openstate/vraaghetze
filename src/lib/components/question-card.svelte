<script lang="ts">
	import { resolve } from '$app/paths';

	type Question = {
		slug: string;
		title: string;
		createdAt: Date;
		status?: string;
		authorName?: string;
		politicianName?: string;
		fraction?: string | null;
		fractionName?: string | null;
	};

	type Props = {
		/** Show the moderation pill only when pending (default), or for every status. */
		statusDisplay?: 'pending' | 'always';
		question: Question;
	};

	let { question, statusDisplay = 'pending' }: Props = $props();

	const statusLabel: Record<string, string> = {
		pending: 'Wacht op moderatie',
		approved: 'Goedgekeurd',
		rejected: 'Afgewezen'
	};

	const statusText = $derived(
		question.status !== undefined && (statusDisplay === 'always' || question.status === 'pending')
			? (statusLabel[question.status] ?? question.status)
			: null
	);

	const meta = $derived.by(() => {
		const fraction = question.fraction ?? question.fractionName;
		const recipient = question.politicianName
			? `aan ${question.politicianName}${fraction ? `\u00A0(${fraction})` : ''}`
			: null;
		const date = new Date(question.createdAt).toLocaleDateString('nl-NL');
		return [question.authorName, recipient, date].filter((part) => part !== null);
	});
</script>

<a
	href={resolve('/vragen/[slug]', { slug: question.slug })}
	class="block rounded border border-osf-canvas-200 p-4 transition-colors hover:bg-osf-canvas-100"
>
	<div class="flex flex-wrap items-start justify-between gap-2">
		<p class="font-medium">{question.title}</p>
		{#if statusText}
			<span class="rounded-full bg-osf-canvas-100 px-2 py-0.5 text-xs text-osf-canvas-500">
				{statusText}
			</span>
		{/if}
	</div>
	<p class="mt-1 text-sm text-osf-canvas-500">{meta.join(' · ')}</p>
</a>
