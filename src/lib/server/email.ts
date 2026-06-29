interface EmailOptions {
	to: string;
	subject: string;
	text: string;
}

export async function sendEmail({ to, subject, text }: EmailOptions) {
	if (process.env.NODE_ENV === 'development') {
		console.log(`Email to ${to}: ${subject}\n${text}`);
		return;
	}

	const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			personalizations: [{ to: [{ email: to }] }],
			from: { name: 'VraagHetZe', email: `noreply@${process.env.EMAIL_DOMAIN}` },
			reply_to: { email: process.env.EMAIL_INBOX },
			subject,
			content: [{ type: 'text/plain', value: text }]
		})
	});

	if (!response.ok) {
		throw new Error(`Failed to send email: ${response.status} ${await response.text()}`);
	}
}
