import { applyAction, deserialize } from "$app/forms";
import { invalidateAll } from "$app/navigation";
import type { ActionResult } from "@sveltejs/kit";

export type ENV_TYPE = 'development' | 'production' | 'staging';

export class HTMLSafeString {
  public value: string;

  constructor(value: string) {
    this.value = value;
  }  
}

export const submitDirectly = async (
  currentTarget: HTMLFormElement,
  submitter: HTMLElement | null,
  addFields: { [key: string]: string} = {}
) => {
  const formData = new FormData(currentTarget, submitter);
  for (const [k,v] of Object.entries(addFields)) {
    formData.append(k, v);
  }

  const response = await fetch('', {
    method: 'POST',
    body: formData
  });

  const result: ActionResult = deserialize(await response.text());
  if (result.type === 'success') {
    // rerun all `load` functions, following the successful update
    await invalidateAll();
  }

  applyAction(result);
}

import { PgDialect } from 'drizzle-orm/pg-core'
import { TypedQueryBuilder } from 'drizzle-orm/query-builders/query-builder'

export function drizzleQueryToSQLString<T>(query: TypedQueryBuilder<T>): string {
  const pgDialect = new PgDialect()

  // Build the SQL obj and inline parameters
  const sql = query.getSQL().inlineParams()

  // Convert to a raw SQL string
  return pgDialect.sqlToQuery(sql).sql
}
