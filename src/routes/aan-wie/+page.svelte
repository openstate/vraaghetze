<script lang="ts">
	import ContentPage from '$lib/components/content-page.svelte';
	import Links from '$lib/components/hoe-werk-het-links.svelte';

	const { data } = $props();
</script>

<Links selected="who" />

<ContentPage title={data.meta.title}>

	<p>
		Het is niet altijd makkelijk te bepalen aan wie je je vraag het beste kan stellen. Je richt je vraag bijna nooit aan een
		gehele fractie, maar een één van de individuele Kamerleden. Elk Kamerlid is namelijk verantwoordelijk voor bepaalde thema’s
		zoals de zorg, onderwijs en defensie. Hoe weet je nou welk Kamerlid over welk thema gaat?
	</p>

	<h2>Vaste Kamercommissies</h2>

	<p>
		We kunnen een redelijke inschatting maken door te kijken bij welke Vaste Kamercommissie een Kamerlid zit. Een Vaste
		Kamercommissie is een groep Kamerleden die zich bezighoudt met één onderwerp. Elke commissie bestaat uit Kamerleden
		van verschillende partijen.
	</p>

	<p>
		De commissie bespreekt plannen van de regering over dat onderwerp. Ze stellen vragen aan de minister en ze bereiden debatten
		voor die later in de Tweede Kamer plaatsvinden. Op deze manier kan de minister inschatten of er een meerderheid in de Tweede Kamer
		zal zijn voor een bepaald standpunt. Zo niet, dan kan hij het aanpassen.
	</p>

	<p>
		Een Kamerlid zit meestal in meerdere commissies tegelijk. Wanneer een fractie weinig leden heeft, dan zitten de Kamerleden
		van die fracties in veel commissies. Als een fractie groter is kunnen de commissies verdeel worden onder meer Kamerleden.
	</p>

	<p>
		Voor VraagHetZe is dit handig om te weten: als iemand bijvoorbeeld een vraag heeft over de wooncrisis, kun je kijken welke
		Kamerleden in de commissie Wonen zitten. Zij houden zich actief met dat onderwerp bezig en kunnen het beste jouw vraag beantwoord.
	</p>

	<h2>Overzicht Vaste Kamercommissie</h2>

	<p>
		TODO
	</p>


	<h2>Heb je hulp nodig?</h2>

	<p>
		Weet je alsnog niet bij welk Kamerlid je moet zijn? Bijvoorbeeld omdat je niet goed weet bij welke Vaste Kamercommissie het
		onderwerp van jouw vraag past? Wij helpen je graag verder! Stuur je vraag op naar
		<a href="mailto:contact@openstate.eu" class="hover:underline">contact@openstate.eu</a> en we zoeken samen
		uit welk Kamerlid het beste een antwoord op jouw vraag kan geven.
	</p>

</ContentPage>