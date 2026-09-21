<script lang="ts">
	import ContentPage from '$lib/components/content-page.svelte';

	const { data } = $props();
</script>

<ContentPage title={data.meta.title}>
	<p class="text-osf-canvas-600" >
		Download het privacybeleid
		<a href="/files/privacybeleid.pdf">als pdf</a>.
	</p>
</ContentPage>