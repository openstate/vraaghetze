<script lang="ts">
  type Props = {
    askerName: string,
    politicianName: string,
    questionTitle: string,
    questionUrl: string
  };
	let { askerName, politicianName, questionTitle, questionUrl }: Props = $props();
</script>
Beste {askerName},

Goed nieuws! Je vraag op VraagHetZe ("{questionTitle}") is geaccepteerd en doorgestuurd naar {politicianName}. Je vraag staat
nu openbaar op ons platform ({questionUrl}) en je vindt je vraag ook terug onder "Mijn vragen" in het menu.

Wij hopen dat je snel een reactie ontvangt via ons platform. Als dit langer dan twee weken duurt zullen we één keer een
herinneringsmail sturen naar {politicianName}.

Het kan gebeuren dat het Kamerlid niet reageert. We hebben geen invloed op het reactiegedrag van Kamerleden, dit mogen zij
zelf bepalen. De vraag blijft wel open staan op het platform en het wordt zichtbaar in het profiel van het Kamerlid dat zij
een vraag niet hebben beantwoord.

Met vriendelijke groet,

Het VraagHetZe-team
