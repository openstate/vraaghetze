<script lang="ts">
  type Props = {
    askerName: string,
    politicianName: string,
    questionTitle: string,
    questionBody: string
  };
	let { askerName, politicianName, questionTitle, questionBody }: Props = $props();
</script>
Beste {askerName},

Bedankt voor je vraag "{questionTitle}" aan {politicianName} op VraagHetZe met als inhoud:
----------
{questionBody}
----------

Na controle voldoet je vraag helaas niet aan onze moderatierichtlijnen: TODO

Je bent van harte welkom om een nieuwe vraag te stellen. Houd daarbij rekening met ons richtlijnen, dan is de kans groter dat je vraag wél wordt doorgestuurd naar een Kamerlid.

Heb je vragen over deze beslissing? Neem gerust contact met ons op via contact@openstate.eu. 

Met vriendelijke groet,

Het VraagHetZe-team
