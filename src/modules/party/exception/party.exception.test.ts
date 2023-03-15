import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';

import { PartyException } from './party-exception';

describe('PartyException', () => {
  const valueGenerator = new RandomValueGenerator();
  const message = valueGenerator.string();

  it('exposes the message it was created with', () => {
    const exception = new PartyException(message);

    expect(exception.message).toBe(message);
  });

  it('exposes the name of the exception', () => {
    const exception = new PartyException(message);

    expect(exception.name).toBe('PartyException');
  });

  it('exposes the inner error it was created with', () => {
    const innerError = new Error();
    const exception = new PartyException(message, innerError);

    expect(exception.innerError).toBe(innerError);
  });
});
