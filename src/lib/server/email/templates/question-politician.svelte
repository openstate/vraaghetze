<script lang="ts">
  type Props = {
    askerName: string,
    politicianName: string,
    questionTitle: string,
    questionBody: string
    questionUrl: string
  };
	let { askerName, politicianName, questionTitle, questionBody, questionUrl }: Props = $props();
</script>
Beste {politicianName},

{askerName} stelt u via VraagHetZe de volgende vraag:

----------
Onderwerp: {questionTitle}
{questionBody}
----------

U kunt antwoorden door simpelweg deze e-mail te beantwoorden. Uw antwoord wordt eerst door onze moderatoren
gecontroleerd en verschijnt daarna openbaar bij de vraag op VraagHetZe ({questionUrl}).

Met vriendelijke groet,

Het VraagHetZe-team
