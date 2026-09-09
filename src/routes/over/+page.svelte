<script lang="ts">
	import ContentPage from '$lib/components/content-page.svelte';

	const { data } = $props();
</script>

<ContentPage title={data.meta.title}>
	<h2>Vragen aan de politiek, publiek beantwoord</h2>

	<p>
		VraagHetZe is het platform waar iedereen een vraag kan stellen aan een Tweede Kamerlid en waar het
		antwoord voor iedereen zichtbaar is. Geen mailtjes die verdwijnen in een inbox, maar een open en
		constructief gesprek tussen burger en volksvertegenwoordiger.
	</p>

	<h2>Waarom dit nu nodig is</h2>

	<p>
		Het vertrouwen van burgers in de politiek staat onder druk. Online speelt het debat zich vooral af
		op sociale media, waar nuance het verliest van grof taalgebruik en haatreacties. Wie een Kamerlid
		rechtstreeks mailt, krijgt vaak geen antwoord. Veel Kamerleden krijgen namelijk dagelijks meer dan honderd mails.
	</p>
	<p>
		Het gevolg is dat Kamerleden onbereikbaar en ver weg voelen. Tegelijkertijd missen Kamerleden een directe,
		serieuze plek om hun ideeën uit te leggen.
	</p>

	<h2>Hoe VraagHetZe de oplossing biedt</h2>

	<p>
		De vragen en antwoorden zijn openbaar, gemodereerd en voor iedereen zichtbaar en doorzoekbaar. Dat lost
		drie dingen op:
	</p>

	<ul>
		<li>
			<strong>Een constructief gesprek.</strong> Wij publiceren alleen nette vragen zodat het gesprek
			inhoudelijk blijft en niet vervalt in grof taalgebruik. Zo bieden wij een daadwerkelijk alternatief
			voor sociale media, waar de gene die het hardst schreeuwt juist wordt beloond.
		</li>
		<li>
			<strong>Meerdere personen in één keer beantwoord.</strong> Normaal beantwoordt een Kamerlid dezelfde
			vraag keer op keer apart, aan elke individuele afzender in haar inbox. Vanwege het openbare karakter
			hoeft dat op VraagHetZe maar één keer: gebruikers die de vraag volgen krijgen het antwoord automatisch
			zodra het er is.
		</li>
		<li>
			<strong>Gelijke toegang tot de politiek.</strong> Veel mensen denken dat het onmogelijk is om in
			contact te komen met een Tweede Kamerlid, terwijl juist de taak is van een Kamerlid om in gesprek
			te blijven met burgers. VraagHetZe maakt het makkelijk voor iedereen om een vraag te stellen aan de politiek.
		</li>
	</ul>

	<h2>Een idee van Open State Foundation</h2>

	<p>
		VraagHetZe is een initiatief van Open State Foundation. Het idee ontstond tijdens onze wekelijkse
		"nieuwe dingen sessie", een vast moment waarop we onze creativiteit de vrije loop laten. Het doel van
		Open State is om bij te dragen aan een digitaal transparante overheid en daarmee een gezonde en vitale
		democratie. VraagHetZe vloeit voort uit dit gedachtegoed.
	</p>

	<h2>Financiering</h2>

	<p>
		VraagHetZe wordt mede mogelijk gemaakt door het SIDN Fonds, vanuit de call "Van liken naar luisteren" en door
		het Vfonds.
	</p>
</ContentPage>
