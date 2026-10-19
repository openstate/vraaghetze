<script lang="ts">
	import { formatDate } from "$lib/date-time";
	import { question } from "$lib/server/db/app.schema";

  type Props = {
    askerName: string;
    politicianName: string;
    questionTitle: string;
    questionBody: string;
    questionUrl: string;
    questionDate: string;
  };
	let { askerName, politicianName, questionTitle, questionBody, questionUrl, questionDate }: Props = $props();
</script>
Beste {politicianName},

Hierbij een vriendelijke herinnering aan de onbeantwoorde vraag van {askerName}, die u via VraagHetZe de volgende vraag heeft gesteld op {questionDate}:

----------
Onderwerp: {questionTitle}
{questionBody}
----------

U kunt antwoorden door simpelweg deze e-mail te beantwoorden. Uw antwoord wordt eerst door onze moderatoren gecontroleerd en verschijnt daarna openbaar bij de vraag op VraagHetZe ({@html questionUrl}).

Met vriendelijke groet,

Het VraagHetZe-team
