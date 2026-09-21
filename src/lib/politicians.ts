export function notAcceptingQuestionsText(name: string, email: string) {
  return `Dit Kamerlid heeft ervoor gekozen niet openbaar antwoord te geven via VraagHetZe. Je kunt ${name} een bericht sturen via ${email}.`
}

export function preventAdding(event: Event, disable?: boolean) {
  if (disable) event.preventDefault();
}
