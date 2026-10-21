<script lang="ts">
  /* eslint-disable svelte/no-at-html-tags */
  type Props = {
    url: string;
  };
	let { url }: Props = $props();
</script>
Beste gebruiker,

Je kunt inloggen via deze link: {@html url}

Als je geen inloglink hebt aangevraagd kun je deze e-mail negeren.

Met vriendelijke groet,

Het VraagHetZe-team
