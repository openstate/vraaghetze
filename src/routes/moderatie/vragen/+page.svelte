<script lang="ts">
	import { resolve } from '$app/paths';
	import { createColumnHelper, renderComponent, renderSnippet } from '@tanstack/svelte-table';
	import ContentDialog from '$lib/components/content-dialog.svelte';
	import DataTable, { features } from '$lib/components/data-table.svelte';
	import DateTime from '$lib/components/date-time.svelte';
	import StatusPill, { moderationStatusPills } from '$lib/components/status-pill.svelte';
	import Pagination from '$lib/components/pagination.svelte';

	let { data } = $props();

	type Row = (typeof data.rows)[number];

	const helper = createColumnHelper<typeof features, Row>();

	const columns = helper.columns([
		helper.accessor('title', {
			header: 'Titel',
			cell: (cell) => renderSnippet(titleLink, cell.row.original)
		}),
		helper.accessor('authorName', {
			header: 'Vraagsteller',
			meta: { class: 'w-44' }
		}),
		helper.accessor('politicianName', {
			header: 'Kamerlid',
			meta: { class: 'w-44' },
			cell: (cell) => renderSnippet(politicianLink, cell.row.original)
		}),
		helper.accessor('status', {
			header: 'Status',
			meta: { class: 'w-40' },
			cell: (cell) => renderComponent(StatusPill, moderationStatusPills[cell.getValue()])
		}),
		helper.accessor('createdAt', {
			header: 'Aangemaakt',
			meta: { class: 'w-44' },
			cell: (cell) => renderComponent(DateTime, { value: cell.getValue(), time: true })
		}),
		helper.accessor('answeredAt', {
			header: 'Beantwoord',
			meta: { class: 'w-44' },
			cell: (cell) => renderSnippet(answeredCell, cell.row.original)
		}),
		helper.display({
			id: 'content',
			header: '',
			meta: { class: 'w-14' },
			cell: (cell) =>
				renderComponent(ContentDialog, {
					title: cell.row.original.title,
					body: cell.row.original.body
				})
		})
	]);
</script>

{#snippet titleLink(row: Row)}
	{#if row.status === 'approved'}
		<a
			href={resolve('/vragen/[slug]', { slug: row.slug })}
			title={row.title}
			class="hover:underline"
		>
			{row.title}
		</a>
	{:else}
		<span title={row.title}>{row.title}</span>
	{/if}
{/snippet}

{#snippet answeredCell(row: Row)}
	{#if row.answeredAt !== null}
		<DateTime value={row.answeredAt} time />
	{:else}
		<span class="text-osf-canvas-400">
			{#if row.status === 'approved'}
				Niet beantwoord
			{:else}
				&mdash;
			{/if}
		</span>
	{/if}
{/snippet}

{#snippet politicianLink(row: Row)}
	{#if row.politicianSlug === null}
		{row.politicianName}
	{:else}
		<a href={resolve('/politici/[slug]', { slug: row.politicianSlug })} class="hover:underline">
			{row.politicianName}
		</a>
	{/if}
{/snippet}

<DataTable {columns} rows={data.rows} />
<Pagination count={data.total} page={data.page} perPage={data.perPage} />
