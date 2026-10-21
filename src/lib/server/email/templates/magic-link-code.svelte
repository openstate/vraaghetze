<script lang="ts">
  /* eslint-disable svelte/no-at-html-tags */
  type Props = {
    code: string;
  };
	let { code }: Props = $props();
</script>
Beste gebruiker,

Hierbij de code om in te loggen: {@html code}

Als je geen inlogcode hebt aangevraagd kun je deze e-mail negeren.

Met vriendelijke groet,

Het VraagHetZe-team
