<script lang="ts">
  /* eslint-disable svelte/no-at-html-tags */
  type Props = {
    followerName: string;
    politicianName: string;
    questionTitle: string;
    questionUrl: string;
  };
	let { followerName, politicianName, questionTitle, questionUrl }: Props = $props();
</script>
Beste {followerName},

De vraag "{questionTitle}" die je volgt is beantwoord door {politicianName}. Je kunt het antwoord lezen op {@html questionUrl}

Met vriendelijke groet,

Het VraagHetZe-team
