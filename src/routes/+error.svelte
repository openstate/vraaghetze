<script lang="ts">
  import { page } from '$app/state';
  import Page from '$lib/components/page.svelte';
</script>

<Page width="wide">
  <h1>{page.status}: {page.error?.message}</h1>
</Page>
