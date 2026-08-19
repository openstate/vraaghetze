<script lang="ts">
	import openStateLogo from '$lib/assets/open-state-logo.svg';
	import DonateButton from '$lib/components/donate-button.svelte';
</script>

<div class="bg-osf-violet-900 text-osf-neutral-50">
	<div class="mx-auto flex max-w-7xl items-center gap-5 px-6 py-1.5 max-lg:justify-between">
		<a href="https://openstate.eu" target="_blank" class="min-w-0 shrink">
			<img src={openStateLogo} alt="Open State Foundation" class="h-4 w-auto max-w-full" />
		</a>

		<DonateButton />
	</div>
</div>
