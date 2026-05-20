import { SQL, getTableColumns, sql } from 'drizzle-orm';
import { CasingCache } from 'drizzle-orm/casing';
import { PgTable } from 'drizzle-orm/pg-core';
import { SQLiteTable } from 'drizzle-orm/sqlite-core';
import { casing as casingType } from '.';

const casing = new CasingCache(casingType);

export function conflictColumns<T extends PgTable | SQLiteTable, Q extends keyof T['_']['columns']>(
	table: T,
	columns: Q[]
) {
	const cls = getTableColumns(table);
	return Object.fromEntries(
		columns.map((column) => [column, sql.raw(`excluded.${casing.getColumnCasing(cls[column])}`)])
	) as Record<Q, SQL>;
}
