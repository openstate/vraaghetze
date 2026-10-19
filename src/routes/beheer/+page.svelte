<script lang="ts">
	import { resolve } from "$app/paths";
	import Button from "$lib/components/button.svelte";
	import Page from '$lib/components/page.svelte';
</script>

<Page width="wide">
	<h1 class="mb-8 font-serif text-4xl">Beheer</h1>
  <div class="flex flex-col gap-8">
    <Button
      href={resolve('/beheer/gebruikers')}
      variant="primary"
      icon="mdi--arrow-right"
      class=""
    >
      Gebruikers
    </Button>

    <Button
      href={resolve('/beheer/niet-beantwoord')}
      variant="primary"
      icon="mdi--arrow-right"
      class=""
    >
      Niet beantwoorde vragen
    </Button>
  </div>
</Page>