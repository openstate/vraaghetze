<script lang="ts">
	import { createColumnHelper, renderSnippet } from '@tanstack/svelte-table';
	import DataTable, { features } from '$lib/components/data-table.svelte';
	import Pagination from '$lib/components/pagination.svelte';
	import Page from '$lib/components/page.svelte';

	let { data } = $props();

	type Row = (typeof data.rows)[number];

	const helper = createColumnHelper<typeof features, Row>();

	const columns = helper.columns([
		helper.accessor('id', {
			header: 'Id'
		}),
		helper.accessor('name', {
			header: 'Naam',
			meta: { class: 'w-40' }
		}),
		helper.accessor('role', {
			header: 'Rol',
			meta: { class: 'w-30' }
		}),
		helper.accessor('email', {
			header: 'E-mail',
			cell: (cell) => renderSnippet(emailSnippet, cell.row.original),
			meta: { class: 'w-40' }
		})
	]);
</script>

{#snippet emailSnippet(row: Row)}
	{#if row.email_verified}
		{row.email} <span class="iconify size-5 mdi--check align-middle mb-1"></span>
	{:else}
		{row.email} <span class="iconify size-5 mdi--close align-middle"></span>
	{/if}
{/snippet}

<Page width="wide">
	<h1 class="mb-8 font-serif text-4xl">Gebruikers</h1>

	<DataTable {columns} rows={data.rows} fullWidth={false} />
	<Pagination count={data.total} page={data.page} perPage={data.perPage} />
</Page>