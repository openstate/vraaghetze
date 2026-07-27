<script lang="ts">
	import { createColumnHelper, renderComponent } from '@tanstack/svelte-table';
	import ContentDialog from '$lib/components/content-dialog.svelte';
	import DataTable, { features } from '$lib/components/data-table.svelte';
	import DateTime from '$lib/components/date-time.svelte';
	import StatusPill, { outboxStatusPills } from '$lib/components/status-pill.svelte';
	import Pagination from '$lib/components/pagination.svelte';

	let { data } = $props();

	type Row = (typeof data.rows)[number];

	const helper = createColumnHelper<typeof features, Row>();

	const columns = helper.columns([
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
		}),
		helper.display({
			id: 'content',
			header: '',
			meta: { class: 'w-14' },
			cell: (cell) =>
				renderComponent(ContentDialog, {
					title: cell.row.original.subject,
					body: cell.row.original.body
				})
		})
	]);
</script>

<DataTable {columns} rows={data.rows} />
<Pagination count={data.total} page={data.page} perPage={data.perPage} />
