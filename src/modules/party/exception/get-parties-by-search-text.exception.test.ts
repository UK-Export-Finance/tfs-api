import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';

import { GetPartiesBySearchTextException } from './get-parties-by-search-text.exception';
import { PartyException } from './party-exception';

describe('GetPartiesBySearchTextException', () => {
  const valueGenerator = new RandomValueGenerator();
  const message = valueGenerator.string();

  it('exposes the message it was created with', () => {
    const exception = new GetPartiesBySearchTextException(message);

    expect(exception.message).toBe(message);
  });

  it('exposes the name of the exception', () => {
    const exception = new GetPartiesBySearchTextException(message);

    expect(exception.name).toBe('GetPartiesBySearchTextException');
  });

  it('exposes the inner error it was created with', () => {
    const innerError = new Error();
    const exception = new GetPartiesBySearchTextException(message, innerError);

    expect(exception.innerError).toBe(innerError);
  });

  it('is instance of PartyException', () => {
    expect(new GetPartiesBySearchTextException(message)).toBeInstanceOf(PartyException);
  });
});
