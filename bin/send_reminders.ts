import { sendReminders } from '../src/lib/server/email/outbox.ts';

await sendReminders().catch((error) => console.error('Sending reminders failed:', error));

process.exit();