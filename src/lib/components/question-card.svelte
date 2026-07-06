<script lang="ts">
	import { resolve } from '$app/paths';

	type Question = {
		slug: string;
		title: string;
		createdAt: Date;
		status?: string;
		verifiedAt?: Date | null;
		authorName?: string;
		politicianName?: string;
		fraction?: string | null;
		fractionName?: string | null;
	};

	type Props = {
		/** Show the moderation pill only when pending (default), or for every status. */
		statusDisplay?: 'pending' | 'always';
		/** Show whether the question is confirmed to belong to this account (profile only). */
		showVerification?: boolean;
		question: Question;
	};

	let { question, statusDisplay = 'pending', showVerification = false }: Props = $props();

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

	const isVerified = $derived(question.verifiedAt != null);

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
		<div class="flex flex-wrap items-center gap-1.5">
			{#if showVerification && !isVerified}
				<span
					class="flex items-center gap-1 rounded-full bg-osf-violet-50 px-2 py-0.5 text-xs text-osf-violet-700"
				>
					<span class="iconify size-3.5 mdi--alert-circle-outline"></span>
					Niet bevestigd
				</span>
			{/if}
			{#if statusText}
				<span class="rounded-full bg-osf-canvas-100 px-2 py-0.5 text-xs text-osf-canvas-500">
					{statusText}
				</span>
			{/if}
		</div>
	</div>
	<p class="mt-1 text-sm text-osf-canvas-500">{meta.join(' · ')}</p>
</a>
