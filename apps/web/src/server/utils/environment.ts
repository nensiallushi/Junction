/**
 * Server actions accept an optional leading `Environment` argument. Server
 * components call them with `Environment.SERVER`; client callers omit it (it
 * defaults to `Environment.CLIENT`). The context wrappers (`context.ts`) sniff
 * the first argument to tell the two call styles apart.
 */
export const Environment = {
  SERVER: "server",
  CLIENT: "client",
} as const;

export type Environment = (typeof Environment)[keyof typeof Environment];

export const isEnvironment = (value: unknown): value is Environment =>
  value === Environment.SERVER || value === Environment.CLIENT;
