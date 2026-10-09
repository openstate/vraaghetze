<script lang="ts">
  type Props = {
    askerName: string,
    politicianName: string,
    proposedPoliticianName: string,
    questionTitle: string,
    approvalUrl: string
  };
	let { askerName, politicianName, proposedPoliticianName, questionTitle, approvalUrl }: Props = $props();
</script>
Beste {askerName},

Bedankt voor je vraag "{questionTitle}" aan {politicianName} op VraagHetZe.

Je vraag is gesteld aan een Kamerlid die geen woordvoerder is op het onderwerp van jouw vraag. Dit gebeurt regelmatig en wij proberen vanuit VraagHetZe hier een handje bij te helpen, zodat de vraag terecht komt bij het Kamerlid dat inhoudelijk het beste kan reageren op jouw vraag.

Wij stellen voor jouw vraag aan {proposedPoliticianName} door te sturen, omdat dit Kamerlid verantwoordelijk is voor het betreffende onderwerp binnen de fractie. Graag horen we of je ons toestemming geeft jouw vraag door te sturen naar het juiste Kamerlid. Je kunt toestemming geven via de volgende link en daar "Ja" of "Nee" te kiezen: {@html approvalUrl}

Mocht je heel bewust gekozen hebben jouw vraag aan {politicianName} te stellen, zouden we graag een korte toelichting ontvangen zodat we hier naar kunnen kijken.

We proberen op deze manier Kamerleden te ontlasten én daarmee de kans te vergroten dat gebruikers een reactie op hun vraag krijgen.

Met vriendelijke groet,

Het VraagHetZe-team
