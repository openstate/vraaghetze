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

De vraag "{questionTitle}" die je volgt is beantwoord door {politicianName}. Je kunt het antwoord lezen op ${questionUrl}.

Met vriendelijke groet,

Het VraagHetZe-team
