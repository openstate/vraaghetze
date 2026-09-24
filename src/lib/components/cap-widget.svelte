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
  data-cap-i18n-verify-aria-label="Klik om te verifiëren dat je geen robot bent"
  data-cap-i18n-verifying-label="Verifiëren..."
  data-cap-i18n-verifying-aria-label="Verifiëren, s.v.p. even wachten"
  data-cap-i18n-solved-label="Voltooid"
  data-cap-i18n-verified-aria-label="Voltooid"
></cap-widget>