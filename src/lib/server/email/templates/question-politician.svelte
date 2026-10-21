<script lang="ts">
  /* eslint-disable svelte/no-at-html-tags */
  type Props = {
    askerName: string;
    politicianName: string;
    questionTitle: string;
    questionBody: string;
    questionUrl: string;
    replyTo: string;
  };
	let { askerName, politicianName, questionTitle, questionBody, questionUrl, replyTo }: Props = $props();
</script>
Beste {politicianName},

{askerName} stelt u via VraagHetZe de volgende vraag:

----------
Onderwerp: {questionTitle}
{questionBody}
----------

U kunt antwoorden door simpelweg deze e-mail te beantwoorden of door uw antwoord te sturen naar {replyTo}

Uw antwoord wordt eerst door onze moderatoren gecontroleerd en verschijnt daarna openbaar bij de vraag op VraagHetZe ({@html questionUrl}).

Met vriendelijke groet,

Het VraagHetZe-team
