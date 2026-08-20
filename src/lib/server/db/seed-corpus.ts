// LLM-generated seed script for development only
// All content in this file is entirely fictional

export type SeedQuestion = { title: string; body: string };

export type SeedTopic = {
	key: string;
	label: string;
	questions: SeedQuestion[];
	// topic specific answer cores, wrapped in a voice by seed.ts
	answers: string[];
};

export const topics: SeedTopic[] = [
	{
		key: 'huurprijzen',
		label: 'huurprijzen',
		questions: [
			{
				title: 'Waarom blijven de huren in de vrije sector zo hard stijgen?',
				body: 'Ik betaal inmiddels 1.150 euro voor 42 vierkante meter in Utrecht. Elk jaar komt de maximale verhoging erbij terwijl er niets aan de woning gebeurt. Wat gaat u daar concreet aan doen?'
			},
			{
				title: 'Komt er een maximum aan de jaarlijkse huurverhoging?',
				body: 'Mijn verhuurder rekent de inflatie plus een opslag door. Voor mij betekent dat elk jaar honderden euro’s extra, terwijl mijn loon veel minder hard stijgt.'
			},
			{
				title: 'Hoe voorkomt u dat verhuurders de puntentelling omzeilen?',
				body: 'Er wordt een gemeubileerd contract aangeboden voor 300 euro extra, en zo valt de woning ineens buiten de regulering. Ziet u dit ook gebeuren?'
			},
			{
				title: 'Wat vindt u ervan dat middenhuur in de grote steden onbetaalbaar is geworden?',
				body: 'Leraren, verpleegkundigen en agenten kunnen niet meer in de stad wonen waar ze werken. Dat lijkt me een probleem voor de stad zelf, niet alleen voor hen.'
			},
			{
				title: 'Waarom worden tijdelijke huurcontracten nog steeds zo veel gebruikt?',
				body: 'Ik ben in vier jaar drie keer verhuisd omdat het contract afliep. Je bouwt zo niets op en durft nooit iets te zeggen over achterstallig onderhoud.'
			},
			{
				title: 'Gaat de huurtoeslag mee omhoog met de werkelijke woonlasten?',
				body: 'De huurtoeslag dekt bij lange na niet meer wat ik kwijt ben. Wordt de systematiek herzien of blijft het bij losse reparaties?'
			},
			{
				title: 'Wat doet u tegen huisjesmelkers die achterstallig onderhoud laten liggen?',
				body: 'Bij ons in het pand is de cv al twee winters kapot. De verhuurder reageert niet en de gemeente zegt geen capaciteit te hebben om te handhaven.'
			},
			{
				title: 'Hoe kijkt u aan tegen het opkopen van huurwoningen door beleggers?',
				body: 'In mijn straat zijn de laatste jaren zeven woningen door dezelfde partij gekocht en direct doorverhuurd. Vindt u dat wenselijk?'
			}
		],
		answers: [
			'De huurprijzen in de vrije sector zijn de afgelopen jaren sneller gestegen dan de lonen, en dat is precies waarom mijn fractie voor regulering van de middenhuur heeft gestemd. Wij willen de puntentelling doortrekken tot ver boven de huidige grens, zodat een woning niet ineens uit de bescherming valt.',
			'Ik deel uw zorg over de betaalbaarheid. Tegelijk moeten we oppassen dat we investeerders niet zo hard raken dat er helemaal geen nieuwe huurwoningen meer bijkomen; het aanbod is uiteindelijk de kern van het probleem. Ik zet daarom vooral in op bouwen, bouwen en nog eens bouwen.',
			'Wat u beschrijft, het omzeilen van de regulering via meubilering en servicekosten, is bij ons bekend. Ik heb hierover schriftelijke vragen gesteld en de minister gevraagd om de Huurcommissie meer ruimte te geven om zulke constructies terug te draaien.',
			'Het gebruik van tijdelijke contracten is met de Wet vaste huurcontracten fors beperkt, maar de handhaving blijft achter. Ik vind dat gemeenten daar geld en menskracht voor moeten krijgen, en niet alleen een bevoegdheid op papier.'
		]
	},
	{
		key: 'woningtekort',
		label: 'woningtekort',
		questions: [
			{
				title: 'Hoe gaat u het woningtekort onder starters oplossen?',
				body: 'Ik ben 29, werk fulltime en kom er alsnog niet tussen. Alles onder de vier ton is binnen een week weg en dan nog fors overboden.'
			},
			{
				title: 'Waarom lukt het al jaren niet om de bouwdoelstelling te halen?',
				body: 'Elk kabinet belooft honderdduizend woningen per jaar en elk jaar wordt dat niet gehaald. Waar loopt het volgens u precies vast?'
			},
			{
				title: 'Wat vindt u van het idee om de overdrachtsbelasting voor starters af te schaffen?',
				body: 'De vrijstelling geldt nu tot een bepaalde grens, maar die grens ligt onder de gemiddelde starterswoning in de Randstad.'
			},
			{
				title: 'Waarom wordt er zo weinig gebouwd voor eenpersoonshuishoudens?',
				body: 'Bijna de helft van de huishoudens bestaat uit één persoon, maar er worden vooral eengezinswoningen gebouwd. Klopt dat beeld?'
			},
			{
				title: 'Kunnen gemeenten verplicht worden om bouwlocaties aan te wijzen?',
				body: 'Mijn gemeente houdt al tien jaar een weiland leeg vanwege „ruimtelijke kwaliteit” terwijl de wachtlijst voor sociale huur op elf jaar staat.'
			},
			{
				title: 'Hoe kijkt u aan tegen flexwoningen als tijdelijke oplossing?',
				body: 'In onze wijk zijn er tweehonderd geplaatst voor tien jaar. Ik vraag me af wat er daarna gebeurt met die mensen en met die grond.'
			},
			{
				title: 'Wat gaat u doen aan het tekort aan bouwvakkers en installateurs?',
				body: 'Zelfs als de vergunningen er zijn, is er geen personeel. Zonder mensen komen er geen woningen, hoeveel plannen we ook maken.'
			},
			{
				title: 'Waarom duurt een bouwvergunning zo lang?',
				body: 'Een kennis van mij wacht al tweeënhalf jaar op een vergunning voor het splitsen van een pand in twee woningen. Kan dat niet sneller?'
			}
		],
		answers: [
			'Het woningtekort staat inmiddels op ruim vierhonderdduizend woningen en dat los je niet op met één maatregel. Mijn fractie zet in op vaste locaties die het Rijk zelf aanwijst, kortere procedures en een fonds waarmee gemeenten de onrendabele top kunnen dekken.',
			'U raakt aan de kern: de plannen zijn er wel, maar de uitvoering hapert. Netaansluitingen, personeel en stikstofruimte zijn nu vaker het knelpunt dan de vergunning zelf. Ik pleit ervoor dat het Rijk regie neemt in plaats van te wachten op de markt.',
			'Ik ben het met u eens dat starters klem zitten. Tegelijk waarschuw ik voor maatregelen die alleen de vraag stimuleren, zoals een ruimere vrijstelling: die verdwijnen in de praktijk in de prijs. Bouwen is het enige dat structureel helpt.',
			'Voor eenpersoonshuishoudens en voor ouderen die willen doorstromen wordt te weinig gebouwd. Ik heb een motie gesteund die gemeenten vraagt om in hun woonvisie expliciet ruimte te maken voor kleinere en betaalbare woningtypen.'
		]
	},
	{
		key: 'stikstof',
		label: 'de stikstofaanpak',
		questions: [
			{
				title: 'Hoe kijkt u aan tegen de aanpak van de stikstofcrisis?',
				body: 'Als leek zie ik vooral rechtszaken en uitgestelde besluiten. Wat is volgens u de kortste weg naar een uitspraak waar iedereen mee verder kan?'
			},
			{
				title: 'Waarom komt er geen duidelijkheid voor boeren die willen stoppen?',
				body: 'Mijn buren wachten al twee jaar op zekerheid over de opkoopregeling. Ondertussen kunnen ze geen investering meer doen en ook niet stoppen.'
			},
			{
				title: 'Wat betekent het stikstofbeleid voor de vergunningverlening van woningbouw?',
				body: 'Er wordt gezegd dat woningbouw maar een klein deel van de uitstoot is, maar projecten liggen wel stil. Hoe zit dat precies?'
			},
			{
				title: 'Vindt u dat de kritische depositiewaarde uit de wet moet?',
				body: 'Ik lees dat de KDW een juridisch anker is en tegelijk dat die niet houdbaar zou zijn. Wat is uw positie daarin?'
			},
			{
				title: 'Waarom wordt er zo weinig gedaan met innovatie in stalsystemen?',
				body: 'Er zijn emissiearme stallen die in de rechtszaal sneuvelden omdat de metingen niet klopten. Wie draait er dan op voor die investering?'
			},
			{
				title: 'Welke rol speelt de industrie in de stikstofuitstoot?',
				body: 'Het gesprek gaat bijna altijd over de landbouw. Hoe groot is het aandeel van de industrie en het verkeer, en wat vraagt u van die sectoren?'
			},
			{
				title: 'Hoe voorkomt u dat natuurherstel opnieuw wordt uitgesteld?',
				body: 'Elke keer als er geld is, blijkt de uitvoering niet klaar. Wat gaat er nu anders dan bij de vorige programma’s?'
			},
			{
				title: 'Is er nog draagvlak voor gedwongen uitkoop?',
				body: 'In mijn dorp is de sfeer omgeslagen sinds dat woord viel. Ik vraag me af of dit instrument nog realistisch is.'
			}
		],
		answers: [
			'De stikstofimpasse kost ons inmiddels vergunningen voor woningen, wegen en verduurzaming tegelijk. Ik vind dat we moeten sturen op de daadwerkelijke emissie in plaats van op modellen die per hectare verschillen, en dat we boeren die willen stoppen binnen een halfjaar duidelijkheid moeten geven.',
			'U vraagt naar de verdeling. De landbouw is verantwoordelijk voor het grootste deel van de neerslag op stikstofgevoelige natuur, maar industrie, verkeer en luchtvaart leveren ook een bijdrage die niet buiten schot mag blijven. Mijn fractie vraagt om afrekenbare doelen per sector.',
			'Dat ondernemers investeerden in emissiearme stallen en daarna in de rechtszaal alsnog nul op het rekest kregen, vind ik onverteerbaar. De overheid heeft die systemen zelf goedgekeurd en hoort de rekening niet eenzijdig bij de boer te leggen.',
			'Natuurherstel is geen bijzaak van dit dossier, het is de kern ervan. Zonder herstelde natuur komt er nooit vergunningsruimte vrij. Ik dring aan op meerjarige zekerheid voor terreinbeheerders, zodat zij niet elk jaar opnieuw hoeven te bedelen om budget.'
		]
	},
	{
		key: 'klimaat',
		label: 'het klimaatbeleid',
		questions: [
			{
				title: 'Wat vindt u van het klimaatbeleid van dit kabinet?',
				body: 'Er worden doelen gesteld voor 2040 en 2050, maar wat er dit jaar gebeurt blijft vaag. Waar zit volgens u het grootste gat tussen doel en uitvoering?'
			},
			{
				title: 'Waarom betalen huishoudens relatief meer klimaatbelasting dan de industrie?',
				body: 'Ik lees dat de energiebelasting voor grootverbruikers per kilowattuur veel lager ligt. Klopt dat en vindt u dat rechtvaardig?'
			},
			{
				title: 'Hoe houdt u de energierekening betaalbaar tijdens de energietransitie?',
				body: 'Mijn huis heeft label F en ik huur. Ik kan zelf niets isoleren, maar ik betaal wel de rekening.'
			},
			{
				title: 'Welke concrete stappen zet u rond klimaatadaptatie in steden?',
				body: 'Onze straat stond vorige zomer twee keer blank en in juli was het binnen 34 graden. Er is nauwelijks groen.'
			},
			{
				title: 'Vindt u kernenergie een noodzakelijk onderdeel van de energiemix?',
				body: 'De discussie gaat vooral over kosten en doorlooptijd. Wat is volgens u realistisch vóór 2040?'
			},
			{
				title:
					'Waarom gaat de subsidie op warmtepompen vooral naar mensen die het al kunnen betalen?',
				body: 'Je moet eerst duizenden euro’s voorschieten. Wie dat niet heeft, blijft achter met een oude cv-ketel en een hoge rekening.'
			},
			{
				title: 'Wat doet u aan de uitstoot van de luchtvaart?',
				body: 'Er wordt veel gesproken over vliegtaks en bijmengen van duurzame brandstof, maar de groei van Schiphol gaat gewoon door.'
			},
			{
				title: 'Hoe voorkomt u dat klimaatbeleid de tweedeling vergroot?',
				body: 'Mensen met een koophuis en een auto van de zaak profiteren van vrijwel elke regeling. Mensen in een huurflat niet.'
			}
		],
		answers: [
			'Het klimaatbeleid staat of valt met uitvoerbaarheid. Ik vind dat we minder tijd moeten besteden aan nieuwe doelen en meer aan de vraag waarom bestaande maatregelen blijven liggen: te weinig installateurs, een overvol stroomnet en subsidies die niet terechtkomen bij wie ze het hardst nodig heeft.',
			'U snijdt een punt aan waar mijn fractie al jaren op hamert: de lastenverdeling. Een huishouden betaalt per kilowattuur een veelvoud van wat een grootverbruiker betaalt. Wij hebben voorgesteld die staffel af te vlakken en de opbrengst terug te geven via een lagere vaste voet.',
			'Voor huurders is de transitie op dit moment vooral een rekening zonder invloed. Daarom steun ik een isolatienorm voor verhuurders met een harde einddatum, gekoppeld aan een verbod om woningen met label E, F of G nog te verhuren.',
			'Kernenergie kan een rol spelen in de basislast, maar ik wil eerlijk zijn over het tijdpad: vóór 2040 draagt geen nieuwe centrale substantieel bij. Wat we tot die tijd doen met wind, zon, opslag en besparing bepaalt of we onze doelen halen.'
		]
	},
	{
		key: 'netcongestie',
		label: 'netcongestie',
		questions: [
			{
				title: 'Wat gaat u doen aan de netcongestie op het elektriciteitsnet?',
				body: 'Ons bedrijventerrein staat al drie jaar op de wachtlijst voor een zwaardere aansluiting. Uitbreiden kan niet, verduurzamen ook niet.'
			},
			{
				title: 'Waarom kan een nieuwe school geen zwaardere netaansluiting krijgen?',
				body: 'De school is klaar, de warmtepompen staan er, maar de aansluiting komt pas over vier jaar. Hoe kan dit gebeuren?'
			},
			{
				title: 'Hoe versnelt u de uitbreiding van het stroomnet?',
				body: 'Er wordt gezegd dat de netbeheerders niet aan personeel kunnen komen en dat procedures jaren duren. Wat kan de Kamer daaraan doen?'
			},
			{
				title: 'Vindt u dat huishoudens voorrang moeten krijgen op datacenters?',
				body: 'Bij schaarste moet er gekozen worden. Wie bepaalt die volgorde en op basis waarvan?'
			},
			{
				title: 'Waarom worden zonneparken aangelegd waar het net al vol zit?',
				body: 'Bij ons in de polder ligt een park dat regelmatig wordt afgeschakeld. Dat lijkt me weggegooid geld.'
			},
			{
				title: 'Wat vindt u van flexibele contracten met een lager tarief buiten de piek?',
				body: 'Ik zou best mijn wasmachine ’s nachts aanzetten, maar mijn leverancier biedt zoiets niet aan.'
			},
			{
				title: 'Hoe zorgt u dat batterijopslag sneller van de grond komt?',
				body: 'Opslag lijkt de logische oplossing voor de pieken, maar de businesscase klopt kennelijk niet door de nettarieven.'
			},
			{
				title: 'Loopt de verduurzaming van het mkb vast op de netaansluiting?',
				body: 'Mijn bakkerij wil van het gas af, maar dan heb ik meer vermogen nodig dan ik nu heb. Dat kan simpelweg niet.'
			}
		],
		answers: [
			'Netcongestie is inmiddels de grootste rem op verduurzaming in dit land. Ik zet in op drie dingen: voorrang voor maatschappelijke functies zoals scholen en ziekenhuizen, snellere procedures voor hoogspanningsverbindingen en een tariefstructuur die opslag en flexibiliteit beloont in plaats van bestraft.',
			'Het is pijnlijk dat een nieuw schoolgebouw jaren op stroom moet wachten. Er ligt nu een prioriteringskader waarmee netbeheerders van de volgorde van aanmelding mogen afwijken. Ik houd scherp in de gaten of dat in de praktijk ook echt gebeurt.',
			'Voor het mkb geldt dat de verduurzaming letterlijk vastloopt op een kabel. Mijn fractie heeft daarom gevraagd om standaard te onderzoeken of een bestaande aansluiting slimmer benut kan worden, bijvoorbeeld met een groepscontract op een bedrijventerrein.',
			'Uw voorbeeld van het afgeschakelde zonnepark laat zien dat we jarenlang hebben gesubsidieerd zonder naar het net te kijken. Nieuwe subsidies zouden wat mij betreft alleen nog moeten gaan naar projecten die de aansluiting op orde hebben of opslag meenemen.'
		]
	},
	{
		key: 'jeugdzorg',
		label: 'de jeugdzorg',
		questions: [
			{
				title: 'Wat vindt u van de wachtlijsten in de jeugdzorg?',
				body: 'Mijn dochter wacht al veertien maanden op behandeling voor een eetstoornis. In die tijd is het alleen maar erger geworden.'
			},
			{
				title: 'Waarom is de jeugdzorg na de decentralisatie duurder én slechter geworden?',
				body: 'Gemeenten kregen minder geld en meer taken. Was dat vooraf niet te voorzien?'
			},
			{
				title: 'Hoe stopt u de doorstroom van kinderen tussen instellingen?',
				body: 'Een pleegkind in onze familie heeft in drie jaar tijd zeven plekken gehad. Elke overplaatsing kost weer maanden vertrouwen.'
			},
			{
				title: 'Wat doet u tegen de winsten van commerciële jeugdzorgaanbieders?',
				body: 'Er verschijnen berichten over aanbieders met dubbele cijfers aan rendement terwijl er wachtlijsten zijn. Hoe kan dat?'
			},
			{
				title: 'Komt er een einde aan de aanbestedingscarrousel in de jeugdzorg?',
				body: 'Kleine aanbieders haken af omdat ze de administratie niet meer aankunnen. Daar verdwijnt juist de specialistische kennis.'
			},
			{
				title: 'Hoe houdt u jeugdbeschermers voor het vak behouden?',
				body: 'De caseload is te hoog en het verloop is enorm. Zonder mensen helpt geen enkele hervorming.'
			},
			{
				title: 'Waarom moeten ouders zelf de weg zoeken in het zorglandschap?',
				body: 'Wij hebben twee jaar zelf gebeld, gemaild en gezocht. Wie geen tijd of taalvaardigheid heeft, valt af.'
			},
			{
				title: 'Wat vindt u van gesloten jeugdzorg als uiterste middel?',
				body: 'Er wordt gestreefd naar afbouw, maar ondertussen zijn er kinderen die nergens terechtkunnen.'
			}
		],
		answers: [
			'Wat u beschrijft is precies waarom mijn fractie de Hervormingsagenda Jeugd te vrijblijvend vindt. Een wachttijd van veertien maanden bij een eetstoornis is geen wachtlijst meer, dat is een behandeling die te laat komt. Ik pleit voor landelijke inkoop van hoogspecialistische zorg, zodat gemeenten daar niet apart over hoeven te onderhandelen.',
			'De decentralisatie ging gepaard met een bezuiniging en met de aanname dat gemeenten dichter bij het gezin staan. Dat tweede klopt vaak, het eerste heeft de rest ondermijnd. Ik vind dat we eerlijk moeten zijn dat dit stelsel structureel meer geld kost dan begroot.',
			'Overplaatsingen zijn schadelijk en vaak vermijdbaar. Ik steun het voorstel om plaatsingen alleen nog te laten eindigen als er een vervolgplek is, en om pleegouders veel eerder in het besluit te betrekken.',
			'Over de winsten in de jeugdzorg heb ik samen met collega’s een initiatiefnota geschreven. Wij willen een norm voor maatschappelijk verantwoorde rendementen en een verbod op winstuitkering bij aanbieders die met wachtlijsten kampen.'
		]
	},
	{
		key: 'ouderenzorg',
		label: 'de ouderenzorg',
		questions: [
			{
				title: 'Waar moeten ouderen straks wonen als verpleeghuizen niet meebouwen?',
				body: 'Mijn moeder is 88 en woont alleen in een portiekflat zonder lift. Thuis blijven wonen klinkt mooi, maar het gaat niet.'
			},
			{
				title: 'Hoe voorkomt u dat mantelzorgers overbelast raken?',
				body: 'Ik zorg naast een baan van vier dagen voor mijn schoonvader. Er is respijtzorg op papier, maar niet in de praktijk.'
			},
			{
				title: 'Wat vindt u van het scheiden van wonen en zorg?',
				body: 'Voor mensen met een klein pensioen betekent dit dat ze de huur zelf moeten betalen. Is dat doordacht?'
			},
			{
				title: 'Waarom staan er zoveel bedden leeg door personeelstekort?',
				body: 'In het verpleeghuis hier in de buurt is een hele afdeling dicht terwijl er een wachtlijst is.'
			},
			{
				title: 'Hoe kijkt u aan tegen zorgtechnologie in de thuiszorg?',
				body: 'Beeldbellen met de wijkverpleging werkt voor mijn tante prima, maar niet iedereen kan met een tablet omgaan.'
			},
			{
				title: 'Wordt de wijkverpleging niet te veel wegbezuinigd?',
				body: 'De wijkverpleegkundige die alles overzag is verdwenen. Nu komen er zes verschillende mensen langs.'
			},
			{
				title: 'Wat doet u tegen eenzaamheid onder ouderen?',
				body: 'De buurthuizen zijn hier gesloten en het ouderenwerk is wegbezuinigd. Waar moeten mensen naartoe?'
			},
			{
				title: 'Waarom is de eigen bijdrage voor de Wmo zo onvoorspelbaar?',
				body: 'Het abonnementstarief zou het simpel maken, maar bij ons veranderde het bedrag drie keer in een jaar.'
			}
		],
		answers: [
			'Het aantal tachtigplussers verdubbelt de komende twintig jaar en het aantal verpleeghuisplaatsen niet. Dat gat is te groot om met thuiszorg alleen te dichten. Ik pleit daarom voor een bouwopgave voor geclusterde ouderenwoningen met zorg in de nabijheid, in elke gemeente.',
			'Mantelzorgers houden dit stelsel overeind en krijgen daar te weinig voor terug. Respijtzorg moet een recht worden en geen gunst, en werkgevers zouden verplicht een mantelzorgverlofregeling moeten aanbieden.',
			'Het scheiden van wonen en zorg is verdedigbaar, maar niet zonder een goede huurtoeslag en voldoende betaalbare geclusterde woningen. Zonder die twee wordt het simpelweg een lastenverzwaring voor mensen met een klein pensioen.',
			'De wijkverpleging is de spil van de zorg thuis en is de afgelopen jaren juist versnipperd door de inkoop. Ik steun het idee van één aanbieder per wijk, zodat u niet met zes verschillende gezichten te maken krijgt.'
		]
	},
	{
		key: 'zorgpremie',
		label: 'de zorgpremie',
		questions: [
			{
				title: 'Hoe kijkt u aan tegen de stijgende zorgpremie?',
				body: 'Wij betalen met zijn tweeën bijna driehonderd euro per maand voor de basisverzekering. Daar komt het eigen risico nog bij.'
			},
			{
				title: 'Gaat het eigen risico omlaag of verdwijnt het helemaal?',
				body: 'Ik stel een doorverwijzing uit omdat januari nu eenmaal duur is. Dat kan toch niet de bedoeling zijn?'
			},
			{
				title: 'Waarom vergoedt mijn verzekeraar bepaalde medicijnen niet meer?',
				body: 'Mijn medicijn is vervangen door een variant die bij mij minder goed werkt, met als reden een inkoopafspraak.'
			},
			{
				title: 'Wat vindt u van het preferentiebeleid en de medicijntekorten?',
				body: 'Twee keer dit jaar stond ik bij de apotheek voor niets. Het lijkt structureel te worden.'
			},
			{
				title: 'Hoe voorkomt u dat mensen zorg mijden vanwege de kosten?',
				body: 'In onze wijk zie ik mensen pas naar de huisarts gaan als het echt niet anders kan.'
			},
			{
				title: 'Wat is uw standpunt over de rol van zorgverzekeraars bij de inkoop?',
				body: 'Ik begrijp de gedachte van gereguleerde marktwerking, maar in de praktijk voelt het alsof de patiënt de sluitpost is.'
			},
			{
				title: 'Waarom verschilt de aanvullende verzekering zo sterk in prijs?',
				body: 'Voor fysiotherapie betaal ik meer premie dan de behandelingen zelf kosten. Is die markt nog wel transparant?'
			},
			{
				title: 'Komt er iets aan de wachttijden in de ggz?',
				body: 'Voor een intake staat hier veertien maanden. Ondertussen wordt er van je verwacht dat je gewoon blijft werken.'
			}
		],
		answers: [
			'De zorgpremie stijgt omdat de zorguitgaven stijgen, en dat komt vooral door personeel, dure geneesmiddelen en meer ouderen. Ik vind het eerlijker om die kosten via de belasting inkomensafhankelijk op te brengen dan via een vlakke nominale premie die voor iedereen even hoog is.',
			'Zorgmijding vanwege het eigen risico is aangetoond en dat maakt het beleid uiteindelijk duurder, niet goedkoper. Mijn fractie steunt verlaging van het eigen risico en het verplicht spreiden ervan over het jaar, zodat januari geen drempelmaand meer is.',
			'De medicijntekorten hangen samen met een inkoopbeleid dat scherp op prijs stuurt en met kwetsbare productieketens. Ik heb gepleit voor een ijzeren voorraad in Europa en voor uitzonderingen op het preferentiebeleid als een patiënt aantoonbaar slechter reageert.',
			'De wachttijden in de ggz zijn het hardnekkigste probleem in de zorg. Ik wil af van de situatie waarin lichte klachten snel geholpen worden en complexe problematiek jarenlang wacht; dat vraagt om aparte inkoop voor de zwaarste groepen.'
		]
	},
	{
		key: 'lerarentekort',
		label: 'het lerarentekort',
		questions: [
			{
				title: 'Waarom is er nog geen oplossing voor het lerarentekort in het basisonderwijs?',
				body: 'Bij ons op school gaan groepen om de beurt naar huis. Dit is het derde jaar op rij.'
			},
			{
				title: 'Wat vindt u van de inzet van onbevoegde docenten in het voortgezet onderwijs?',
				body: 'Mijn zoon heeft wiskunde van iemand zonder bevoegdheid. Ik snap de noodzaak, maar ik maak me zorgen over het niveau.'
			},
			{
				title: 'Hoe stopt u de uitstroom van jonge leraren?',
				body: 'Ruim een kwart is binnen vijf jaar weg. Dat lijkt me een groter probleem dan de instroom.'
			},
			{
				title: 'Waarom kost een zij-instromer een school zoveel geld?',
				body: 'Onze school wil graag mensen omscholen maar kan de begeleiding niet betalen.'
			},
			{
				title: 'Wat doet u aan de werkdruk door administratie in het onderwijs?',
				body: 'Leraren zijn uren per week kwijt aan registratie waarvan niemand precies weet waarvoor die dient.'
			},
			{
				title: 'Vindt u dat leraren in achterstandswijken meer moeten verdienen?',
				body: 'Juist daar is het tekort het grootst en juist daar is de opgave het zwaarst.'
			},
			{
				title: 'Hoe kijkt u aan tegen de rol van uitzendbureaus in het onderwijs?',
				body: 'Er staat een invaller voor de klas die twee keer zoveel kost als een vaste leerkracht.'
			},
			{
				title: 'Wat betekent het lerarentekort voor de kansengelijkheid?',
				body: 'Scholen met veel gemotiveerde ouders vinden altijd nog iemand. Andere scholen niet.'
			}
		],
		answers: [
			'Het lerarentekort is geen wervingsprobleem maar een behoudprobleem. Zolang startende leerkrachten binnen vijf jaar afhaken door werkdruk en gebrek aan begeleiding, blijft elke wervingscampagne dweilen met de kraan open. Ik pleit voor een wettelijke maximale lesgevende taak voor startende docenten.',
			'Ik vind de inzet van onbevoegden begrijpelijk maar zorgelijk, en het gebeurt het vaakst op scholen die het toch al zwaar hebben. Daarom steun ik een hogere toelage voor leraren op scholen met veel leerlingen met een risico op achterstand.',
			'De uitzendconstructies in het onderwijs kosten schoolbesturen bakken met geld dat niet in de klas terechtkomt. Mijn fractie heeft gevraagd om een norm die het aandeel externe inhuur begrenst, met openbaarmaking in het jaarverslag.',
			'Over de administratielast ben ik het volledig met u eens. Veel registraties komen niet van de wet maar van besturen en inspectiegewoontes. Ik heb gevraagd om een schrapsessie waarbij leraren zelf aanwijzen wat weg kan.'
		]
	},
	{
		key: 'hoger-onderwijs',
		label: 'het hoger onderwijs',
		questions: [
			{
				title: 'Wat gaat u doen voor de pechgeneratie met studieschuld?',
				body: 'Ik heb 42.000 euro schuld en de compensatie was net genoeg voor twee maanden aflossing.'
			},
			{
				title: 'Waarom worden opleidingen geschrapt door de bezuinigingen?',
				body: 'Bij ons verdwijnen twee kleine talenopleidingen. Is dat een keuze of gewoon een gevolg van de rekensom?'
			},
			{
				title: 'Wat vindt u van de instroom van internationale studenten?',
				body: 'Het is goed voor de kwaliteit maar er is geen kamer te vinden. Hoe weegt u die twee tegen elkaar?'
			},
			{
				title: 'Hoe kijkt u aan tegen de tijdelijke contracten aan universiteiten?',
				body: 'Promovendi en docenten hangen jaren aan een reeks contracten. Dat gaat ten koste van onderwijskwaliteit.'
			},
			{
				title: 'Komt de basisbeurs terug op een niveau waar je van kunt leven?',
				body: 'De huidige beurs dekt in de grote steden de huur niet eens.'
			},
			{
				title: 'Waarom is het bindend studieadvies nog steeds zo streng?',
				body: 'Een vriend van mij is weggestuurd na een jaar met ziekte, terwijl hij daarna wel de opleiding had gehaald.'
			},
			{
				title: 'Wat doet u aan de prestatiedruk en burn-out onder studenten?',
				body: 'De studentenpsycholoog heeft hier drie maanden wachttijd.'
			},
			{
				title: 'Moet het mbo gelijkwaardiger worden behandeld dan nu?',
				body: 'Mbo-studenten krijgen minder korting op het ov en minder voorzieningen dan hbo’ers. Waarom eigenlijk?'
			}
		],
		answers: [
			'De pechgeneratie heeft een compensatie gekregen die in geen verhouding staat tot de gemiste beurs. Ik steun het voorstel om de rente op studieschulden te maximeren en om de schuld niet mee te laten wegen bij de hypotheekaanvraag, want dat is waar mensen het nu echt voelen.',
			'De bezuinigingen op het hoger onderwijs vertalen zich direct in het schrappen van kleine opleidingen. Ik vind dat onwenselijk: juist de kleine talen- en bètaopleidingen zijn van nationaal belang en zouden apart bekostigd moeten worden.',
			'Internationale studenten dragen bij aan de kwaliteit van ons onderwijs en aan onze arbeidsmarkt, maar de huisvesting is niet meegegroeid. Ik ben voor sturen op instroom per opleiding in plaats van een generieke rem.',
			'Het mbo verdient dezelfde behandeling als het hbo, inclusief een gelijk studentenreisproduct en gelijke voorzieningen. Ik heb daar meerdere keren een motie voor gesteund en zal dat blijven doen.'
		]
	},
	{
		key: 'asiel',
		label: 'de asielopvang',
		questions: [
			{
				title: 'Wat vindt u van de opvang van asielzoekers in kleine gemeenten?',
				body: 'Ons dorp van 4.000 inwoners moet 300 plekken leveren. Ik ben niet tegen opvang, maar dit voelt onevenredig.'
			},
			{
				title: 'Waarom lukt het niet om de asielprocedure te versnellen?',
				body: 'Mensen zitten jaren in onzekerheid en dat is voor niemand goed, ook niet voor het draagvlak.'
			},
			{
				title: 'Hoe voorkomt u dat statushouders in azc’s blijven zitten?',
				body: 'Er zitten duizenden mensen met een verblijfsvergunning in de opvang omdat er geen woning is.'
			},
			{
				title: 'Wat is uw standpunt over de spreidingswet?',
				body: 'De ene gemeente doet al jaren veel, de andere niets. Hoe kijkt u naar die verdeling?'
			},
			{
				title: 'Hoe kijkt u aan tegen opvang van alleenstaande minderjarige vreemdelingen?',
				body: 'In onze gemeente is een kleinschalige opvang en dat gaat goed. Waarom gebeurt dat niet vaker?'
			},
			{
				title: 'Wat doet u tegen de kosten van noodopvang?',
				body: 'Een noodplek kost een veelvoud van een reguliere plek. Toch blijft die noodopvang bestaan.'
			},
			{
				title: 'Vindt u dat asielzoekers eerder mogen werken?',
				body: 'Er is personeelstekort in de horeca en de zorg, en tegelijk zitten mensen jarenlang niets te doen.'
			},
			{
				title: 'Hoe wordt er omgegaan met overlastgevende asielzoekers?',
				body: 'Een kleine groep bepaalt hier het beeld en dat maakt het gesprek over opvang onmogelijk.'
			}
		],
		answers: [
			'De asielketen loopt vast op twee punten: de doorlooptijd van de procedure en de doorstroom van statushouders naar een woning. Als we die twee oplossen, halveert de opvangbehoefte vanzelf. Ik pleit voor een harde termijn voor de IND en voor bindende afspraken met gemeenten over huisvesting.',
			'Ik begrijp uw gevoel over de verdeling. De spreidingswet is juist bedoeld om te voorkomen dat een handvol gemeenten alles opvangt, maar de uitvoering moet wel rekening houden met de schaal van een dorp. Kleinschalige opvang werkt aantoonbaar beter dan grote locaties.',
			'Noodopvang is duur, slecht voor bewoners en slecht voor het draagvlak. Dat we er al jaren op leunen is een falen van planning, niet van goede wil. Mijn fractie vraagt om een meerjarige capaciteitsplanning die niet elk jaar opnieuw ter discussie staat.',
			'Ik vind dat asielzoekers eerder aan het werk moeten kunnen. De 24-wekeneis is inmiddels door de rechter beperkt en dat is winst. Werken helpt bij de taal, bij de inburgering en bij het gevoel van eigenwaarde.'
		]
	},
	{
		key: 'arbeidsmigratie',
		label: 'arbeidsmigratie',
		questions: [
			{
				title: 'Wat doet u tegen de uitbuiting van arbeidsmigranten?',
				body: 'Op het bedrijventerrein hier slapen mensen met acht man in een woning, betaald aan hun eigen uitzender.'
			},
			{
				title: 'Komt er een vergunningplicht voor uitzendbureaus?',
				body: 'Malafide bemiddelaars verdwijnen en beginnen onder een nieuwe naam. Wordt daar iets aan gedaan?'
			},
			{
				title:
					'Hoe kijkt u aan tegen de groei van distributiecentra en de bijbehorende arbeidsmigratie?',
				body: 'Onze regio zit vol met dozenschuiven. De banen zijn er, de huisvesting niet.'
			},
			{
				title: 'Waarom is de koppeling tussen werk en woonruimte nog toegestaan?',
				body: 'Als je je baan verliest, ben je meteen ook dakloos. Dat maakt mensen chantabel.'
			},
			{
				title: 'Wat vindt u van de aanbevelingen van de commissie-Roemer?',
				body: 'Die liggen er al jaren. Welk deel is nu daadwerkelijk uitgevoerd?'
			},
			{
				title: 'Hoe zorgt u dat gemeenten grip krijgen op arbeidsmigratie?',
				body: 'Wij weten als gemeente niet eens hoeveel mensen hier werkelijk verblijven.'
			},
			{
				title: 'Moeten bedrijven meebetalen aan de maatschappelijke kosten van arbeidsmigratie?',
				body: 'De winst is privaat, de kosten voor huisvesting en zorg zijn publiek.'
			},
			{
				title: 'Wat vindt u van de registratie van tijdelijke werknemers in de BRP?',
				body: 'Zonder inschrijving is er geen huisarts, geen post en geen zicht. Kan dat niet beter geregeld worden?'
			}
		],
		answers: [
			'De aanbevelingen van de commissie-Roemer liggen er al te lang. Het toelatingsstelsel voor uitzendbureaus is aangenomen, maar de invoering schuift steeds op. Ik dring aan op een harde invoeringsdatum, want zonder vergunningplicht blijft de malafide bemiddelaar gewoon doorgaan onder een nieuwe naam.',
			'De koppeling van werk en woonruimte maakt mensen chantabel en hoort wat mij betreft verboden te worden, met een minimale opzegtermijn van drie maanden voor de huisvesting. Dat is geen luxe, dat is het verschil tussen een misstand en een normale arbeidsrelatie.',
			'Gemeenten hebben nu geen zicht op wie er in hun gemeente verblijft en dat is een bestuurlijk probleem. Verplichte registratie met een adres, ook voor kort verblijf, is de basis. Zonder cijfers kun je geen beleid maken.',
			'Ik vind het redelijk dat sectoren die structureel op arbeidsmigratie leunen, meebetalen aan huisvesting en voorzieningen. De maatschappelijke kosten horen niet automatisch bij de gemeente terecht te komen.'
		]
	},
	{
		key: 'defensie',
		label: 'defensie',
		questions: [
			{
				title: 'Waar gaat het extra defensiegeld precies naartoe?',
				body: 'Er wordt veel gesproken over percentages van het bbp, maar wat wordt er nu echt aangeschaft?'
			},
			{
				title: 'Hoe lost u het personeelstekort bij de krijgsmacht op?',
				body: 'Er staan duizenden vacatures open. Zonder mensen heeft materieel weinig zin.'
			},
			{
				title: 'Wat vindt u van de discussie over een vorm van dienstplicht?',
				body: 'Er wordt gesproken over een dienjaar. Is dat serieus beleid of vooral symboliek?'
			},
			{
				title: 'Hoe lang kan Nederland de steun aan Oekraïne volhouden?',
				body: 'De voorraden zijn beperkt en de productie loopt achter. Wat is realistisch?'
			},
			{
				title: 'Wat betekent de nieuwe kazerne voor omwonenden?',
				body: 'Bij ons in de buurt komt een oefenterrein bij. Wordt er ook naar geluidsoverlast gekeken?'
			},
			{
				title: 'Hoe kijkt u aan tegen de Europese samenwerking bij wapenaankopen?',
				body: 'Elk land koopt zijn eigen spullen en dat lijkt me duur en inefficiënt.'
			},
			{
				title: 'Wat doet u aan de veteranenzorg?',
				body: 'Een oud-collega van mij is uitgezonden geweest en loopt vast in de aanvraag voor zorg.'
			},
			{
				title: 'Hoe weerbaar is Nederland tegen hybride dreigingen?',
				body: 'Ik lees over sabotage van kabels en over desinformatie. Wie is daar eigenlijk verantwoordelijk voor?'
			}
		],
		answers: [
			'Het extra geld gaat naar munitievoorraden, luchtverdediging, drones en vooral naar personeel. Dat laatste is het lastigste onderdeel: materieel kun je kopen, mensen niet. Ik pleit voor betere arbeidsvoorwaarden en voor een reservistenstelsel dat serieus wordt genomen.',
			'Over een dienjaar denk ik genuanceerd. Een verplichte dienstplicht is duur en juridisch complex, maar een aantrekkelijke vrijwillige variant die ook meetelt voor studie of werk vind ik het onderzoeken waard.',
			'Europese samenwerking bij aanschaf is bittere noodzaak. Zolang zeventien landen zeventien varianten van hetzelfde voertuig bestellen, betalen we te veel en duurt levering te lang. Ik steun gezamenlijke bestellingen via de Europese defensie-industrie.',
			'De weerbaarheid tegen hybride dreigingen is versnipperd over departementen en diensten. Ik heb gevraagd om één aanspreekpunt met doorzettingsmacht, want bij sabotage van kabels of een cyberaanval is onduidelijkheid het grootste risico.'
		]
	},
	{
		key: 'openbaar-vervoer',
		label: 'het openbaar vervoer',
		questions: [
			{
				title: 'Welke concrete stappen zet u rond de bereikbaarheid van het platteland?',
				body: 'De laatste buslijn hier is geschrapt. Zonder auto ben je nergens, zeker als je 80 bent.'
			},
			{
				title: 'Waarom worden buslijnen geschrapt terwijl er meer gereisd wordt?',
				body: 'De concessie wordt aanbesteed op kosten en dan verdwijnen de dunne lijnen als eerste.'
			},
			{
				title: 'Wat vindt u van de stijgende treinkaartjes?',
				body: 'Reizen met de trein is voor een gezin duurder dan met de auto. Hoe rijmt dat met klimaatbeleid?'
			},
			{
				title: 'Komt er eindelijk een nachtnet buiten de Randstad?',
				body: 'Als je hier ’s avonds werkt in de horeca, kom je niet thuis zonder auto.'
			},
			{
				title: 'Hoe voorkomt u uitval van treinen door personeelstekort?',
				body: 'Vorige maand viel mijn trein drie keer uit. Er wordt gezegd dat er te weinig machinisten zijn.'
			},
			{
				title: 'Wat doet u aan de toegankelijkheid van stations voor mensen met een beperking?',
				body: 'Op ons station moet je nog steeds een uur van tevoren assistentie aanvragen.'
			},
			{
				title: 'Is het openbaar vervoer een voorziening of een markt?',
				body: 'Ik heb het idee dat dat de kern van de discussie is en dat het antwoord steeds ontweken wordt.'
			},
			{
				title: 'Wat gebeurt er met de spoorverbinding naar het noorden?',
				body: 'De Lelylijn wordt al jaren genoemd. Is er nu echt geld voor of blijft het bij plannen?'
			}
		],
		answers: [
			'Openbaar vervoer is voor mij een basisvoorziening en geen sluitpost. Dunne lijnen op het platteland verdwijnen omdat concessies vooral op kostendekking worden beoordeeld. Ik pleit voor een bereikbaarheidsnorm: elke kern binnen een vastgestelde reistijd van een knooppunt.',
			'De prijs van het treinkaartje is de afgelopen jaren harder gestegen dan de kosten van autorijden, en dat is precies de verkeerde prikkel. Mijn fractie steunt bevriezing van de tarieven en een goedkoop dal- en weekendabonnement.',
			'De uitval door personeelstekort is hardnekkig; de opleiding van een machinist duurt ruim een jaar, dus dit was voorspelbaar. Ik heb gevraagd om meerjarige zekerheid in de concessie, zodat vervoerders kunnen opleiden zonder financieel risico.',
			'Toegankelijkheid mag geen gunst zijn. Het VN-verdrag Handicap verplicht ons tot zelfstandig reizen, en assistentie een uur van tevoren aanvragen past daar niet bij. Ik steun een investeringsprogramma om alle stations toegankelijk te maken met een harde einddatum.'
		]
	},
	{
		key: 'verkeersveiligheid',
		label: 'verkeersveiligheid',
		questions: [
			{
				title: 'Waarom stijgt het aantal verkeersdoden onder fietsers?',
				body: 'Vooral onder ouderen op een elektrische fiets zie ik veel ongelukken. Wordt daar iets mee gedaan?'
			},
			{
				title: 'Wat vindt u van 30 kilometer per uur als norm binnen de bebouwde kom?',
				body: 'Onze straat is een sluiproute geworden. De gemeente zegt dat het Rijk aan zet is.'
			},
			{
				title: 'Hoe kijkt u aan tegen fatbikes en de leeftijdsgrens daarvoor?',
				body: 'Kinderen van twaalf rijden hier veertig kilometer per uur zonder helm. Dat gaat een keer mis.'
			},
			{
				title: 'Waarom is er zo weinig geld voor onderhoud van provinciale wegen?',
				body: 'De N-wegen hier staan bekend als gevaarlijk en er gebeurt weinig.'
			},
			{
				title: 'Wat doet u tegen afleiding door telefoons in het verkeer?',
				body: 'Ik zie dagelijks mensen appen achter het stuur. Handhaving lijkt er nauwelijks te zijn.'
			},
			{
				title: 'Komen er strengere regels voor vrachtverkeer in woonwijken?',
				body: 'Sinds de komst van bezorgdiensten rijden er hier de hele dag bestelbussen door smalle straten.'
			},
			{
				title: 'Hoe veilig zijn zelfrijdende functies in moderne auto’s?',
				body: 'Er zitten steeds meer assistentiesystemen in auto’s. Wie is aansprakelijk als het misgaat?'
			},
			{
				title: 'Wat vindt u van alcoholsloten voor veelplegers?',
				body: 'Die regeling is ooit gesneuveld bij de rechter. Komt er een nieuwe variant?'
			}
		],
		answers: [
			'Het aantal verkeersdoden stijgt vooral onder oudere fietsers en dat hangt samen met snelheidsverschillen en met de inrichting van wegen. Ik steun het landelijk uitrollen van 30 kilometer per uur binnen de bebouwde kom, met geld voor gemeenten om de weginrichting daarop aan te passen.',
			'Over fatbikes deel ik uw zorg. Deze voertuigen zijn juridisch een fiets maar rijden feitelijk als een bromfiets. Ik pleit voor een helmplicht en handhaving op opgevoerde exemplaren, en voor duidelijke typegoedkeuring bij de import.',
			'Het achterstallig onderhoud aan provinciale en rijkswegen loopt in de miljarden. Uitstel maakt het uiteindelijk duurder en gevaarlijker. Mijn fractie heeft bij de begroting extra geld voor instandhouding gevraagd, boven op de aanleg van nieuwe wegen.',
			'Handhaving op telefoongebruik is technisch goed mogelijk met slimme camera’s, en dat gebeurt inmiddels ook. Ik vind dat die inzet fors omhoog kan, want afleiding is inmiddels een van de belangrijkste oorzaken van ernstige ongevallen.'
		]
	},
	{
		key: 'landbouw',
		label: 'de landbouw',
		questions: [
			{
				title: 'Welk perspectief biedt u aan boeren die willen blijven boeren?',
				body: 'Wij hebben een melkveebedrijf met 90 koeien. Mijn zoon wil overnemen maar durft niet te investeren.'
			},
			{
				title: 'Waarom verdient de boer zo weinig aan een pak melk?',
				body: 'De supermarkt en de verwerker vangen het grootste deel. Kan de Kamer daar iets aan doen?'
			},
			{
				title: 'Wat vindt u van de gewasbeschermingsmiddelen die nog zijn toegestaan?',
				body: 'Wij wonen naast een bollenveld en maken ons zorgen over wat er neerdaalt.'
			},
			{
				title: 'Hoe kijkt u aan tegen kringlooplandbouw als verdienmodel?',
				body: 'Het klinkt mooi, maar wie betaalt de overgangsperiode?'
			},
			{
				title: 'Komt er een eerlijker verdeling van grond voor jonge boeren?',
				body: 'De grondprijs is zo hoog dat overname alleen kan met een enorme schuld.'
			},
			{
				title: 'Wat doet u aan de regeldruk voor agrariërs?',
				body: 'Mijn vader hield een schriftje bij, ik ben een dag per week kwijt aan formulieren.'
			},
			{
				title: 'Hoe kijkt u aan tegen de derogatie en de mestproblematiek?',
				body: 'Nu de derogatie afloopt, moet er mest worden afgevoerd tegen hoge kosten. Wat is uw voorstel?'
			},
			{
				title: 'Vindt u dat er een minimumprijs voor landbouwproducten moet komen?',
				body: 'In andere sectoren accepteren we ook geen verkoop onder de kostprijs.'
			}
		],
		answers: [
			'Boeren hebben vooral behoefte aan langjarige zekerheid, en die geven we al jaren niet. Ik pleit voor een landbouwakkoord met afspraken die minstens tien jaar meegaan, zodat een investering in de stal of in de bodem ook kan worden terugverdiend.',
			'De positie van de boer in de keten is structureel zwak. De Autoriteit Consument en Markt heeft bevoegdheden gekregen tegen oneerlijke handelspraktijken, maar boeren durven vaak geen klacht in te dienen uit angst hun afnemer kwijt te raken. Anonieme meldingen en een sterkere toezichthouder zijn nodig.',
			'Het aflopen van de derogatie raakt melkveehouders hard, zeker in gebieden met weinig afzetmogelijkheden voor mest. Ik heb gevraagd om een overgangsregeling en om ruimte voor bewerkte mest als kunstmestvervanger, iets waar Brussel eindelijk in beweegt.',
			'Jonge boeren komen er niet tussen door de grondprijs. Mijn fractie steunt een voorkeursrecht voor bedrijfsopvolgers bij vrijkomende grond en een fonds waarmee de overname gefinancierd kan worden zonder torenhoge schuld.'
		]
	},
	{
		key: 'natuur',
		label: 'natuur en biodiversiteit',
		questions: [
			{
				title: 'Waarom gaat de biodiversiteit in Nederland nog steeds achteruit?',
				body: 'Ik tel al twintig jaar vlinders in dezelfde berm. Het aantal soorten is gehalveerd.'
			},
			{
				title: 'Wat vindt u van de staat van de Natura 2000-gebieden?',
				body: 'Er wordt veel over gesproken in juridische termen, maar hoe gaat het er feitelijk mee?'
			},
			{
				title: 'Komt er meer geld voor bomen en groen in de stad?',
				body: 'In onze wijk is de laatste jaren vooral gekapt voor parkeerplaatsen.'
			},
			{
				title: 'Hoe kijkt u aan tegen de terugkeer van de wolf?',
				body: 'Schapenhouders hier lijden schade en tegelijk is de wolf beschermd. Waar ligt volgens u de balans?'
			},
			{
				title: 'Wat doet u aan de waterkwaliteit en de Kaderrichtlijn Water?',
				body: 'Nederland haalt de doelen voor 2027 niet, lees ik. Wat zijn daarvan de gevolgen?'
			},
			{
				title: 'Waarom worden bermen nog steeds zo vaak gemaaid?',
				body: 'Ecologisch bermbeheer kost minder en levert meer op. Toch gebeurt het weinig.'
			},
			{
				title: 'Wat vindt u van natuurinclusief bouwen als verplichting?',
				body: 'Nestkasten in de gevel kosten weinig maar leveren veel op voor gierzwaluwen en vleermuizen.'
			},
			{
				title: 'Hoe beschermt u het bodemleven tegen verdroging?',
				body: 'Op de zandgronden hier is de grondwaterstand al jaren te laag.'
			}
		],
		answers: [
			'De biodiversiteit gaat achteruit door een combinatie van stikstof, verdroging en versnippering. Ik vind dat we die drie in samenhang moeten aanpakken in plaats van elk apart, en dat het waterpeil op de zandgronden omhoog moet, ook als dat pijn doet.',
			'De Kaderrichtlijn Water is geen vrijblijvende ambitie maar een verplichting met juridische gevolgen. Als we de doelen in 2027 niet halen, lopen we het risico dat vergunningverlening opnieuw vastloopt, net als bij stikstof. Ik dring aan op een uitvoeringsprogramma met tussendoelen.',
			'Over de wolf denk ik pragmatisch: het dier is Europees beschermd, maar schade aan schapenhouders moet ruimhartig vergoed worden en preventie zoals wolfwerende rasters hoort volledig gefinancierd te worden.',
			'Natuurinclusief bouwen kost bij nieuwbouw enkele tientallen euro’s per woning en levert veel op. Ik steun opname in het Bouwbesluit, zodat het niet afhangt van de goede wil van een ontwikkelaar.'
		]
	},
	{
		key: 'minimumloon',
		label: 'het minimumloon',
		questions: [
			{
				title: 'Waarom is er nog geen oplossing voor de verhoging van het minimumloon?',
				body: 'Met een fulltime baan kom je in de Randstad nog steeds niet rond. Hoe kan dat?'
			},
			{
				title: 'Wat vindt u van een minimumuurloon van 16 euro?',
				body: 'Werkgevers waarschuwen voor banenverlies, vakbonden zeggen dat het meevalt. Wie heeft gelijk?'
			},
			{
				title: 'Hoe voorkomt u dat werkenden alsnog in de armoede belanden?',
				body: 'Er zijn hier mensen met werk die naar de voedselbank gaan. Dat is toch niet te verdedigen?'
			},
			{
				title: 'Werkt de armoedeval nog steeds tegen meer werken?',
				body: 'Een collega van mij houdt van elke extra euro bijna niets over door het wegvallen van toeslagen.'
			},
			{
				title: 'Wat doet u aan de schuldenindustrie en incassokosten?',
				body: 'Een boete van 50 euro groeit hier binnen een jaar naar 400 euro.'
			},
			{
				title: 'Komt er een landelijke aanpak van kinderarmoede?',
				body: 'Elke gemeente doet het anders en dat betekent dat het uitmaakt waar je geboren bent.'
			},
			{
				title: 'Hoe kijkt u aan tegen het koppelen van de bijstand aan het minimumloon?',
				body: 'Die koppeling is losgelaten en dat merken mensen direct.'
			},
			{
				title: 'Wat vindt u van het idee van een sociaal tarief voor energie?',
				body: 'Voor huishoudens met een laag inkomen en een slecht geïsoleerd huis is de rekening onhoudbaar.'
			}
		],
		answers: [
			'Het minimumloon is verhoogd, maar de woonlasten zijn harder gestegen. Daarom vind ik dat de discussie niet alleen over het brutoloon moet gaan, maar ook over huur, energie en zorgpremie. Werken moet lonen en dat is nu voor te veel mensen simpelweg niet zo.',
			'De armoedeval is een van de meest hardnekkige weeffouten in ons stelsel. Iemand die meer gaat werken raakt toeslagen kwijt en houdt soms een paar cent per euro over. Mijn fractie steunt vereenvoudiging van het toeslagenstelsel, ook al kost dat geld in de overgang.',
			'De schuldenindustrie maakt een kleine schuld binnen een jaar onbetaalbaar. Ik ben voorstander van een maximum aan incassokosten, een verplichte adempauze en één loket waar mensen terechtkunnen, in plaats van tien verschillende schuldeisers.',
			'Een sociaal energietarief is uitvoerbaar als we het koppelen aan bestaande inkomensgegevens. Ik heb gevraagd om dit uit te werken, juist omdat huishoudens in slecht geïsoleerde huurwoningen nu het hardst worden geraakt.'
		]
	},
	{
		key: 'toeslagen',
		label: 'de kinderopvangtoeslag',
		questions: [
			{
				title: 'Wat is er sinds het toeslagenschandaal echt veranderd?',
				body: 'Er zijn excuses gemaakt en er is compensatie beloofd, maar mensen wachten nog steeds.'
			},
			{
				title: 'Wanneer wordt de kinderopvang echt bijna gratis?',
				body: 'Dat is al twee keer uitgesteld. Wij plannen ons leven op zulke beloftes.'
			},
			{
				title: 'Waarom duurt de hersteloperatie zo lang?',
				body: 'Mijn buurvrouw is zes jaar bezig met haar dossier en er is nog steeds geen eindafrekening.'
			},
			{
				title: 'Hoe voorkomt u dat ouders opnieuw met terugvorderingen te maken krijgen?',
				body: 'Het systeem van voorschotten en achteraf verrekenen blijft toch bestaan?'
			},
			{
				title: 'Wat vindt u van de wachtlijsten bij kinderopvangorganisaties?',
				body: 'Wij staan sinds de zwangerschap op de wachtlijst en het kind is nu anderhalf.'
			},
			{
				title: 'Komt er iets tegen de winsten van private equity in de kinderopvang?',
				body: 'Onze locatie is overgenomen en sindsdien is er minder personeel en een hogere prijs.'
			},
			{
				title: 'Waarom is het toeslagenstelsel niet gewoon afgeschaft?',
				body: 'Iedereen lijkt het erover eens dat het niet deugt, en toch blijft het bestaan.'
			},
			{
				title: 'Hoe wordt gedupeerden met schulden geholpen?',
				body: 'De compensatie werd bij een kennis direct opgeslokt door oude schulden.'
			}
		],
		answers: [
			'Het toeslagenschandaal heeft geleid tot meer menselijke maat op papier, maar het onderliggende stelsel van voorschotten en terugvorderingen bestaat nog steeds. Zolang dat zo is, blijft het risico op nieuwe drama’s bestaan. Ik steun de overgang naar directe financiering van de kinderopvang.',
			'Dat de hersteloperatie zo lang duurt, is inmiddels een tweede onrecht geworden. Ik heb gepleit voor het schrappen van de integrale beoordeling voor iedereen die daar niet expliciet om vraagt, zodat mensen niet nog jaren in een dossier zitten.',
			'De wachtlijsten in de kinderopvang zijn een personeelsprobleem. Als opvang bijna gratis wordt zonder dat er medewerkers bij komen, wordt de wachtlijst alleen langer. Ik vind dat die twee gelijk op moeten gaan.',
			'Over private equity in de kinderopvang ben ik kritisch. Publiek geld hoort naar kinderen en personeel te gaan, niet naar rendement. Ik steun een norm voor verantwoorde winst en meer transparantie over eigendomsstructuren.'
		]
	},
	{
		key: 'belastingen',
		label: 'de belastingen',
		questions: [
			{
				title: 'Waarom is het belastingstelsel zo ingewikkeld geworden?',
				body: 'Ik doe mijn eigen aangifte en snap er steeds minder van, terwijl mijn situatie niet ingewikkeld is.'
			},
			{
				title: 'Hoe kijkt u aan tegen het belasten van vermogen in box 3?',
				body: 'Na de arresten van de Hoge Raad lijkt niemand meer te weten waar we aan toe zijn.'
			},
			{
				title: 'Wat vindt u van de verschillen tussen werknemers en zzp’ers in de belasting?',
				body: 'Voor hetzelfde werk betaalt de een veel meer dan de ander. Is dat vol te houden?'
			},
			{
				title: 'Komt er iets tegen belastingontwijking door multinationals?',
				body: 'Nederland stond lang bekend als doorstroomland. Is dat nu echt voorbij?'
			},
			{
				title: 'Waarom stijgen de gemeentelijke lasten zo hard?',
				body: 'De ozb en de afvalstoffenheffing gingen hier samen met tien procent omhoog.'
			},
			{
				title: 'Wat doet u aan de hoge marginale druk voor middeninkomens?',
				body: 'Een salarisverhoging levert bij ons netto vrijwel niets op.'
			},
			{
				title: 'Vindt u dat de hypotheekrenteaftrek verder moet worden afgebouwd?',
				body: 'Die aftrek helpt vooral wie al een huis heeft, terwijl starters er niets aan hebben.'
			},
			{
				title: 'Hoe staat het met de uitvoerbaarheid bij de Belastingdienst?',
				body: 'Er wordt gezegd dat nieuwe plannen niet kunnen door verouderde ICT. Klopt dat?'
			}
		],
		answers: [
			'Het stelsel is complex geworden door decennia aan uitzonderingen, aftrekposten en toeslagen die elk op zichzelf verdedigbaar waren. Ik steun een grondige vereenvoudiging, ook al betekent dat dat sommige groepen erop achteruitgaan; zonder die eerlijkheid komen we er nooit.',
			'Box 3 is een juridisch moeras geworden. Belasten op werkelijk rendement is de enige houdbare route, maar de uitvoering vraagt jaren voorbereiding bij de Belastingdienst. Ik vind het onverstandig om dat opnieuw te overhaasten.',
			'Het verschil in belastingdruk tussen werknemers en zelfstandigen is te groot geworden en verstoort de arbeidsmarkt. Mijn fractie steunt verdere afbouw van de zelfstandigenaftrek in combinatie met een betaalbare arbeidsongeschiktheidsverzekering voor zzp’ers.',
			'De uitvoerbaarheid bij de Belastingdienst is een reële grens aan wat de politiek kan bedenken. Ik pleit ervoor om elk fiscaal voorstel standaard van een uitvoeringstoets te voorzien voordat we erover stemmen, en die toets ook openbaar te maken.'
		]
	},
	{
		key: 'pensioenen',
		label: 'de pensioenen',
		questions: [
			{
				title: 'Wat betekent de nieuwe pensioenwet voor mijn pensioen?',
				body: 'Ik ben 58 en begrijp uit de brieven van mijn fonds vrijwel niets.'
			},
			{
				title: 'Waarom is er geen referendum geweest over de pensioenhervorming?',
				body: 'Het gaat over het geld van miljoenen mensen en het is over hun hoofden heen besloten, vind ik.'
			},
			{
				title: 'Wat gebeurt er als het invaren fout gaat?',
				body: 'Wie is aansprakelijk als blijkt dat de verdeling niet klopt?'
			},
			{
				title: 'Hoe kijkt u aan tegen de koppeling van de AOW-leeftijd aan de levensverwachting?',
				body: 'Voor iemand met zwaar werk is doorwerken tot 68 niet realistisch.'
			},
			{
				title: 'Komt er een regeling voor zware beroepen?',
				body: 'In de bouw en de zorg houden mensen het niet vol tot de AOW-leeftijd.'
			},
			{
				title: 'Waarom bouwen zzp’ers zo weinig pensioen op?',
				body: 'Van de zelfstandigen die ik ken heeft bijna niemand iets geregeld.'
			},
			{
				title: 'Wat vindt u van de beleggingen van pensioenfondsen in fossiele bedrijven?',
				body: 'Mijn fonds belegt nog steeds in olie en gas. Kan een deelnemer daar iets aan doen?'
			},
			{
				title: 'Blijft de AOW gekoppeld aan het minimumloon?',
				body: 'Bij de laatste verhoging is die koppeling deels losgelaten en dat scheelt ouderen direct geld.'
			}
		],
		answers: [
			'De overgang naar het nieuwe stelsel is de grootste financiële operatie in decennia en de communicatie erover schiet ernstig tekort. Ik heb gevraagd om begrijpelijke, persoonlijke overzichten in plaats van juridische brieven, en om een onafhankelijk meldpunt voor deelnemers.',
			'Een regeling voor zware beroepen is nooit goed van de grond gekomen omdat de afbakening lastig is. Toch vind ik dat geen excuus: de RVU-regeling loopt af en er moet een structurele opvolger komen, gefinancierd via de sector zelf.',
			'Zelfstandigen bouwen te weinig pensioen op, en dat wordt over twintig jaar een collectief probleem. Ik steun een vorm van automatische deelname met een opt-out, want vrijwilligheid heeft aantoonbaar niet gewerkt.',
			'Over de beleggingen van fondsen: deelnemers hebben via het verantwoordingsorgaan invloed, maar in de praktijk is die klein. Ik vind dat fondsen verplicht moeten publiceren hoe hun beleggingen zich verhouden tot het klimaatakkoord van Parijs.'
		]
	},
	{
		key: 'veiligheid',
		label: 'veiligheid in binnensteden',
		questions: [
			{
				title: 'Wat vindt u van de veiligheid in binnensteden ’s avonds?',
				body: 'Mijn dochter van negentien fietst liever om dan door het centrum. Dat zegt genoeg.'
			},
			{
				title: 'Hoe pakt u ondermijnende criminaliteit in wijken aan?',
				body: 'Hier rijden jongens van zeventien in auto’s waar mijn buurman veertig jaar voor moest werken.'
			},
			{
				title: 'Waarom worden drugslabs vooral op het platteland gevonden?',
				body: 'Boeren worden benaderd om schuren te verhuren. Wat doet u tegen die druk?'
			},
			{
				title: 'Wat doet u tegen het ronselen van jongeren voor criminele klussen?',
				body: 'Via sociale media worden hier kinderen benaderd voor honderden euro’s.'
			},
			{
				title: 'Hoe kijkt u aan tegen cameratoezicht in uitgaansgebieden?',
				body: 'Het helpt misschien tegen incidenten, maar ik vind het ook ongemakkelijk.'
			},
			{
				title: 'Waarom duurt het zo lang voordat een zaak voor de rechter komt?',
				body: 'Een aangifte van mijn buurman uit 2024 is nog steeds niet behandeld.'
			},
			{
				title: 'Wat vindt u van het verbod op lachgas en de handhaving daarvan?',
				body: 'Het verbod is er, maar op straat zie ik er niets van terug.'
			},
			{
				title: 'Hoe voorkomt u dat wijken afglijden?',
				body: 'Bij ons zijn de buurtconciërge, het jongerenwerk en de wijkagent allemaal verdwenen.'
			}
		],
		answers: [
			'Veiligheid begint bij aanwezigheid: een wijkagent die mensen kent, jongerenwerk dat er ’s avonds is en een buurthuis dat open is. Die drie zijn de afgelopen vijftien jaar het hardst wegbezuinigd en dat zien we nu terug in de cijfers over ondermijning.',
			'Het ronselen van jongeren via sociale media is een groeiend probleem waar de opsporing structureel achterloopt. Ik pleit voor een meldplicht voor platforms bij duidelijke ronselberichten en voor veel meer capaciteit bij de digitale recherche.',
			'Dat een aangifte uit 2024 nog niet behandeld is, is helaas geen uitzondering. De doorlooptijden in de strafrechtketen zijn onacceptabel lang. Ik steun structurele investeringen in het Openbaar Ministerie en de rechtspraak, niet alleen in de politie.',
			'De druk op boeren om schuren te verhuren voor drugslabs is reële en gevaarlijk. Er is een meldpunt en er is ondersteuning bij het opruimen van dumpingen, maar de vergoeding schiet tekort. Daar heb ik meerdere keren aandacht voor gevraagd.'
		]
	},
	{
		key: 'politie',
		label: 'de politiecapaciteit',
		questions: [
			{
				title: 'Waarom is er hier geen wijkagent meer?',
				body: 'Onze wijkagent is al twee jaar niet vervangen. Wie moet de buurt dan kennen?'
			},
			{
				title: 'Hoe lang duurt het nog voordat de politie op sterkte is?',
				body: 'Er wordt gesproken over duizenden vacatures en tegelijk over een grote uitstroom door pensioen.'
			},
			{
				title: 'Wat doet u aan het ziekteverzuim bij de politie?',
				body: 'Agenten die ik ken zitten thuis met PTSS en wachten maanden op hulp.'
			},
			{
				title: 'Waarom worden aangiftes zo vaak geseponeerd?',
				body: 'Na een inbraak kreeg ik binnen twee weken een brief dat er geen opsporingsindicatie was.'
			},
			{
				title: 'Wat vindt u van de inzet van boa’s in plaats van politie?',
				body: 'Boa’s krijgen steeds meer taken maar niet dezelfde bescherming.'
			},
			{
				title: 'Hoe kijkt u aan tegen etnisch profileren door de politie?',
				body: 'Jongeren hier worden stelselmatig vaker gecontroleerd. Dat schaadt het vertrouwen.'
			},
			{
				title: 'Krijgt de recherche voldoende capaciteit voor cybercrime?',
				body: 'Bijna iedereen die ik ken heeft ooit met oplichting te maken gehad en er gebeurt weinig.'
			},
			{
				title: 'Wat vindt u van geweld tegen hulpverleners?',
				body: 'Op oudejaarsavond was het hier weer raak. De straffen lijken niets uit te maken.'
			}
		],
		answers: [
			'De wijkagent is het fundament van de politie en juist die functie staat onder druk doordat mensen worden weggetrokken voor noodhulp. Ik vind dat de norm van één wijkagent per vijfduizend inwoners een harde ondergrens moet zijn en geen streefgetal.',
			'De politie kampt met een dubbele uitdaging: een grote uitstroom door vergrijzing en een opleidingscapaciteit die niet meegroeit. Ik heb gevraagd om uitbreiding van de Politieacademie en om meer zij-instroom voor specialistische functies zoals financieel rechercheren.',
			'Cybercrime is inmiddels de meest voorkomende vorm van criminaliteit en de opsporing loopt er structureel achteraan. Mijn fractie steunt een landelijk team met voldoende digitale specialisten en een snelle, laagdrempelige aangiftemogelijkheid online.',
			'Geweld tegen hulpverleners hoort zwaarder bestraft te worden en dat gebeurt via een strafverzwaringsgrond ook. Belangrijker vind ik dat zaken snél voorkomen; een straf een jaar later heeft veel minder effect.'
		]
	},
	{
		key: 'privacy',
		label: 'digitalisering en privacy',
		questions: [
			{
				title: 'Hoe beschermt u burgers tegen datahandel door apps?',
				body: 'Mijn telefoon lijkt precies te weten waar ik ben geweest en dat wordt kennelijk doorverkocht.'
			},
			{
				title: 'Wat vindt u van gezichtsherkenning in de openbare ruimte?',
				body: 'Bij een station hier is een proef geweest. Wie heeft daar toestemming voor gegeven?'
			},
			{
				title: 'Waarom gebruikt de overheid nog steeds Amerikaanse clouddiensten?',
				body: 'Er wordt gesproken over digitale autonomie en tegelijk staat alles bij drie bedrijven.'
			},
			{
				title: 'Hoe voorkomt u nieuwe algoritmische discriminatie bij de overheid?',
				body: 'Na de toeslagenaffaire zou dit toch onmogelijk moeten zijn geworden?'
			},
			{
				title: 'Wat doet u aan online oplichting en spoofing?',
				body: 'Mijn moeder is duizenden euro’s kwijtgeraakt aan iemand die zich voordeed als de bank.'
			},
			{
				title: 'Vindt u dat de AVG te streng of juist te slap wordt gehandhaafd?',
				body: 'Kleine verenigingen worstelen met de regels terwijl grote bedrijven weinig lijken te merken.'
			},
			{
				title: 'Komt er een recht op offline dienstverlening?',
				body: 'Mijn buurman van 84 heeft geen DigiD en kan niets meer regelen.'
			},
			{
				title: 'Hoe kijkt u aan tegen de digitale euro?',
				body: 'Ik hoor zorgen over privacy en over het einde van contant geld.'
			}
		],
		answers: [
			'De handel in locatiegegevens is grotendeels onzichtbaar voor de gebruiker en dat is precies het probleem. Ik steun een verbod op het doorverkopen van locatie- en gezondheidsdata, en veel steviger handhaving door de Autoriteit Persoonsgegevens, die nu simpelweg te klein is.',
			'Digitale autonomie is geen luxe maar een kwestie van nationale veiligheid. Dat vrijwel alle overheidsdata bij een handvol niet-Europese bedrijven staat, is een risico dat we zelf hebben georganiseerd. Ik pleit voor een Europese cloud met harde afnameverplichtingen voor overheden.',
			'Na de toeslagenaffaire is er een algoritmeregister gekomen, maar de vulling daarvan is vrijwillig en dus onvolledig. Ik vind dat elk risicovol algoritme bij de overheid verplicht geregistreerd en extern getoetst moet worden voordat het in gebruik gaat.',
			'Het recht op persoonlijk en offline contact met de overheid moet wat mij betreft in de wet. Digitalisering mag efficiency opleveren, maar niet ten koste van mensen die niet mee kunnen of willen.'
		]
	},
	{
		key: 'ai',
		label: 'kunstmatige intelligentie',
		questions: [
			{
				title: 'Wat vindt u van het gebruik van kunstmatige intelligentie in het onderwijs?',
				body: 'Leerlingen laten hun opdrachten schrijven door een chatbot en docenten weten niet wat ze ermee moeten.'
			},
			{
				title: 'Hoe beschermt u makers tegen het trainen van AI op hun werk?',
				body: 'Ik ben illustrator en zie mijn stijl terug in gegenereerde plaatjes.'
			},
			{
				title: 'Komt er toezicht op AI-toepassingen bij de overheid?',
				body: 'De AI-verordening is er, maar wie handhaaft die hier eigenlijk?'
			},
			{
				title: 'Wat betekent AI voor de werkgelegenheid in administratieve beroepen?',
				body: 'Op mijn afdeling is de helft van het werk in twee jaar geautomatiseerd.'
			},
			{
				title: 'Hoe voorkomt u dat deepfakes verkiezingen beïnvloeden?',
				body: 'Er circuleerde vorige maand een nepvideo van een Kamerlid. Dat gaat snel.'
			},
			{
				title: 'Wat vindt u van AI in de zorg, bijvoorbeeld bij diagnostiek?',
				body: 'Het kan artsen helpen, maar wie is verantwoordelijk bij een fout?'
			},
			{
				title: 'Moeten AI-bedrijven meebetalen aan de energie die ze verbruiken?',
				body: 'Datacenters voor AI gebruiken enorm veel stroom terwijl het net al vol zit.'
			},
			{
				title: 'Waarom investeert Nederland zo weinig in eigen AI-onderzoek?',
				body: 'Onze onderzoekers vertrekken naar het buitenland omdat daar wel geld is.'
			}
		],
		answers: [
			'Kunstmatige intelligentie in het onderwijs is niet tegen te houden en dat moeten we ook niet willen. Wel vind ik dat scholen duidelijke kaders nodig hebben en dat docenten tijd en scholing moeten krijgen; nu wordt het probleem bij de individuele leraar gelegd.',
			'Voor makers is de kern het auteursrecht. De AI-verordening verplicht tot transparantie over trainingsdata, maar zonder handhaving is dat een dode letter. Ik steun een collectief opt-outsysteem waarbij makers zich eenvoudig kunnen verzetten tegen gebruik van hun werk.',
			'Het toezicht op de AI-verordening is verdeeld over meerdere toezichthouders en dat werkt niet. Ik pleit voor één duidelijk coördinerend toezichthoudend orgaan met voldoende technische expertise, want anders wijst iedereen naar elkaar.',
			'Deepfakes rond verkiezingen zijn een reële bedreiging voor het vertrouwen in de uitslag. Ik vind dat platforms verplicht moeten labelen en dat er een snelle procedure moet komen om evident vervalst materiaal offline te halen, met rechterlijke toets achteraf.'
		]
	},
	{
		key: 'media',
		label: 'de publieke omroep',
		questions: [
			{
				title: 'Wat vindt u van de bezuinigingen op de publieke omroep?',
				body: 'Regionale programma’s verdwijnen als eerste en dat raakt juist de plekken met weinig andere media.'
			},
			{
				title: 'Hoe blijft lokale journalistiek overeind?',
				body: 'Onze streekkrant heeft nog één verslaggever voor vijf gemeenten. De raad wordt niet meer gevolgd.'
			},
			{
				title: 'Wat doet u tegen bedreiging van journalisten?',
				body: 'Verslaggevers worden bij demonstraties belaagd. Dat lijkt me een probleem voor ons allemaal.'
			},
			{
				title: 'Vindt u dat streamingdiensten moeten investeren in Nederlandse producties?',
				body: 'Er is een investeringsverplichting geweest. Wat is daarvan terechtgekomen?'
			},
			{
				title: 'Hoe kijkt u aan tegen de omroepbijdrage en het bestel met ledenomroepen?',
				body: 'Het systeem lijkt uit een andere tijd te komen. Is dat nog houdbaar?'
			},
			{
				title: 'Wat doet u aan desinformatie zonder de vrijheid van meningsuiting te raken?',
				body: 'Dat lijkt me een moeilijke balans en ik ben benieuwd waar u de grens legt.'
			},
			{
				title: 'Komt er meer geld voor onderzoeksjournalistiek?',
				body: 'Veel misstanden komen aan het licht door journalisten die er maanden aan werken.'
			},
			{
				title: 'Hoe waarborgt u de onafhankelijkheid van de NPO ten opzichte van de politiek?',
				body: 'Als de politiek over het budget gaat, gaat de politiek indirect ook over de inhoud.'
			}
		],
		answers: [
			'De bezuiniging op de publieke omroep raakt het hardst wat het minst rendabel is: regionale verslaggeving, onderzoeksjournalistiek en programma’s voor kleine doelgroepen. Ik vind dat kortzichtig, juist in een tijd waarin het aanbod van betrouwbare informatie afneemt.',
			'Lokale journalistiek is de waakhond van de gemeenteraad en die waakhond is in veel regio’s verdwenen. Ik steun een structureel fonds voor lokale journalistiek dat op afstand van de politiek wordt beheerd, zodat het geen subsidie met een boodschap wordt.',
			'Bedreiging van journalisten is een aanval op de persvrijheid en verdient prioriteit bij politie en Openbaar Ministerie. PersVeilig doet goed werk, maar de opvolging van aangiftes moet aanzienlijk beter.',
			'De onafhankelijkheid van de omroep waarborg je door meerjarige financiering vast te leggen, zodat er niet elk jaar politiek over te onderhandelen valt. Dat is wat mij betreft belangrijker dan de discussie over het aantal omroepen.'
		]
	},
	{
		key: 'cultuur',
		label: 'cultuur en bibliotheken',
		questions: [
			{
				title: 'Waarom is de bibliotheek in ons dorp gesloten?',
				body: 'De dichtstbijzijnde vestiging is nu twaalf kilometer verderop en er rijdt geen bus.'
			},
			{
				title: 'Wat doet u aan laaggeletterdheid?',
				body: 'Naar schatting hebben tweeënhalf miljoen mensen moeite met lezen en schrijven. Wat werkt daar tegen?'
			},
			{
				title: 'Hoe kijkt u aan tegen de positie van kunstenaars en hun inkomen?',
				body: 'Veel makers verdienen ver onder het minimum en werken er drie banen naast.'
			},
			{
				title: 'Komt er geld voor het onderhoud van monumenten?',
				body: 'De kerk hier is een rijksmonument en de gemeenschap kan het onderhoud niet meer opbrengen.'
			},
			{
				title: 'Wat vindt u van muziekonderwijs op de basisschool?',
				body: 'Bij ons is dat verdwenen bij de laatste bezuiniging.'
			},
			{
				title: 'Hoe belangrijk vindt u de spreiding van cultuur buiten de Randstad?',
				body: 'Het meeste geld gaat naar instellingen in Amsterdam en Rotterdam.'
			},
			{
				title: 'Wat doet u aan de btw-verhoging op cultuur en boeken?',
				body: 'Een hogere btw op een museumkaartje raakt precies de mensen die het al niet vanzelfsprekend vinden.'
			},
			{
				title: 'Is de bibliotheekvoorziening straks wettelijk verplicht?',
				body: 'Ik las over een zorgplicht voor gemeenten. Wat betekent dat concreet?'
			}
		],
		answers: [
			'De bibliotheek is voor veel mensen de enige plek waar je zonder te betalen naar binnen kunt en waar hulp is bij formulieren en laaggeletterdheid. Ik steun de wettelijke zorgplicht voor gemeenten, met bijbehorend geld, want een verplichting zonder budget is een lege huls.',
			'Laaggeletterdheid kost de samenleving jaarlijks honderden miljoenen en raakt aan werk, gezondheid en schulden tegelijk. Ik pleit voor een aanpak via werkgevers en het consultatiebureau, want de bestaande cursussen bereiken vooral mensen die al gemotiveerd zijn.',
			'De inkomenspositie van makers is beroerd. De Fair Practice Code is een goede stap, maar zolang subsidievoorwaarden niet afdwingen dat er fatsoenlijk betaald wordt, blijft het vrijblijvend. Daar zou ik het geld aan koppelen.',
			'Cultuurgeld is te veel geconcentreerd in de Randstad. Ik vind dat de spreiding een harde voorwaarde moet zijn in de volgende cultuurnotaperiode, met een minimumpercentage voor instellingen buiten de vier grote steden.'
		]
	},
	{
		key: 'sport',
		label: 'sport en bewegen',
		questions: [
			{
				title: 'Wat doet u aan de toegankelijkheid van sport voor kinderen uit arme gezinnen?',
				body: 'Een contributie van 250 euro per jaar is voor sommige gezinnen simpelweg onmogelijk.'
			},
			{
				title: 'Waarom zijn er zo weinig gymuren op de basisschool?',
				body: 'Twee keer drie kwartier per week is het maximum hier, en dan valt het ook nog uit.'
			},
			{
				title: 'Hoe kijkt u aan tegen de energiekosten van zwembaden en sporthallen?',
				body: 'Ons zwembad is dicht sinds de energierekening verdrievoudigde.'
			},
			{
				title: 'Wat vindt u van gokreclames rond sport?',
				body: 'Bij elke wedstrijd zie je weer een aanbieder. Jonge mensen krijgen dat elke week binnen.'
			},
			{
				title: 'Komt er meer geld voor breedtesport in plaats van topsport?',
				body: 'Een medaille is mooi, maar er zijn hier geen velden meer om op te spelen.'
			},
			{
				title: 'Hoe zorgt u dat verenigingen genoeg vrijwilligers houden?',
				body: 'Onze club draait op twintig mensen van boven de zestig.'
			},
			{
				title: 'Wat doet u tegen grensoverschrijdend gedrag in de sport?',
				body: 'Na alle rapporten vraag ik me af wat er structureel is veranderd.'
			},
			{
				title: 'Vindt u dat bewegen onderdeel moet zijn van de zorgverzekering?',
				body: 'Voorkomen is goedkoper dan genezen, maar de leefstijlinterventie wordt nauwelijks vergoed.'
			}
		],
		answers: [
			'Sport is preventie, en toch behandelen we het als sluitpost. Ik steun uitbreiding van het Jeugdfonds Sport en Cultuur, zodat contributie en spullen nooit de reden zijn dat een kind niet meedoet. Dat verdient zich later terug in de zorgkosten.',
			'De sluiting van zwembaden en sporthallen door energiekosten is een direct gevolg van gemeentelijke begrotingen die niet meegroeien. Ik heb gevraagd om een verduurzamingsregeling specifiek voor sportaccommodaties, want die gebouwen zijn vaak het slechtst geïsoleerd.',
			'Gokreclames rond sport normaliseren gokken voor jongeren. Het ongerichte reclameverbod is een stap, maar sponsoring van clubs en stadions valt er nog buiten. Ik steun het uitbreiden van het verbod naar sportsponsoring.',
			'Over grensoverschrijdend gedrag: er zijn meldpunten en gedragscodes gekomen, maar de afhankelijkheidsrelatie tussen sporter en coach is niet veranderd. Ik vind dat er een onafhankelijke tuchtrechtspraak moet komen die niet door de sportbond zelf wordt bekostigd.'
		]
	},
	{
		key: 'europa',
		label: 'Europa',
		questions: [
			{
				title: 'Wat levert de Europese Unie Nederland concreet op?',
				body: 'Ik hoor vooral over afdrachten en regels. Wat staat daar tegenover?'
			},
			{
				title: 'Hoe kijkt u aan tegen uitbreiding van de EU met Oekraïne?',
				body: 'Dat heeft grote gevolgen voor de landbouwsubsidies en voor het stemgewicht van kleine landen.'
			},
			{
				title: 'Waarom kan Nederland niet zelf beslissen over stikstofregels?',
				body: 'Ik begrijp dat veel voortkomt uit Europese richtlijnen. Hoeveel ruimte is er dan nog?'
			},
			{
				title: 'Wat vindt u van het Europese asielpact?',
				body: 'Er wordt gezegd dat het probleem hiermee wordt opgelost. Klopt dat volgens u?'
			},
			{
				title: 'Hoe voorkomt u dat de interne markt oneerlijk wordt door staatssteun?',
				body: 'Grote landen kunnen hun industrie steunen, kleine landen niet. Hoe gaat u daarmee om?'
			},
			{
				title: 'Wat is uw standpunt over het vetorecht bij buitenlands beleid?',
				body: 'Eén land kan nu alles blokkeren en dat lijkt me niet werkbaar.'
			},
			{
				title: 'Hoe kijkt u aan tegen handelsverdragen zoals Mercosur?',
				body: 'Onze boeren moeten aan strenge eisen voldoen en dan komt er vlees binnen dat dat niet hoeft.'
			},
			{
				title: 'Wat doet Nederland aan de rechtsstaat in andere lidstaten?',
				body: 'Er gaat Europees geld naar landen waar de rechterlijke macht onder druk staat.'
			}
		],
		answers: [
			'De EU levert ons vooral toegang tot een markt waar het overgrote deel van onze export naartoe gaat; voor een handelsland als Nederland is dat geen abstractie maar de basis van onze welvaart. Dat neemt niet weg dat ik kritisch ben op regels die geen probleem oplossen.',
			'Uitbreiding met Oekraïne kan niet zonder hervorming van het landbouwbeleid en van de besluitvorming. Ik vind dat we dat eerlijk moeten benoemen in plaats van uitbreiding te beloven en de rekening later te presenteren.',
			'Veel van wat wij nationaal bespreken komt voort uit Europese richtlijnen, zoals de Habitatrichtlijn bij stikstof. De ruimte zit in de manier waarop we die vertalen naar nationaal beleid, en daar hebben we het onszelf soms onnodig moeilijk gemaakt.',
			'Over Mercosur ben ik kritisch. Als wij onze boeren aan de strengste eisen ter wereld houden, kunnen we niet tegelijk producten importeren die aan veel minder hoeven te voldoen. Spiegelclausules zijn wat mij betreft een harde voorwaarde.'
		]
	},
	{
		key: 'bestuur',
		label: 'bestuurlijke transparantie',
		questions: [
			{
				title: 'Waarom duurt een Woo-verzoek nog steeds zo lang?',
				body: 'Ik wacht ruim een jaar op stukken die volgens de wet binnen zes weken hadden gemoeten.'
			},
			{
				title: 'Wat vindt u van het lobbyregister voor bewindspersonen?',
				body: 'Er is een agenda online, maar daar staat vaak alleen „gesprek met vertegenwoordiger” in.'
			},
			{
				title: 'Hoe voorkomt u dat ambtenaren informatie achterhouden voor de Kamer?',
				body: 'Er zijn meerdere keren stukken pas na aandringen boven tafel gekomen.'
			},
			{
				title: 'Wat doet u aan de draaideur tussen politiek en bedrijfsleven?',
				body: 'Bewindspersonen gaan direct aan de slag in de sector waar ze over gingen.'
			},
			{
				title: 'Waarom worden zoveel taken uitbesteed aan externe adviesbureaus?',
				body: 'De kosten hiervan lopen in de honderden miljoenen per jaar.'
			},
			{
				title: 'Hoe verbetert u de positie van klokkenluiders?',
				body: 'Iedereen die ik erover hoor, komt er zelf slechter uit dan de misstand die werd gemeld.'
			},
			{
				title: 'Wat vindt u van het gebrek aan uitvoerbaarheidstoetsen bij nieuwe wetten?',
				body: 'Er wordt van alles bedacht dat de uitvoering niet aankan, en dan zijn burgers de dupe.'
			},
			{
				title: 'Krijgen gemeenten voldoende geld voor hun taken na 2026?',
				body: 'Er wordt gesproken over een ravijnjaar. Wat betekent dat voor voorzieningen hier?'
			}
		],
		answers: [
			'De doorlooptijden van Woo-verzoeken zijn structureel in strijd met de wet, en dat ondermijnt het vertrouwen. Ik vind dat departementen daar afrekenbaar op moeten zijn, met openbare kwartaalcijfers per ministerie en een dwangsom die daadwerkelijk wordt uitgekeerd.',
			'Het lobbyregister is er, maar de vulling is oppervlakkig. „Gesprek met vertegenwoordiger” zegt niets. Ik pleit voor het verplicht vermelden van organisatie en onderwerp, en voor een afkoelperiode van twee jaar voor bewindspersonen.',
			'De uitgaven aan externe inhuur zijn een symptoom van uitgeklede departementen. Op korte termijn lijkt inhuur goedkoop, op lange termijn verliest de overheid haar eigen kennis. Ik steun een harde norm voor het aandeel externe inhuur per ministerie.',
			'Het zogeheten ravijnjaar is een reële bedreiging voor bibliotheken, zwembaden en jeugdzorg tegelijk. Ik vind dat gemeenten een structurele en voorspelbare financiering verdienen in plaats van elk jaar opnieuw een incidentele reparatie.'
		]
	},
	{
		key: 'mkb',
		label: 'het mkb',
		questions: [
			{
				title: 'Wat doet u aan de regeldruk voor kleine ondernemers?',
				body: 'Ik heb een kapsalon met drie medewerkers en ben een dag per week met administratie bezig.'
			},
			{
				title: 'Waarom is het zo moeilijk om personeel in vaste dienst te nemen?',
				body: 'Twee jaar loondoorbetaling bij ziekte is voor een klein bedrijf een enorm risico.'
			},
			{
				title: 'Hoe kijkt u aan tegen de leegstand in winkelstraten?',
				body: 'In ons centrum staat een derde van de panden leeg en de huren blijven hoog.'
			},
			{
				title: 'Wat vindt u van de betaaltermijnen die grote bedrijven hanteren?',
				body: 'Wij moeten binnen dertig dagen betalen maar krijgen zelf pas na negentig dagen geld.'
			},
			{
				title: 'Komt er hulp voor ondernemers met een energiecontract uit 2022?',
				body: 'Wij zitten vast aan een tarief dat inmiddels drie keer de marktprijs is.'
			},
			{
				title: 'Hoe helpt u familiebedrijven bij de bedrijfsopvolging?',
				body: 'De regeling is aangepast en niemand weet precies meer wat er nu geldt.'
			},
			{
				title: 'Wat doet u tegen oneerlijke concurrentie van grote platforms?',
				body: 'Een webshop kan onmogelijk concurreren met een platform dat zelf ook verkoopt.'
			},
			{
				title: 'Is er nog toekomst voor de winkel in het dorp?',
				body: 'De laatste supermarkt hier overweegt te stoppen. Dan is er niets meer.'
			}
		],
		answers: [
			'Regeldruk is voor een bedrijf met drie medewerkers een heel ander probleem dan voor een concern met een juridische afdeling. Ik pleit voor een verplichte mkb-toets bij elke nieuwe wet, uitgevoerd door ondernemers zelf en niet door het ministerie.',
			'De loondoorbetaling bij ziekte is voor kleine werkgevers de belangrijkste reden om geen vast contract aan te bieden. Mijn fractie steunt verkorting naar één jaar voor bedrijven tot 25 medewerkers, met een collectieve verzekering voor het tweede jaar.',
			'Te lange betaaltermijnen zijn feitelijk een gedwongen lening van de kleine leverancier aan de grote afnemer. De wettelijke termijn van dertig dagen geldt inmiddels, maar handhaving ontbreekt. Ik vind dat de ACM hier actief op moet controleren.',
			'De leegstand in winkelstraten vraagt om transformatie naar wonen, en dat loopt vast op eigendom en op regels. Ik steun ruimere mogelijkheden voor gemeenten om functiewijziging af te dwingen bij langdurige leegstand.'
		]
	},
	{
		key: 'drugsbeleid',
		label: 'het drugsbeleid',
		questions: [
			{
				title: 'Wat vindt u van het experiment met gereguleerde wietteelt?',
				body: 'Het loopt inmiddels in een aantal gemeenten. Wat zijn tot nu toe de resultaten?'
			},
			{
				title: 'Hoe kijkt u aan tegen het verbod op lachgas in de praktijk?',
				body: 'De handel lijkt zich gewoon verplaatst te hebben naar de straat.'
			},
			{
				title: 'Wat doet u aan de gezondheidsrisico’s van vapes voor jongeren?',
				body: 'Op het schoolplein hier dampt de helft van de brugklas.'
			},
			{
				title: 'Waarom blijft Nederland een draaischijf voor cocaïne?',
				body: 'De vangsten in de haven worden groter, maar het lijkt niet minder te worden.'
			},
			{
				title: 'Wat vindt u van harm reduction als uitgangspunt?',
				body: 'Testen van pillen op festivals werd afgebouwd. Is dat een verstandige keuze?'
			},
			{
				title: 'Hoe voorkomt u dat drugsafval in de natuur wordt gedumpt?',
				body: 'In ons bos is dit jaar al twee keer een dumping gevonden en de gemeente betaalt het opruimen.'
			},
			{
				title: 'Wat is uw standpunt over het verbod op alcoholreclame?',
				body: 'Alcohol veroorzaakt meer schade dan veel verboden middelen, maar wordt volop gepromoot.'
			},
			{
				title: 'Krijgt verslavingszorg voldoende capaciteit?',
				body: 'Wachttijden bij de verslavingszorg lopen hier op tot een halfjaar.'
			}
		],
		answers: [
			'Het wietexperiment levert de eerste bruikbare gegevens op over een gereguleerde keten. Ik vind dat we die resultaten serieus moeten wegen in plaats van er ideologisch over te blijven praten; het huidige gedoogbeleid is voor niemand houdbaar.',
			'Het lachgasverbod heeft de handel deels verplaatst in plaats van gestopt, precies zoals verwacht werd. Handhaving op grote partijen bij de import is effectiever dan boetes op straat, en daar zou de capaciteit naartoe moeten.',
			'Vapes met zoete smaken zijn onmiskenbaar op jongeren gericht. Het smaakjesverbod is er, maar de illegale import groeit. Ik steun strengere controle bij pakketdiensten en hogere boetes voor verkopers die aan minderjarigen leveren.',
			'Harm reduction werkt aantoonbaar: pillen testen voorkomt ziekenhuisopnames en levert informatie over gevaarlijke partijen. Ik betreur de afbouw daarvan en vind dat we ons moeten laten leiden door gezondheidswinst, niet door symboliek.'
		]
	},
	{
		key: 'arbeidsmarkt',
		label: 'de arbeidsmarkt',
		questions: [
			{
				title: 'Wat doet u aan de arbeidsmarktkrapte in de publieke sector?',
				body: 'Zorg, onderwijs en politie concurreren nu met elkaar om dezelfde mensen.'
			},
			{
				title: 'Hoe kijkt u aan tegen de groei van het aantal zzp’ers?',
				body: 'In de zorg werkt bijna iedereen die ik ken inmiddels via een bemiddelaar.'
			},
			{
				title: 'Wat vindt u van de handhaving op schijnzelfstandigheid?',
				body: 'De Belastingdienst handhaaft weer, en nu weet niemand meer wat er mag.'
			},
			{
				title: 'Komt er een verplichte arbeidsongeschiktheidsverzekering voor zelfstandigen?',
				body: 'Ik ben zzp’er en kan me de premie eerlijk gezegd niet veroorloven.'
			},
			{
				title: 'Waarom werken zoveel vrouwen in deeltijd?',
				body: 'Ligt dat aan de kinderopvang, aan de cultuur of aan de belastingen?'
			},
			{
				title: 'Wat doet u tegen leeftijdsdiscriminatie bij sollicitaties?',
				body: 'Ik ben 57 en krijg na tweehonderd sollicitaties nog steeds geen gesprek.'
			},
			{
				title: 'Hoe kijkt u aan tegen een vierdaagse werkweek?',
				body: 'In andere landen wordt er geëxperimenteerd met behoud van loon.'
			},
			{
				title: 'Wat gebeurt er met mensen in de sociale werkvoorziening?',
				body: 'Sinds de Participatiewet is de instroom gestopt en zijn er nauwelijks beschutte plekken bij gekomen.'
			}
		],
		answers: [
			'De krapte in de publieke sector lossen we niet op met werven alleen, want we vissen met zijn allen in dezelfde vijver. Het gaat om zeggenschap, roosters en administratieve last; dat zijn de redenen waarom mensen vertrekken uit zorg en onderwijs.',
			'De groei van het aantal zzp’ers in de zorg is deels een vlucht uit slechte roosters. Ik vind handhaving op schijnzelfstandigheid terecht, maar die moet hand in hand gaan met betere voorwaarden in loondienst; anders verdwijnen mensen helemaal uit de sector.',
			'Een betaalbare arbeidsongeschiktheidsverzekering voor zelfstandigen is wat mij betreft onvermijdelijk. Op dit moment draagt de samenleving het risico van een zzp’er die uitvalt, zonder dat daar een premie tegenover staat.',
			'Leeftijdsdiscriminatie is verboden en komt toch stelselmatig voor. Ik pleit voor anoniem solliciteren bij de overheid als norm en voor stevigere bevoegdheden voor de Arbeidsinspectie om te controleren op wervingspraktijken.'
		]
	},
	{
		key: 'water',
		label: 'water en veiligheid',
		questions: [
			{
				title: 'Zijn onze dijken bestand tegen de zeespiegelstijging?',
				body: 'Ik woon in een polder onder NAP en lees steeds andere scenario’s.'
			},
			{
				title: 'Wat doet u tegen wateroverlast bij hevige buien in de stad?',
				body: 'Ons souterrain liep vorig jaar twee keer vol. De riolering kan het niet aan.'
			},
			{
				title: 'Hoe gaat u om met verzilting in de kustgebieden?',
				body: 'Telers hier merken dat het slootwater brakker wordt.'
			},
			{
				title: 'Waarom wordt er nog steeds gebouwd in diepe polders?',
				body: 'Water en bodem zouden sturend zijn, maar ik zie in mijn regio het tegenovergestelde.'
			},
			{
				title: 'Wat vindt u van de rol van waterschappen in het bestel?',
				body: 'De opkomst bij die verkiezingen is laag terwijl ze over grote belangen gaan.'
			},
			{
				title: 'Hoe houdt u drinkwater beschikbaar bij droogte?',
				body: 'Waterbedrijven waarschuwen dat er in sommige regio’s geen ruimte meer is voor nieuwe aansluitingen.'
			},
			{
				title: 'Wat doet u aan PFAS in het oppervlaktewater?',
				body: 'In de rivier hier zijn hoge waarden gemeten en er wordt gewaarschuwd tegen het eten van zelfgevangen vis.'
			},
			{
				title: 'Is er een plan voor de lange termijn na 2100?',
				body: 'Beslissingen over de kust en de rivieren gaan over generaties, niet over kabinetsperiodes.'
			}
		],
		answers: [
			'Onze waterveiligheid is op orde tot de wettelijke normen, maar die normen gaan uit van scenario’s die inmiddels aan de voorzichtige kant zijn. Ik vind dat we nu al ruimte moeten reserveren voor dijkversterking en rivierverruiming, want die ruimte bebouwen we anders onherroepelijk.',
			'Wateroverlast in steden is vooral een gevolg van verstening. Elke vierkante meter tegel die verdwijnt, helpt. Ik steun een landelijke norm voor waterberging bij nieuwbouw en renovatie, want vrijwilligheid levert te weinig op.',
			'PFAS in oppervlaktewater is een grensoverschrijdend probleem dat we niet alleen kunnen oplossen. Ik steun het Europese restrictievoorstel en vind tegelijk dat vergunningen voor lozingen hier veel strenger moeten worden getoetst.',
			'Water en bodem sturend is een goed principe dat in de praktijk nog te vaak wijkt voor korte termijn belangen. Ik vind dat het Rijk locaties in diepe polders zou moeten kunnen tegenhouden, ook als een gemeente er anders over denkt.'
		]
	},
	{
		key: 'gezondheid',
		label: 'preventie en volksgezondheid',
		questions: [
			{
				title: 'Wat doet u aan het toenemende aantal kinderen met overgewicht?',
				body: 'Op de school van mijn kinderen is de schoolkantine nog steeds vol met frisdrank.'
			},
			{
				title: 'Komt er een suikertaks op frisdrank?',
				body: 'In andere landen werkt dat kennelijk. Waarom hier niet?'
			},
			{
				title: 'Hoe kijkt u aan tegen het rookverbod en de verkooppunten van tabak?',
				body: 'Het aantal verkooppunten wordt beperkt, maar er komt van alles voor in de plaats.'
			},
			{
				title: 'Wat vindt u van de wachttijden bij de huisartsenpost?',
				body: 'Op zondagavond twee uur wachten met een kind met koorts is niet normaal.'
			},
			{
				title: 'Waarom sluiten er steeds meer ziekenhuisafdelingen in de regio?',
				body: 'De dichtstbijzijnde verloskunde is nu vijftig minuten rijden.'
			},
			{
				title: 'Hoe voorkomt u dat de acute zorg vastloopt?',
				body: 'Ambulances staan hier soms een uur te wachten voor overdracht.'
			},
			{
				title: 'Wat doet u aan de gezondheidsverschillen tussen wijken?',
				body: 'Het verschil in levensverwachting tussen twee wijken hier is meer dan zes jaar.'
			},
			{
				title: 'Krijgt preventie eindelijk een eigen budget?',
				body: 'Iedereen zegt dat voorkomen beter is, maar het geld gaat naar behandelen.'
			}
		],
		answers: [
			'Preventie verliest structureel van behandeling omdat de kosten en de baten bij verschillende partijen terechtkomen. Ik pleit voor een meerjarig preventiefonds dat niet elk jaar sneuvelt bij de voorjaarsnota, want anders blijft het bij goede voornemens.',
			'Een heffing op suikerhoudende dranken werkt aantoonbaar in landen die het hebben ingevoerd, zeker in combinatie met herformulering door fabrikanten. Ik steun invoering, mits de opbrengst terugvloeit naar gezonde voeding op scholen.',
			'De sluiting van afdelingen in de regio hangt samen met volumenormen en personeelstekort. Ik begrijp de kwaliteitsredenering, maar vind dat er een ondergrens moet zijn voor de aanrijtijd bij acute verloskunde; die norm wordt nu op papier gehaald en in de praktijk niet.',
			'De gezondheidsverschillen tussen wijken zijn hardnekkig en hangen samen met inkomen, wonen en werk. Dat betekent dat dit niet alleen een zorgvraagstuk is. Ik steun de aanpak via het Gezond en Actief Leven Akkoord, maar dan wel met een langere looptijd.'
		]
	}
];

// --- ASKERS ---

export const firstNames = [
	'Anna',
	'Pieter',
	'Fatima',
	'Jeroen',
	'Sanne',
	'Karim',
	'Lotte',
	'Willem',
	'Sofie',
	'Bram',
	'Yasmine',
	'Daan',
	'Marieke',
	'Youssef',
	'Eva',
	'Thijs',
	'Naomi',
	'Ruben',
	'Iris',
	'Sem',
	'Hicham',
	'Femke',
	'Lars',
	'Aylin',
	'Joost',
	'Nadia',
	'Tim',
	'Esther',
	'Kees',
	'Amira',
	'Bas',
	'Julia',
	'Mohammed',
	'Lieke',
	'Stijn',
	'Roos',
	'Ahmet',
	'Wouter',
	'Maud',
	'Jasper',
	'Selma',
	'Rick',
	'Hanna',
	'Mark',
	'Sara',
	'Dennis',
	'Nienke',
	'Erik',
	'Zeynep',
	'Koen',
	'Charlotte',
	'Rachid',
	'Elske',
	'Bart',
	'Milou',
	'Sander',
	'Anouk',
	'Freek',
	'Layla',
	'Gijs',
	'Ilse',
	'Hugo',
	'Merel',
	'Jelle',
	'Tessa',
	'Robin',
	'Noor',
	'Teun',
	'Saskia',
	'Arjen',
	'Loes',
	'Vincent',
	'Dilara',
	'Martijn',
	'Emma',
	'Peter',
	'Hannah',
	'Rob',
	'Isabel',
	'Frank',
	'Margriet',
	'Nick',
	'Ayse',
	'Paul',
	'Judith',
	'Simon',
	'Carla',
	'Tom',
	'Rianne',
	'Douwe',
	'Trijntje',
	'Henk',
	'Mirjam',
	'Jan',
	'Barbara',
	'Freddy',
	'Els',
	'Antoine',
	'Wietske',
	'Ger'
];

export const lastNames = [
	'de Vries',
	'Jansen',
	'van den Berg',
	'Bakker',
	'Visser',
	'Smit',
	'Meijer',
	'de Boer',
	'Mulder',
	'de Groot',
	'Bos',
	'Vos',
	'Peters',
	'Hendriks',
	'van Leeuwen',
	'Dekker',
	'Brouwer',
	'de Wit',
	'Dijkstra',
	'Smits',
	'de Graaf',
	'van der Meer',
	'van der Linden',
	'Kok',
	'Jacobs',
	'de Haan',
	'Vermeulen',
	'van den Heuvel',
	'van der Veen',
	'van den Broek',
	'de Bruijn',
	'de Jonge',
	'Schouten',
	'van Beek',
	'van der Heijden',
	'Willems',
	'Hoekstra',
	'Maas',
	'Verhoeven',
	'Koster',
	'van Dam',
	'van der Wal',
	'Prins',
	'Blom',
	'Huisman',
	'Peeters',
	'de Bie',
	'Postma',
	'Martens',
	'Kuipers',
	'Timmermans',
	'el Idrissi',
	'Yilmaz',
	'Ozturk',
	'Demir',
	'Kaya',
	'Aydin',
	'Benali',
	'Bouali',
	'Chakir',
	'Hamdaoui',
	'Nguyen',
	'Wong',
	'Sitanala',
	'Pattipeilohy',
	'Ramdas',
	'Jhingoeri',
	'Sewradj',
	'Codfried',
	'van Amelsvoort',
	'Oosterhuis',
	'Terpstra',
	'Bootsma',
	'Feenstra',
	'Attema',
	'van Rijn',
	'Cornelissen',
	'Nijhof',
	'Groenewoud',
	'Stevens',
	'Kuiper',
	'Roelofs',
	'Wolters',
	'Sanders'
];

// --- ANSWERS ---

// an answer core from the topic is wrapped in one of these, plus a closing line
export const answerVoices = [
	{
		open: (asker: string) => `Geachte ${asker},\n\nDank voor uw vraag.`,
		close: (name: string, fraction: string) =>
			`Met vriendelijke groet,\n${name}\nTweede Kamerlid, ${fraction}`
	},
	{
		open: (asker: string) => `Beste ${asker},\n\nDank voor uw bericht.`,
		close: (name: string) => `Met vriendelijke groet,\n${name}`
	},
	{
		open: (asker: string) => `Geachte ${asker},\n\nU stelt een terechte vraag.`,
		close: (name: string, fraction: string) => `Hartelijke groet,\n${name} (${fraction})`
	},
	{
		open: (asker: string) => `Beste ${asker},`,
		close: (name: string, fraction: string) =>
			`Met vriendelijke groet,\n\n${name}\nLid van de Tweede Kamer namens ${fraction}`
	}
];

// the empty one leaves the answer without a closing line
export const closingLines = [
	'Ik blijf hier in de commissie aandacht voor vragen.',
	'Mocht u aanvullende informatie hebben, dan hoor ik dat graag.',
	'Ik kom hier bij de begrotingsbehandeling op terug.',
	'Dank dat u de moeite nam om dit voor te leggen.',
	''
];

// --- MODERATION ---

export const approvalNotes = [
	'Duidelijke vraag, past binnen de portefeuille van dit Kamerlid.',
	'Iets ingekort in overleg niet nodig, tekst is helder genoeg.',
	'Onderwerp speelt momenteel, doorgestuurd.',
	'Vraagsteller heeft eerder ook gesteld, geen bezwaar.',
	'Twijfel over toonzetting, na tweede lezing toch goedgekeurd.',
	'Valt binnen de commissie waar dit lid in zit.',
	'Concrete vraag met context, prima.',
	'Randgeval qua individuele zaak, maar algemeen genoeg geformuleerd.'
];

export const rejectionNotes = [
	'Bevat volledige naam en adres van een derde.',
	'Richt zich op een gemeentelijke bevoegdheid.',
	'Scheldwoorden in de context, vraagsteller geïnformeerd.',
	'Duidelijk een persoonlijk dossier, doorverwezen naar het juiste loket.',
	'Duplicaat van een eerder goedgekeurde vraag.',
	'Reclame voor een eigen dienst.',
	'Onbegrijpelijk geformuleerd, vraagsteller kan opnieuw indienen.',
	'Tweede inzending van dezelfde strekking na eerdere afwijzing.'
];

// --- EDGE CASES ---

// awkward rows to stress the UI, search highlighting and slug generation. these sit
// outside the topic pools, so they carry their own answer instead of borrowing one
export const edgeCases: (SeedQuestion & {
	answer: string;
	// forces approval and an answer, for rows whose point is what the answer contains
	alwaysAnswered?: boolean;
	// draws listAnswer instead of `answer`
	listAnswer?: boolean;
})[] = [
	{
		// title at the 200 character cap
		title:
			'Waarom duurt het bij de aanvraag van een gehandicaptenparkeerkaart in onze gemeente inmiddels ruim zeven maanden voordat er een besluit valt, terwijl de wettelijke beslistermijn acht weken bedraagt?',
		body: 'Mijn vader is 79, slecht ter been en wacht sinds januari. Elke keer als wij bellen krijgen we te horen dat er achterstand is bij de medische keuring.',
		answer: '',
		alwaysAnswered: true,
		listAnswer: true
	},
	{
		// body at the 1000 character cap
		title: 'Hoe kijkt u aan tegen de stapeling van regelingen voor mensen met een beperking?',
		answer:
			'Wat u beschrijft is helaas geen uitzondering. Iemand met een blijvende aandoening moet zich in ons stelsel bij vijf of zes instanties telkens opnieuw bewijzen, elk met een eigen formulier en een eigen herbeoordelingstermijn. Ik pleit voor één integrale beoordeling die voor meerdere wetten tegelijk geldt, en voor het schrappen van herbeoordelingen bij aandoeningen die aantoonbaar niet verbeteren.',
		body: 'Ik schrijf u namens mijn zus. Zij heeft een niet-aangeboren hersenletsel na een ongeluk in 2019 en heeft sindsdien te maken met de Wmo, de Wlz, het UWV, de gemeente, de zorgverzekeraar en de Belastingdienst. Elk van die instanties hanteert een eigen definitie van wat zij wel en niet kan, een eigen aanvraagformulier en een eigen herbeoordelingstermijn. In vier jaar tijd heeft zij negentien keer opnieuw moeten aantonen dat haar situatie niet verbeterd is, terwijl uit alle rapporten blijkt dat dit ook niet gaat gebeuren. Het gevolg is dat wij als familie een tweede baan hebben aan het bijhouden van haar dossier, en dat zij zelf het overzicht volledig kwijt is. Ik vraag mij af of er in de Kamer wel eens gekeken wordt naar de optelsom van al die losse regelingen in plaats van naar iedere regeling apart, en of u bereid bent te pleiten voor één integrale beoordeling die voor meerdere wetten tegelijk geldt en die bij een blijvende aandoening niet elke twee jaar herhaald hoeft te worden.'
	},
	{
		// empty body, allowed by the form schema
		title: 'Waarom is het eigen risico niet gewoon afgeschaft?',
		body: '',
		answer:
			'Afschaffen van het eigen risico kost ruim vijf miljard euro per jaar en dat geld moet ergens vandaan komen, in de praktijk uit de premie of uit de belasting. Ik ben voor forse verlaging in combinatie met verplichte spreiding over het jaar, zodat niemand in januari voor een rekening van honderden euro’s tegelijk staat.'
	},
	{
		// diacritics, curly quotes and an em dash
		title:
			'Waarom heet het „energiearmoede” — en niet géwoon armoede, zoals mijn buurvrouw het noémt?',
		body: 'Wij wonen in een portiekflat uit ’62 met enkel glas. Café-eigenaar René hiernaast betaalt inmiddels meer aan energie dan aan huur. De term klinkt als een beleidscategorie, niet als een probleem.',
		answer:
			'U heeft gelijk dat de term iets verhult. Energiearmoede is armoede, met als verschil dat de oorzaak deels in de muren van uw woning zit. Juist daarom vind ik dat isolatie van de slechtste huurwoningen voorrang moet krijgen boven subsidies voor mensen die zelf al kunnen investeren.'
	},
	{
		// long compound words, tests the trigram half of search
		title: 'Wat vindt u van de arbeidsmarktkrapteproblematiek in de kinderopvangsector?',
		body: 'De personeelstekortenproblematiek en de huisvestingsopgave lopen hier door elkaar heen. Iedereen praat over kinderopvangtoeslagvereenvoudiging, maar niemand over de medewerkers zelf.',
		answer:
			'De krapte in de kinderopvang is het knelpunt waar alle andere plannen op stuklopen. Bijna gratis opvang zonder extra medewerkers levert alleen langere wachtlijsten op. Ik vind dat de invoering gelijk op moet gaan met betere arbeidsvoorwaarden en met erkenning van buitenlandse diploma’s.'
	},
	{
		// duplicate title, forces slugifyUnique to append a suffix
		title: 'Wat vindt u van het klimaatbeleid van dit kabinet?',
		body: 'Ik stel deze vraag bewust nog een keer, omdat het antwoord van vorig jaar inmiddels achterhaald is door de nieuwe raming van het Planbureau voor de Leefomgeving.',
		answer:
			'Terecht dat u de nieuwe raming aanhaalt. Die laat zien dat we met vastgesteld beleid onder de doelstelling voor 2030 uitkomen, en dat het gat vooral in de gebouwde omgeving en de industrie zit. Ik vind dat we daar de komende twee jaar op moeten sturen in plaats van opnieuw over doelen te onderhandelen.'
	},
	{
		// only "kwelderherstel" and "Waddenkust" tell this row apart, and both sit in the answer
		title: 'Wat gebeurt er met het gebied achter de dijk bij ons in de buurt?',
		body: 'Er wordt gesproken over plannen voor het buitendijkse gebied, maar in de stukken van het waterschap kan ik er niets over terugvinden.',
		answer:
			'Waar u op doelt is het kwelderherstel langs de Waddenkust. Dat programma loopt tot 2032 en combineert kustverdediging met natuurherstel; de kwelders dempen de golfslag en groeien mee met de zeespiegel. De plannen liggen bij het waterschap ter inzage, ik zal vragen waarom die stukken online zo slecht vindbaar zijn.',
		alwaysAnswered: true
	},
	{
		// digits and an abbreviation, which survive the word split in search
		title: 'Wat betekent artikel 6:162 BW voor slachtoffers van een datalek?',
		body: 'Na het datalek bij een webshop in 2024 kregen wij een brief van een claimstichting. Ik las over de AVG, de UAVG en over 500 euro immateriële schade per persoon. Wat is daarvan waar?',
		answer:
			'De AVG geeft recht op vergoeding van geleden schade, en de rechter toetst die claim via artikel 6:162 BW. Uit de eerste uitspraken blijkt dat bedragen van 500 euro zelden worden toegewezen zonder concrete onderbouwing. Ik vind wel dat de bewijslast nu te zwaar bij de burger ligt en heb daar vragen over gesteld.'
	},
	{
		// single word title
		title: 'Waarom?',
		body: 'Ik heb geen lange uitleg. Er is drie jaar over gepraat, er zijn twee rapporten geschreven en er is niets veranderd. Waarom?',
		answer:
			'Uw vraag is kort en het eerlijke antwoord is dat ook: omdat er geen meerderheid was. Twee rapporten leveren geen stemmen op, en zolang de Kamer verdeeld blijft over de dekking, blijft de uitvoering liggen. Dat is geen goed antwoord, maar het is wel het juiste.'
	}
];

// hard line breaks and a numbered list, drawn by the edge case flagged listAnswer
export const listAnswer = `Geachte mevrouw, geachte heer,

Dank voor uw vraag. Ik loop de punten langs die u noemt:

1. De wachttijd bij de keuring. Die is inderdaad opgelopen; het ministerie erkent dat en heeft extra keuringsartsen toegezegd.
2. De beslistermijn. Acht weken is de wettelijke termijn en die wordt op grote schaal overschreden. Een gemeente mag éénmalig verdagen, niet structureel.
3. De dwangsom. U kunt de gemeente in gebreke stellen. Doet u dat schriftelijk en aangetekend.

Ik heb hierover schriftelijke vragen ingediend bij de staatssecretaris en vraag daarin ook om een landelijk beeld van de doorlooptijden.

Met vriendelijke groet,`;
