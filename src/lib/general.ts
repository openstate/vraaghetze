export class HTMLSafeString {
  public value: string;

  constructor(value: string) {
    this.value = value;
  }  
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