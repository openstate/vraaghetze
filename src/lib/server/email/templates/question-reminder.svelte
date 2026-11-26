<script lang="ts">
  /* eslint-disable svelte/no-at-html-tags */
  type Props = {
    askerName: string;
    politicianName: string;
    questionTitle: string;
    questionBody: string;
    questionUrl: string;
    questionDate: string;
    replyTo: string;
    followers: number;
  };
	let { askerName, politicianName, questionTitle, questionBody, questionUrl, questionDate, replyTo, followers }: Props = $props();
</script>
<p>
Beste {politicianName},
</p>

<p>
Hierbij een vriendelijke herinnering aan de onbeantwoorde vraag van {askerName}, die u via VraagHetZe de volgende vraag heeft gesteld op {questionDate}:
</p>

<p>
----------<br>
Onderwerp: {questionTitle}<br>
{questionBody}<br>
----------
</p>

{#if followers > 1}
<p>
Er zijn {followers} personen geïnteresseerd in het antwoord op deze vraag.
</p>
{/if}

<p>U kunt antwoorden door simpelweg deze e-mail te beantwoorden of door uw antwoord te sturen naar {replyTo}</p>

<p>Uw antwoord wordt eerst door onze moderatoren gecontroleerd en verschijnt daarna openbaar bij de vraag op VraagHetZe ({@html questionUrl}).</p>

<p>Met vriendelijke groet,</p>

<p>Het VraagHetZe-team</p>
