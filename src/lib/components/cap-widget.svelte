<script lang="ts">
  import Cap from '@cap.js/widget';
	import { onMount } from 'svelte';

  type Props = {
    capjsSiteKey: string,
    token: string
  }
  let { capjsSiteKey, token = $bindable() }: Props = $props();

  onMount(() => {
    const widget = document.querySelector("#cap");

    widget?.addEventListener("solve", function (e: Event) {
      const ce = e as CustomEvent;
      token = ce.detail.token;
    });
  })
</script>

<style>
  :global(cap-widget) {
    --cap-checkbox-size: 13px;
    --cap-checkbox-border-radius: 0;
    --cap-border-radius: 0.25rem;
    --cap-color: var(--color-osf-canvas-600);
    --cap-font: var(--font-sans)
  }
</style>

<cap-widget
  id="cap"
  data-cap-api-endpoint="https://capjs.openstate.eu/{capjsSiteKey}"
  data-cap-i18n-initial-state="Ik ben geen robot"
></cap-widget>