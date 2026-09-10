<script lang="ts">
  type Props = {
    askerName: string,
    politicianName: string,
    questionTitle: string,
    questionUrl: string,
    moderationUrl: string
  };
	let { askerName, politicianName, questionTitle, questionUrl, moderationUrl }: Props = $props();
</script>
Beste {askerName},

Bedankt voor je vraag "{questionTitle}" aan {politicianName} op VraagHetZe. Je kunt je vraag alvast teruglezen op VraagHetZe ({@html questionUrl}).

We controleren nu of je vraag voldoet aan onze moderatierichtlijnen ({@html moderationUrl}). Dat doen we bij elke vraag, om het gesprek constructief en op de inhoud te houden. Wij streven ernaar dit zo snel mogelijk te doen, en uiterlijk binnen vijf werkdagen. Zodra je vraag is goedgekeurd, gaat hij naar {politicianName} en wordt hij openbaar gepubliceerd op het platform.

Je hoort van ons zodra je vraag gecontroleerd is.

Met vriendelijke groet,

Het VraagHetZe-team
