/**
 * Domain error classes — thrown inside server models, surfaced through `Result`
 * (`{ success: false, error }`). Server components `unwrapResult(...)` which
 * re-throws into the nearest Suspense error boundary.
 */

export class DatabaseError extends Error {
  override readonly name = "DatabaseError";
}

export class NotFoundError extends Error {
  override readonly name = "NotFoundError";
}

export class RequestError extends Error {
  override readonly name = "RequestError";
}

export class TimeoutError extends Error {
  override readonly name = "TimeoutError";
}

export class ParseError extends Error {
  override readonly name = "ParseError";
}

export class UnauthenticatedError extends Error {
  override readonly name = "UnauthenticatedError";
}

export class UnauthorizedError extends Error {
  override readonly name = "UnauthorizedError";
}

export class InvalidCredentialsError extends Error {
  override readonly name = "InvalidCredentialsError";
}
