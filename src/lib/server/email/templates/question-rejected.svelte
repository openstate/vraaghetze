<script lang="ts">
  type Props = {
    askerName: string,
    politicianName: string,
    questionTitle: string,
    questionBody: string,
    moderationUrl: string,
    rejectionReasons: string[]
  };
	let { askerName, politicianName, questionTitle, questionBody, moderationUrl, rejectionReasons }: Props = $props();
</script>
<svelte:options preserveWhitespace={true} />
Beste {askerName},

Bedankt voor je vraag "{questionTitle}" aan {politicianName} op VraagHetZe met als inhoud:
----------
{questionBody}
----------

Na controle voldoet je vraag helaas niet aan onze moderatierichtlijnen om de volgende redenen:

{#each rejectionReasons as reason}
- {reason}
{/each}

Je bent van harte welkom om een nieuwe vraag te stellen. Houd daarbij rekening met ons richtlijnen ({@html moderationUrl}), dan is de kans groter dat je vraag wél wordt doorgestuurd naar een Kamerlid.

Heb je vragen over deze beslissing? Neem gerust contact met ons op via contact@openstate.eu. 

Met vriendelijke groet,

Het VraagHetZe-team
