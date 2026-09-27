<script lang="ts">
  type Props = {
    askerName: string,
    politicianName: string,
    questionTitle: string,
    questionUrl: string
  };
	let { askerName, politicianName, questionTitle, questionUrl }: Props = $props();
</script>
Beste {askerName},

Je vraag "{questionTitle}" is beantwoord door {politicianName}. Na de officiële lancering van VraagHetZe op 28 september kun je het antwoord lezen op {@html questionUrl}.

Met vriendelijke groet,

Het VraagHetZe-team
