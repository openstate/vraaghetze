<script lang="ts">
	import DetailsDialog from '$lib/components/details-dialog.svelte';
	import { createColumnHelper, renderComponent } from '@tanstack/svelte-table';
	import DataTable, { features } from '$lib/components/data-table.svelte';
	import DateTime from '$lib/components/date-time.svelte';
	import { question2Details, statusToText } from '$lib/questions.js';
	import StatusPill, { questionStatusPills } from '$lib/components/status-pill.svelte';
	import type { ListQuestionType } from '$lib/server/moderation.js';
	import SnippetTitleLink from '$lib/components/snippet-title-link.svelte';
	import SnippetPoliticianLink from '$lib/components/snippet-politician-link.svelte';
	import SnippetAnsweredCell from '$lib/components/snippet-answered-cell.svelte';

  type Props = {
    questions: ListQuestionType[]
  }
	const { questions }: Props = $props();

	const helper = createColumnHelper<typeof features, ListQuestionType>();

	const columns = helper.columns([
		helper.display({
			id: 'details',
			header: '',
			meta: { class: 'w-14' },
			cell: (cell) => {
				return renderComponent(DetailsDialog, {
					title: statusToText[cell.row.original.status],
					detailId: cell.row.original.id,
					questionDetails: question2Details
				});
			}
		}),
		helper.accessor('title', {
			header: 'Vraag',
			cell: (cell) => renderComponent(SnippetTitleLink, cell.row.original)
		}),
		helper.accessor('authorName', {
			header: 'Vraagsteller',
			meta: { class: 'w-44' }
		}),
		helper.accessor('politicianName', {
			header: 'Kamerlid',
			meta: { class: 'w-44' },
			cell: (cell) => renderComponent(SnippetPoliticianLink, cell.row.original)
		}),
		helper.accessor('status', {
			header: 'Status',
			meta: { class: 'w-40' },
			cell: (cell) =>
				renderComponent(
					StatusPill,
					questionStatusPills[cell.row.original.verifiedAt ? cell.getValue() : 'unverified']
				)
		}),
		helper.accessor('createdAt', {
			header: 'Aangemaakt',
			meta: { class: 'w-44' },
			cell: (cell) => renderComponent(DateTime, { value: cell.getValue(), time: true })
		}),
		helper.accessor('answeredAt', {
			header: 'Beantwoord',
			meta: { class: 'w-44' },
			cell: (cell) => renderComponent(SnippetAnsweredCell, cell.row.original)
		})
	]);
</script>

<DataTable {columns} rows={questions} />
