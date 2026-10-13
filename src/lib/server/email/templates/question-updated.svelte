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

Je vraag "{questionTitle}" heeft een voorlopig antwoord van {politicianName}.

Je kunt het antwoord lezen op {@html questionUrl} Dit is nog niet het definitieve
antwoord en is alleen door jou in te zien.

Met vriendelijke groet,

Het VraagHetZe-team
