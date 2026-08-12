<script lang="ts">
	import { createColumnHelper, renderComponent } from '@tanstack/svelte-table';
	import DetailsDialog, { type Detail } from '$lib/components/details-dialog.svelte';
	import DataTable, { features } from '$lib/components/data-table.svelte';
	import DateTime from '$lib/components/date-time.svelte';
	import StatusPill, { inboxStatusPills } from '$lib/components/status-pill.svelte';
	import Pagination from '$lib/components/pagination.svelte';

	let { data } = $props();

	type Row = (typeof data.rows)[number];

	const helper = createColumnHelper<typeof features, Row>();

	const columns = helper.columns([
		helper.display({
			id: 'details',
			header: '',
			meta: { class: 'w-14' },
			cell: (cell) =>
				renderComponent(DetailsDialog, {
					title: dialogTitles[cell.row.original.status],
					details: details(cell.row.original)
				})
		}),
		helper.accessor('fromAddress', {
			header: 'Afzender',
			meta: { class: 'w-70' }
		}),
		helper.accessor('subject', {
			header: 'Onderwerp'
		}),
		helper.accessor('status', {
			header: 'Status',
			meta: { class: 'w-44' },
			cell: (cell) =>
				renderComponent(StatusPill, {
					...inboxStatusPills[cell.getValue()],
					title: cell.row.original.reason ?? undefined
				})
		}),
		helper.accessor('receivedAt', {
			header: 'Ontvangen',
			meta: { class: 'w-48' },
			cell: (cell) => renderComponent(DateTime, { value: cell.getValue(), time: true })
		})
	]);

	const dialogTitles = {
		received: 'Onafgehandelde e-mail',
		processed: 'Verwerkte e-mail',
		ignored: 'Genegeerde e-mail',
		failed: 'Mislukte e-mail'
	} satisfies Record<Row['status'], string>;

	function details(row: Row) {
		return [
			['Afzender', row.fromAddress],
			['Onderwerp', row.subject],
			['Inhoud', row.body],
			['Status', inboxStatusPills[row.status].label],
			['Reden', row.reason],
			['Ontvangen op', row.receivedAt],
			['Afgehandeld op', row.processedAt]
		] satisfies Detail[];
	}
</script>

<DataTable {columns} rows={data.rows} />
<Pagination count={data.total} page={data.page} perPage={data.perPage} />
