import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';

import { AcbsException } from './acbs.exception';
import { AcbsUnexpectedException } from './acbs-unexpected.exception';

describe('AcbsAuthenticationFailedException', () => {
  const valueGenerator = new RandomValueGenerator();
  const message = valueGenerator.string();

  it('exposes the message it was created with', () => {
    const exception = new AcbsUnexpectedException(message);

    expect(exception.message).toBe(message);
  });

  it('exposes the name of the exception', () => {
    const exception = new AcbsUnexpectedException(message);

    expect(exception.name).toBe('AcbsUnexpectedException');
  });

  it('exposes the inner error it was created with', () => {
    const innerError = new Error();

    const exception = new AcbsUnexpectedException(message, innerError);

    expect(exception.innerError).toBe(innerError);
  });

  it('is instance of AcbsException', () => {
    expect(new AcbsUnexpectedException(message)).toBeInstanceOf(AcbsException);
  });
});
