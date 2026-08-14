<script lang="ts">
	import type { Snippet } from 'svelte';

	type Control = {
		id: string;
		name: string;
		class: string;
		'aria-invalid': 'true' | undefined;
		'aria-describedby': string | undefined;
	};

	type Props = {
		name: string;
		label: string;
		optional?: boolean;
		issues?: string[];
		counter?: { length: number; max: number };
		class?: string;
		children: Snippet<[Control]>;
	};

	let { name, label, optional, issues, counter, class: className, children }: Props = $props();

	const control = $derived<Control>({
		id: `veld-${name}`,
		name,
		class: [
			'w-full rounded border border-osf-canvas-200 bg-transparent px-3 py-2',
			'placeholder:text-osf-canvas-400 focus:border-osf-violet-500 focus:outline-none',
			className
		]
			.filter(Boolean)
			.join(' '),
		'aria-invalid': issues ? 'true' : undefined,
		'aria-describedby': issues ? `fout-${name}` : undefined
	});
</script>

<div class="grid gap-2">
	<div class="flex flex-wrap items-baseline justify-between gap-x-4">
		<label for={control.id} class="font-medium">
			{label}
			{#if optional}<span class="font-normal text-osf-canvas-600">(optioneel)</span>{/if}
		</label>

		{#if counter && counter.length > 0}
			<span class="text-sm text-osf-canvas-500">
				{counter.length} van {counter.max} tekens
			</span>
		{/if}
	</div>

	{@render children(control)}

	{#if issues}
		<span id="fout-{name}" class="text-sm text-osf-shocking-pink">{issues[0]}</span>
	{/if}
</div>
