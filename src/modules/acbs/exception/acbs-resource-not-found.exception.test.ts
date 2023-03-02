import { RandomValueGenerator } from '@ukef-test/support/random-value-generator';

import { AcbsException } from './acbs.exception';
import { AcbsResourceNotFoundException } from './acbs-resource-not-found.exception';

describe('AcbsAuthenticationFailedException', () => {
  const valueGenerator = new RandomValueGenerator();
  const message = valueGenerator.string();

  it('exposes the message it was created with', () => {
    const exception = new AcbsResourceNotFoundException(message);

    expect(exception.message).toBe(message);
  });

  it('exposes the name of the exception', () => {
    const exception = new AcbsResourceNotFoundException(message);

    expect(exception.name).toBe('AcbsResourceNotFoundException');
  });

  it('exposes the inner error it was created with', () => {
    const innerError = new Error();

    const exception = new AcbsResourceNotFoundException(message, innerError);

    expect(exception.innerError).toBe(innerError);
  });

  it('is instance of AcbsException', () => {
    expect(new AcbsResourceNotFoundException(message)).toBeInstanceOf(AcbsException);
  });
});
