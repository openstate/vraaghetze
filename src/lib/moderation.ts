export type rejectionKey = 
  'spam_promotion' |
  'spam_mass' |
  'duplicate' |
  'personal_attack' |
  'offensive' |
  'victimizing' |
  'professional_secrecy';
export type allRejectionReasonsType = Record<rejectionKey, string>;

export const allRejectionReasons: allRejectionReasonsType = {
  'spam_promotion': 'Je vraag bevat commerciële promotie en past daarom niet op dit platform.',
  'spam_mass': 'Je hebt deze vraag al eerder gesteld.',
  'duplicate': 'Deze vraag is eerder gesteld en beantwoord. Bekijk het bestaande antwoord op de site.',
  'personal_attack': 'Je vraag bevat beledigende taal. Formuleer je vraag zakelijk en stel hem opnieuw.',
  'offensive': 'Je vraag bevat elementen van haat, onderdrukking of discriminatie.',
  'victimizing': 'Je vraag bevat negatieve bejegening van slachtoffers van ernstig leed.',
  'professional_secrecy': 'Je vraag bevat vertrouwelijke informatie en schendt het beroepsgeheim.'
}
// OUD - nog overnemen of verwijderen:
// 	'Je vraag bevat persoonsgegevens van iemand anders. Stel je vraag opnieuw zonder die gegevens.',
// 	'Je vraag is niet gericht aan een Kamerlid maar aan een uitvoeringsorganisatie. Neem daarvoor rechtstreeks contact op.',
// 	'Je vraag gaat over een individuele zaak. Kamerleden kunnen niet ingaan op persoonlijke dossiers.',
// 	,
// 	'Je vraag is te onduidelijk om door te sturen. Formuleer preciezer wat je wilt weten.',
// 	'Je vraag bevat een oproep die in strijd is met de spelregels van dit platform.'

export const rejectionReasonText = (rejectionReason?: string | null) => {
  if (!rejectionReason) return ''

  let reasons: rejectionKey[] = rejectionReason.split(',').map(reason => reason as rejectionKey)
  return reasons.map(reason => allRejectionReasons[reason]).join("<br/>")
}