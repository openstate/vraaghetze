<script lang="ts">
  type Props = {
    askerName: string,
    politicianName: string,
    proposedPoliticianName: string,
    questionTitle: string,
    questionUrl: string,
    approvalUrl: string,
    valid: number
  };
	let { askerName, politicianName, proposedPoliticianName, questionTitle, questionUrl, approvalUrl, valid }: Props = $props();
</script>
Beste {askerName},

Bedankt voor je vraag "{questionTitle}" aan {politicianName} op VraagHetZe ({@html questionUrl}).

Je vraag is aan het verkeerde Kamerlid gesteld. {politicianName} gaat niet over dit onderwerp. We stellen voor je vraag aan {proposedPoliticianName} te stellen, omdat dit Kamerlid verantwoordelijk is voor het betreffende onderwerp binnen de fractie.

Graag horen we je of je ons toestemming geeft jouw vraag door te sturen naar het juiste Kamerlid. Je kunt toestemming geven via de volgende link en daar "Ja" of "Nee" te kiezen: {@html approvalUrl}. Deze link is {valid} dagen geldig.

Met vriendelijke groet,

Het VraagHetZe-team
