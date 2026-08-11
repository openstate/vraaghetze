<script module lang="ts">
	import { metaHelper, tableFeatures } from '@tanstack/svelte-table';

	export const features = tableFeatures({ columnMeta: metaHelper<{ class?: string }>() });
</script>

<script lang="ts" generics="TData extends RowData">
	import { createTable, FlexRender, type ColumnDef, type RowData } from '@tanstack/svelte-table';

	type Props = { columns: ColumnDef<typeof features, TData>[]; rows: TData[] };

	let { columns, rows }: Props = $props();

	const table = createTable({
		features,
		// must be reactively passed with getter so prop update propagates
		get columns() {
			return columns;
		},
		get data() {
			return rows;
		}
	});
</script>

<div class="overflow-x-auto">
	<table class="w-full min-w-6xl table-fixed text-left text-sm">
		<thead>
			{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
				<tr class="border-b border-osf-canvas-200">
					{#each headerGroup.headers as header (header.id)}
						<th class={['truncate px-3 py-2 font-medium', header.column.columnDef.meta?.class]}>
							{#if !header.isPlaceholder}<FlexRender {header} />{/if}
						</th>
					{/each}
				</tr>
			{/each}
		</thead>
		<tbody>
			{#each table.getRowModel().rows as row (row.id)}
				<tr class="border-b border-osf-canvas-100">
					{#each row.getAllCells() as cell (cell.id)}
						<td class={['truncate px-3 py-2 align-middle', cell.column.columnDef.meta?.class]}>
							<FlexRender {cell} />
						</td>
					{/each}
				</tr>
			{:else}
				<tr>
					<td
						colspan={table.getAllLeafColumns().length}
						class="px-3 py-8 text-center text-osf-canvas-500"
					>
						Geen resultaten.
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
