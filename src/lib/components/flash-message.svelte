<script lang="ts">
	type Props = { type: string; message: string };

	let { type, message }: Props = $props();

	let flashShown = $state(true);

	let bgColor = $derived(type == 'success' ? '#f5fcf2' : type == 'error' ? '#fcede8' : '#f2f2f2');
	let fgTextColor = $derived(
		type == 'success' ? 'text-[#96cc81]' : type == 'error' ? 'text-[#db7151]' : 'text-[#6e6d6d]'
	);
	let fgColor = $derived(fgTextColor.substring(6, 13));

	function closeFlash(event: Event) {
		event.preventDefault();
		event.stopPropagation();
		flashShown = false;
	}
</script>

{#if flashShown}
	<div class="flash relative w-full">
		<div
			style="background-color:{bgColor};border-top:1px solid {fgColor}; border-bottom: 1px solid {fgColor}"
			class="absolute w-full"
		>
			<div class="mx-auto w-full max-w-7xl px-6 py-2 {fgTextColor}">
				{message}
				<a href="#top" class="px-2 py-2 font-bold hover:cursor-pointer" onclick={closeFlash}>x</a>
			</div>
		</div>
	</div>
{/if}
