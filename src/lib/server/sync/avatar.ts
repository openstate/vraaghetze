import { eq, isNull } from 'drizzle-orm';
import sharp from 'sharp';
import { db, schema } from '../db';
import type { Politician } from './transform';

const AVATAR_SIZE = 256;
const ODATA_BASE_URL = 'https://gegevensmagazijn.tweedekamer.nl/OData/v4/2.0';
const CONCURRENCY = 4;

async function fetchAndSaveAvatar(politicianId: string, userId: string) {
	const url = `${ODATA_BASE_URL}/Persoon/${politicianId}/resource`;
	const res = await fetch(url);
	if (!res.ok) {
		console.log(`Skip avatar ${politicianId}: ${res.status}`);
		return;
	}

	const buffer = Buffer.from(await res.arrayBuffer());
	const webp = await sharp(buffer)
		.resize(AVATAR_SIZE, AVATAR_SIZE, { fit: 'cover', position: 'top' })
		.webp({ quality: 80 })
		.toBuffer();

	const image = `data:image/webp;base64,${webp.toString('base64')}`;

	await db.update(schema.user).set({ image }).where(eq(schema.user.id, userId));
}

export async function syncAvatars(politicians: Politician[]) {
	const missing = await db
		.select({ id: schema.user.id })
		.from(schema.user)
		.where(isNull(schema.user.image));

	const missingIds = new Set(missing.map((row) => row.id));

	// matches if the politician has no avatar stored yet
	const toFetch = politicians.filter((pol) => missingIds.has(pol.user.id));

	console.log(`Fetching ${toFetch.length} avatars`);

	for (let index = 0; index < toFetch.length; index += CONCURRENCY) {
		const batch = toFetch.slice(index, index + CONCURRENCY);
		await Promise.all(batch.map((pol) => fetchAndSaveAvatar(pol.politician.id, pol.user.id)));
	}
}
