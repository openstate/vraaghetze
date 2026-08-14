<script lang="ts">
	import { createColumnHelper, renderComponent } from '@tanstack/svelte-table';
	import DetailsDialog, { type Detail } from '$lib/components/details-dialog.svelte';
	import DataTable, { features } from '$lib/components/data-table.svelte';
	import DateTime from '$lib/components/date-time.svelte';
	import StatusPill, { outboxStatusPills } from '$lib/components/status-pill.svelte';
	import Pagination from '$lib/components/pagination.svelte';

	import type { OutboxKind } from '$lib/server/db/app.schema';

	let { data } = $props();

	type Row = (typeof data.rows)[number];

	const outboxKindLabels: Record<OutboxKind, string> = {
		'question-notification': 'Vraagmelding',
		'moderation-notification': 'Moderatiemelding',
		'answer-notification': 'Antwoordmelding',
		'follow-notification': 'Volgmelding',
		'magic-link': 'Inloglink'
	};

	const helper = createColumnHelper<typeof features, Row>();

	const columns = helper.columns([
		helper.display({
			id: 'details',
			header: '',
			meta: { class: 'w-14' },
			cell: (cell) =>
				renderComponent(DetailsDialog, {
					title: cell.row.original.status === 'sent' ? 'Verzonden e-mail' : 'Niet-verzonden e-mail',
					details: details(cell.row.original)
				})
		}),
		helper.accessor('recipient', {
			header: 'Ontvanger',
			meta: { class: 'w-70' }
		}),
		helper.accessor('subject', {
			header: 'Onderwerp'
		}),
		helper.accessor('status', {
			header: 'Status',
			meta: { class: 'w-44' },
			cell: (cell) => renderComponent(StatusPill, outboxStatusPills[cell.getValue()])
		}),
		helper.accessor('createdAt', {
			header: 'Verzonden',
			meta: { class: 'w-48' },
			cell: (cell) => renderComponent(DateTime, { value: cell.getValue(), time: true })
		})
	]);

	function details(row: Row) {
		const tries = `na ${row.attempts} poging${row.attempts === 1 ? '' : 'en'}`;
		return [
			['Ontvanger', row.recipient],
			['Soort', outboxKindLabels[row.kind]],
			['Onderwerp', row.subject],
			['Inhoud', row.body],
			['Antwoordadres', row.replyTo],
			['Status', `${outboxStatusPills[row.status].label} (${tries})`],
			['Laatste fout', row.lastError],
			['Afgehandeld op', row.createdAt],
			['Verzonden op', row.sentAt]
		] satisfies Detail[];
	}
</script>

<DataTable {columns} rows={data.rows} />
<Pagination count={data.total} page={data.page} perPage={data.perPage} />
