import type { Detail } from "./components/details-dialog.svelte";
import { questionStatusPills } from "./components/status-pill.svelte";
import { HTMLSafeString } from "./general";
import { rejectionReasonTexts, type QuestionStatus } from "./moderation";
import type { ListQuestionType } from "./server/moderation";

export const statusToText = {
		pending: 'Ongemodereerde vraag',
		'pending-wrong-politician': 'Andere politicus voorgesteld',
		approved: 'Goedgekeurde vraag',
		rejected: 'Afgewezen vraag',
		answered: 'Beantwoorde vraag'
} satisfies Record<QuestionStatus, string>;

export function questionDetails(row: ListQuestionType) {
  return [
		['Id', row.id, true],
    ['Vraag', row.title],
    ['Context', row.body || '—'],
    ['Vraagsteller', row.authorName],
    ['Kamerlid', row.politicianName],
    ['Aangemaakt op', row.createdAt],
    ['Moderatiestatus', questionStatusPills[row.status].label],
    [
      'Moderatiereden',
      new HTMLSafeString(rejectionReasonTexts(row.rejectionReason).join('<br/>'))
    ],
    ['Moderatienotitie', row.note],
    ['Gemodereerd op', row.moderatedAt],
    ['Gemodereerd door', row.moderatorName],
    ['Beantwoord op', row.answerStatus === 'approved' ? row.answeredAt : null],
    ['Antwoordstatus', row.answerStatus && questionStatusPills[row.answerStatus].label],
		['ActionableChangePolitician', row.status == 'approved', true]

  ] satisfies Detail[];
}
