<script lang="ts">
	import { goto } from '$app/navigation';
	import { page as pageState } from '$app/state';
	import { Pagination } from 'bits-ui';
	import { PER_PAGE_OPTIONS } from '$lib/pagination';

	type Props = { count: number; page: number; perPage: number };

	let { count, page, perPage }: Props = $props();

	function navigate(params: Record<string, string>) {
		const url = new URL(pageState.url);
		for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		goto(url, { keepFocus: true, noScroll: true });
	}

	const buttonClass =
		'flex size-9 cursor-pointer items-center justify-center rounded-sm font-mono text-sm ' +
		'hover:bg-osf-canvas-100 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-osf-violet-800';
</script>

<div class="mt-6 flex flex-wrap items-center justify-between gap-4">
	<label class="flex items-center gap-2 text-sm text-osf-canvas-500">
		Rijen per pagina
		<select
			value={perPage}
			onchange={(event) => navigate({ per: event.currentTarget.value, pagina: '1' })}
			class="rounded border border-osf-canvas-200 px-2 py-1 focus:border-osf-violet-500 focus:outline-none dark:border-osf-violet-700"
		>
			{#each PER_PAGE_OPTIONS as option (option)}
				<option value={option}>{option}</option>
			{/each}
		</select>
	</label>

	<Pagination.Root
		{count}
		{perPage}
		{page}
		onPageChange={(next) => navigate({ pagina: String(next) })}
	>
		{#snippet children({ pages, range })}
			<div class="flex items-center gap-4">
				<p class="text-sm text-osf-canvas-500">
					{count === 0 ? 0 : range.start}–{range.end} van {count}
				</p>

				<div class="flex items-center gap-1">
					<Pagination.PrevButton class={buttonClass} aria-label="Vorige pagina">
						<span class="iconify size-4.5 mdi--chevron-left"></span>
					</Pagination.PrevButton>

					{#each pages as pageItem (pageItem.key)}
						{#if pageItem.type === 'ellipsis'}
							<span class="px-1 text-sm text-osf-canvas-500">…</span>
						{:else}
							<Pagination.Page
								page={pageItem}
								class={[
									buttonClass,
									'data-selected:bg-osf-violet-900 data-selected:text-osf-canvas-50',
									'dark:data-selected:bg-osf-neutral-50 dark:data-selected:text-osf-violet-900'
								]}
							>
								{pageItem.value}
							</Pagination.Page>
						{/if}
					{/each}

					<Pagination.NextButton class={buttonClass} aria-label="Volgende pagina">
						<span class="iconify size-4.5 mdi--chevron-right"></span>
					</Pagination.NextButton>
				</div>
			</div>
		{/snippet}
	</Pagination.Root>
</div>
