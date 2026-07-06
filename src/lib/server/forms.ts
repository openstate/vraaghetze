import { timingSafeEqual } from 'node:crypto';
import { z } from 'zod';

export type FormIssues<Schema extends z.ZodType> = Partial<
	Record<keyof z.output<Schema>, string[]>
>;

export async function validateForm<Schema extends z.ZodType>(request: Request, schema: Schema) {
	const formData = await request.formData();
	const rawData = Object.fromEntries(formData);
	const result = schema.safeParse(rawData);

	if (result.success)
		return {
			valid: true as const,
			data: result.data
		};

	return {
		valid: false as const,
		data: rawData,
		issues: z.flattenError(result.error).fieldErrors satisfies FormIssues<Schema>
	};
}

export const jsonString = <Schema extends z.ZodType>(schema: Schema) =>
	z.codec(z.string(), schema, {
		decode: (value, ctx) => {
			try {
				return JSON.parse(value) as z.input<Schema>;
			} catch {
				ctx.issues.push({ code: 'invalid_format', format: 'json', input: value });
				return z.NEVER;
			}
		},
		encode: (value) => JSON.stringify(value)
	});

export const safeEquals = (a: string, b: string) => {
	const provided = Buffer.from(a);
	const expected = Buffer.from(b);
	return provided.length === expected.length && timingSafeEqual(provided, expected);
};
