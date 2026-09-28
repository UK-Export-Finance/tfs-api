/**
 * Subset of HTTP status codes used by tfs-functions.
 * Defined locally to avoid depending on `@nestjs/common`.
 */
export enum HttpStatus {
  CREATED = 201,
  BAD_REQUEST = 400,
}
