import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';

import { MdmException } from './mdm.exception';
import { MdmResourceNotFoundException } from './mdm-resource-not-found.exception';

describe('MdmResourceNotFoundException', () => {
  const valueGenerator = new RandomValueGenerator();
  const message = valueGenerator.string();

  it('exposes the message it was created with', () => {
    const exception = new MdmResourceNotFoundException(message);

    expect(exception.message).toBe(message);
  });

  it('exposes the name of the exception', () => {
    const exception = new MdmResourceNotFoundException(message);

    expect(exception.name).toBe('MdmResourceNotFoundException');
  });

  it('exposes the inner error it was created with', () => {
    const innerError = new Error();

    const exception = new MdmResourceNotFoundException(message, innerError);

    expect(exception.innerError).toBe(innerError);
  });

  it('is instance of MdmException', () => {
    expect(new MdmResourceNotFoundException(message)).toBeInstanceOf(MdmException);
  });
});
