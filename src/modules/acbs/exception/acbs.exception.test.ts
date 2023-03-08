import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';

import { AcbsException } from './acbs.exception';
import { AcbsAuthenticationFailedException } from './acbs-authentication-failed.exception';

describe('AcbsException', () => {
  const valueGenerator = new RandomValueGenerator();
  const message = valueGenerator.string();

  it('exposes the message it was created with', () => {
    const exception = new AcbsException(message);

    expect(exception.message).toBe(message);
  });

  it('exposes the name of the exception', () => {
    const exception = new AcbsException(message);

    expect(exception.name).toBe('AcbsException');
  });

  it('exposes the inner error it was created with', () => {
    const innerError = new Error();

    const exception = new AcbsException(message, innerError);

    expect(exception.innerError).toBe(innerError);
  });
});
