import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';

import { AcbsException } from './acbs.exception';
import { AcbsBadRequestException } from './acbs-bad-request.exception';

describe('AcbsAuthenticationFailedException', () => {
  const valueGenerator = new RandomValueGenerator();
  const message = valueGenerator.string();

  it('exposes the message it was created with', () => {
    const exception = new AcbsBadRequestException(message);

    expect(exception.message).toBe(message);
  });

  it('exposes the name of the exception', () => {
    const exception = new AcbsBadRequestException(message);

    expect(exception.name).toBe('AcbsBadRequestException');
  });

  it('exposes the inner error it was created with', () => {
    const innerError = new Error();

    const exception = new AcbsBadRequestException(message, innerError);

    expect(exception.innerError).toBe(innerError);
  });

  it('exposes the error body it was created with', () => {
    const innerError = new Error();
    const errorBody = JSON.stringify({ errorMessage: valueGenerator.string() });

    const exception = new AcbsBadRequestException(message, innerError, errorBody);

    expect(exception.errorBody).toBe(errorBody);
  });

  it('is instance of AcbsException', () => {
    expect(new AcbsBadRequestException(message)).toBeInstanceOf(AcbsException);
  });
});
