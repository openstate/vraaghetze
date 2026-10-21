<script lang="ts">
	import ContentPage from '$lib/components/content-page.svelte';

	const { data } = $props();
</script>

<ContentPage title={data.meta.title}>
	<p class="text-osf-canvas-600">
		Download het Moderatiebeleid
		<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
		<a href="/files/moderatiedocument-v1.1.pdf">als pdf</a>.
	</p>
</ContentPage>
