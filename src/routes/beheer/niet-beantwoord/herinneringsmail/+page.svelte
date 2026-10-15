<script lang="ts">
	import StatPage from '$lib/components/stat-page.svelte';

	const { data } = $props();

</script>

<StatPage questions={data.questions}/>
