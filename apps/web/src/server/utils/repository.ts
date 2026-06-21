/**
 * Repository pattern over the in-memory store. Every model owns one collection
 * and accesses it only through `repository(collection)` — never the raw arrays.
 * The query surface (predicate-based `find`/`paginate`) is what a Drizzle-backed
 * implementation will mirror with `where: eq(...)` clauses.
 */

import { persist } from "@/server/database/store";

type Identifiable = { id: string };

export type Page<Row> = {
  rows: Row[];
  page: number;
  pageSize: number;
  total: number;
  pageCount: number;
};

export const repository = <Row extends Identifiable>(collection: Row[]) => ({
  get: async (id: string): Promise<Row | null> =>
    collection.find((row) => row.id === id) ?? null,

  find: async (predicate: (row: Row) => boolean = () => true): Promise<Row[]> =>
    collection.filter(predicate),

  paginate: async (
    predicate: (row: Row) => boolean = () => true,
    { page = 1, pageSize = 20 }: { page?: number; pageSize?: number } = {},
  ): Promise<Page<Row>> => {
    const matched = collection.filter(predicate);
    const start = (page - 1) * pageSize;
    return {
      rows: matched.slice(start, start + pageSize),
      page,
      pageSize,
      total: matched.length,
      pageCount: Math.max(1, Math.ceil(matched.length / pageSize)),
    };
  },

  create: async (row: Row): Promise<Row> => {
    collection.push(row);
    persist();
    return row;
  },

  update: async (id: string, patch: Partial<Row>): Promise<Row | null> => {
    const existing = collection.find((row) => row.id === id);
    if (!existing) return null;
    Object.assign(existing, patch);
    persist();
    return existing;
  },

  destroy: async (id: string): Promise<boolean> => {
    const index = collection.findIndex((row) => row.id === id);
    if (index === -1) return false;
    collection.splice(index, 1);
    persist();
    return true;
  },

  exists: async (predicate: (row: Row) => boolean): Promise<boolean> =>
    collection.some(predicate),

  count: async (
    predicate: (row: Row) => boolean = () => true,
  ): Promise<number> => collection.filter(predicate).length,
});
