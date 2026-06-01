import { z } from 'zod';

export type FormIssues<Schema extends z.ZodType> = Partial<
	Record<keyof z.output<Schema>, string[]>
>;

export async function validateForm<Schema extends z.ZodType>(request: Request, schema: Schema) {
	const formData = await request.formData();
	const result = schema.safeParse(Object.fromEntries(formData));

	if (result.success)
		return {
			valid: true as const,
			data: result.data
		};

	return {
		valid: false as const,
		issues: z.flattenError(result.error).fieldErrors satisfies FormIssues<Schema>
	};
}
