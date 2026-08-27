<script lang="ts">
	import Page from '$lib/components/page.svelte';
	import { page } from '$app/state';
</script>
<Page width="wide">
	<h1>{page.error?.message}</h1>
</Page>