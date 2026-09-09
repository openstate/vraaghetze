<script lang="ts">
	import ContentPage from '$lib/components/content-page.svelte';
	import Links from '$lib/components/hoe-werk-het-links.svelte';

	const { data } = $props();
</script>

<Links selected="tips" />

<ContentPage title={data.meta.title}>

	<p>
		Het doel van een vraag stellen aan een Kamerlid is natuurlijk dat je een antwoord krijgt. Hoe zorg je er voor dat de
		kans dat je een antwoord krijgt toeneemt? Zie hier onze gouden tips!
	</p>

	<ul>
		<li>
			<strong>Zorg dat je vraag een vraag is.</strong> Deel je alleen je mening, dan is er niets om te antwoorden.
		</li>
		<li>
			<strong>Eén vraag per keer.</strong> Meerdere vragen in één bericht proppen maakt het lastig om volledig te antwoorden.
			Heb je meer vragen? Stel ze los van elkaar.
		</li>
		<li>
			<strong>Zoek eerst of je vraag al gesteld is.</strong> Grote kans dat iemand anders hetzelfde wilde weten, die vraag
			kan je dan volgen zodat je hem zelf niet nog eens hoeft te stellen.
		</li>
		<li>
			<strong>Blijf bij feiten, niet bij aannames.</strong> Baseer je vraag op wat er echt gebeurd of gezegd is. Voeg
			eventueel bronnen toe ter ondersteuning.
		</li>
		<li>
			<strong>Kritisch mag, onbeschoft niet.</strong> Een scherp vraag is prima, zolang die netjes blijft. Bekijk voor onze
			gedragsregels ons moderatiedocument.
		</li>
		<li>
			<strong>Kies het juiste Kamerlid.</strong> Binnen een fractie verdelen Kamerleden onderwerpen onderling. Stel je vraag
			aan het Kamerlid die bij de relevante commissie is aangesloten.
		</li>
		<li>
			<strong>Wees duidelijk.</strong> Vermijd vage formuleringen die moeilijk te begrijpen zijn of op meerdere manieren te
			lezen zijn. Laat het eventueel lezen door een ander ter controle.
		</li>
		<li>
			<strong>Spreek je verwachting uit.</strong> Wil je in de reactie een simpel "ja" of "nee" met een toelichting? Zet dat erbij.
		</li>
		<li>
			<strong>Lees eerst het partijprogramma.</strong> Misschien vind je daarin al het antwoord op je vraag. Grote kans dat het
			antwoord dat gegeven wordt letterlijk diezelfde tekst kopieert en plakt.
		</li>
	</ul>
</ContentPage>