<script lang="ts">
  type Props = {
    followerName: string,
    politicianName: string,
    questionTitle: string,
    questionUrl: string
  };
	let { followerName, politicianName, questionTitle, questionUrl }: Props = $props();
</script>
Beste {followerName},

De vraag "{questionTitle}" die je volgt is beantwoord door {politicianName}. Na de officiële lancering van VraagHetZe op 28 september kun je het antwoord lezen op {@html questionUrl}.

Met vriendelijke groet,

Het VraagHetZe-team
