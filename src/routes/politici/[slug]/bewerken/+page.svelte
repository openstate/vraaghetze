<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$lib/components/button.svelte';
	import Page from '$lib/components/page.svelte';

  const { data, form } = $props();
</script>

<Page>
	<h1 class="mb-8 font-serif text-4xl">{data.politician.name}</h1>

  <form method="POST" use:enhance class="grid gap-6">
    {#if form?.error}
      <p class="mb-4 mt-4 text-sm text-osf-shocking-pink">{form.error}</p>
    {/if}
    <div class="grid gap-6">
      <label class="text-osf-canvas-600 text-sm">
        <input
          type="checkbox"
          name="acceptsQuestions"
          value={true}
          bind:checked={data.politician.acceptsQuestions}
        />
        Dit kamerlid beantwoordt vragen via VraagHetZe.
      </label>
    </div>

    <div class="mt-2 flex flex-wrap items-center justify-start gap-3">
      <Button type="submit" variant="primary">Opslaan</Button>
    </div>
  </form>
</Page>