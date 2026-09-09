<script lang="ts">
	import ContentPage from '$lib/components/content-page.svelte';
	import Links from '$lib/components/hoe-werk-het-links.svelte';

	const { data } = $props();
</script>

<Links selected="how" />

<ContentPage title={data.meta.title}>
	<p>
		Een vraag stellen via VraagHetZe is niet moeilijk. Hier leggen we je stap-voor-stap uit hoe het werkt.
	</p>

	<h2>1. Zoek het juiste Kamerlid</h2>

	<p>
		Elk Kamerlid is verantwoordelijk voor specifieke onderwerpen, zoals zorg, wonen of defensie. Die onderwerpen zijn weer
		ondergebracht in vaste Kamercommissie en een Kamerlid behandelt de onderwerpen van de commissies waar hij in zit. Blader
		door de Tweede Kamer en filter op commissie of fractie, zodat je vraag terechtkomt bij het Kamerlid dat er echt verstand van
		heeft. Weet je niet bij welke vaste Kamercommissie je vraag hoort? Kijk dan op onze pagina over vaste Kamercommissies.
	</p>

	<h2>2. Stel je vraag</h2>

	<p>
		Schrijf je vraag kort en duidelijk, in je eigen woorden. We controleren elke vraag voordat hij online komt: het moet echt een
		vraag zijn (geen mening), gebaseerd op feiten en netjes geformuleerd. Zo blijft het gesprek constructief. Hier lees je al onze
		tips over het stellen van een goede vraag.
	</p>

	<h2>3. Lees mee met anderen</h2>

	<p>
		Grote kans dat iemand anders eerder hetzelfde wilde weten en de vraag al gesteld heeft. Blader door de vragen die al gesteld
		zijn en ontdek wat er speelt. Vind je een vraag interessant? Volg hem, dan hoor je het zodra er antwoord is.
	</p>

	<h2>4. Je krijgt antwoord</h2>

	<p>
		Het Kamerlid antwoordt publiekelijk, zichtbaar voor iedereen die hetzelfde wil weten. Geen mailtje dat verdwijnt in een
		overvolle inbox, maar een open gesprek tussen burger en volksvertegenwoordiger.
	</p>

	<p>
		Een Kamerlid heeft het vaak druk, dus een antwoord kan even duren. Nog geen reactie na twee weken? Dan sturen wij een
		herinnering.
	</p>
</ContentPage>