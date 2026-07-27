<script module lang="ts">
	import type { InboxStatus, ModerationStatus, OutboxStatus } from '$lib/server/db/app.schema';

	type Tone = 'neutral' | 'positive' | 'warning' | 'danger';

	type Pill = { label: string; tone: Tone };

	export const moderationStatusPills: Record<ModerationStatus, Pill> = {
		pending: { label: 'In afwachting', tone: 'neutral' },
		approved: { label: 'Goedgekeurd', tone: 'positive' },
		rejected: { label: 'Afgewezen', tone: 'danger' }
	};

	export const inboxStatusPills: Record<InboxStatus, Pill> = {
		received: { label: 'Ontvangen', tone: 'neutral' },
		processed: { label: 'Verwerkt', tone: 'positive' },
		ignored: { label: 'Genegeerd', tone: 'neutral' },
		failed: { label: 'Mislukt', tone: 'danger' }
	};

	export const outboxStatusPills: Record<OutboxStatus, Pill> = {
		queued: { label: 'In wachtrij', tone: 'neutral' },
		sending: { label: 'Wordt verzonden', tone: 'warning' },
		sent: { label: 'Verzonden', tone: 'positive' },
		failed: { label: 'Mislukt', tone: 'danger' }
	};
</script>

<script lang="ts">
	type Props = { label: string; tone?: Tone; title?: string };
	let { label, tone = 'neutral', title }: Props = $props();

	const toneClass = $derived(
		{
			neutral: 'bg-osf-canvas-100 text-osf-canvas-500',
			positive: 'bg-osf-blue-50 text-osf-blue-700',
			warning: 'bg-osf-violet-50 text-osf-violet-700',
			danger: 'bg-osf-violet-50 text-osf-shocking-pink'
		}[tone]
	);
</script>

<span {title} class={['block w-fit max-w-full truncate rounded-sm px-2 py-0.5 text-sm', toneClass]}>
	{label}
</span>
