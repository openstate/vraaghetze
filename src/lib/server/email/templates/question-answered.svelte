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

Je vraag "{questionTitle}" is beantwoord door {politicianName}. Je kunt het antwoord lezen op {@html questionUrl}.

Met vriendelijke groet,

Het VraagHetZe-team
