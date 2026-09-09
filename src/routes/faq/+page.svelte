<script lang="ts">
	import ContentPage from '$lib/components/content-page.svelte';
	import Links from '$lib/components/hoe-werk-het-links.svelte';

	const { data } = $props();
</script>

<Links selected="faq" />

<ContentPage title={data.meta.title}>

	<h2>Krijg ik gegarandeerd antwoord op mijn vraag?</h2>

	<p>
		Wij kunnen niet garanderen dat vragen een antwoord ontvangen. Ondanks de functie van Kamerleden als volksvertegenwoordigers
		en daarmee goed contact met burgers, is deelname van Kamerleden vrijwillig en bepalen zij zelf of ze antwoord geven of niet.
		Daarnaast is het goed om er rekening mee te houden dat het wat langer kan duren voor jouw vraag een antwoord krijgt, vanwege
		de grote werkdruk en vele mails die politici op een dag binnenkrijgen.
	</p>

	<h2>Waarom worden alle vragen gemodereerd?</h2>

	<p>
		Wij willen voorkomen dat vragen vol staan met gescheld, spam of reclame. Op deze manier willen we een fijne plek bieden waar
		het gesprek focust op de inhoud. Dit is fijn voor de gebruikers en voor Kamerleden. Op deze manier zorgen we ervoor dat
		Kamerleden die vrijwillig antwoord geven via VraagHetZe dat ook blijven doen. Daarnaast zijn we onder de Digital Service Act
		verplicht om contentmoderatie toe te passen.
	</p>

	<h2>Worden de antwoorden van Kamerleden ook gemodereerd?</h2>

	<p>
		Nee, antwoorden van Kamerleden worden niet gemodereerd. Zij hebben een publieke functie en wij vinden het niet bij onze rol
		passen om hun antwoorden te filteren. Wij vinden het juist belangrijk dat deze zonder filter geplaatst worden. Het evalueren
		van de vragen laten we graag aan gebruikers zelf over.
	</p>

	<h2>Doen alle Kamerleden mee?</h2>

	<p>
		We hebben voor alle Tweede Kamerleden een account aangemaakt op basis van openbare informatie. In die zin doen zij automatisch
		mee, tenzij ze expliciet bezwaar maken. Wanneer een Kamerlid geen vragen wil ontvangen wordt dit aangegeven op zijn of haar
		profiel. Het is dan niet mogelijk vragen te stellen aan het betreffende Kamerlid.
	</p>

	<h2>Ik ben het niet eens met een moderatiekeuze, hoe kan ik bezwaar maken?</h2>

	<p>TODO</p>
</ContentPage>