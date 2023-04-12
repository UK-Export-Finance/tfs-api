import { HttpStatus } from '@nestjs/common/enums/http-status.enum';
import { HttpException } from '@nestjs/common/exceptions/http.exception';

/**
 * Defines an HTTP exception for 204 *No Content* type responses.
 *
 * TODO: Plan was to return empty array to the client, but it is not working at the moment.
 * TODO: Add message parameter and logging of precise error.
 *
 * @publicApi
 */
export class AcbsNoContentException extends HttpException {
  /**
   * Instantiate a `NoContentException` Exception.
   *
   * @example
   * `throw new NoContentException()`
   *
   * @usageNotes
   * The HTTP response status code will be 204.
   * Plan was to return empty array to the client, but it is not working at the moment.
   *
   */
  constructor() {
    super('[]', HttpStatus.NO_CONTENT);
  }
}
