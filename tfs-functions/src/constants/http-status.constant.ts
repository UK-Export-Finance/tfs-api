/**
 * Subset of HTTP status codes used by tfs-functions.
 * Defined locally to avoid depending on `@nestjs/common`.
 */
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
}
