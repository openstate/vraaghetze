<script lang="ts">
	import openStateLogo from '$lib/assets/open-state-logo.svg';
	import Button from '$lib/components/button.svelte';
</script>

<div class="bg-osf-violet-900 text-osf-neutral-50">
	<div class="mx-auto flex max-w-7xl items-center gap-5 px-6 py-1.5 max-lg:justify-between">
		<a href="https://openstate.eu" target="_blank" class="min-w-0 shrink">
			<img src={openStateLogo} alt="Open State Foundation" class="h-4 w-auto max-w-full" />
		</a>

		<Button
			href="https://openstate.eu/nl/doneren/"
			target="_blank"
			variant="primary"
			class="[&>span]:h-7 [&>span]:bg-osf-violet-800 [&>span]:px-3 [&>span]:text-xs [&>span]:text-osf-neutral-50"
		>
			Doneren
		</Button>
	</div>
</div>
