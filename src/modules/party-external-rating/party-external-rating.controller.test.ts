import { PartyExternalRatingGenerator } from '@ukef-test/support/generator/party-external-rating-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { when } from 'jest-when';

import { PartyExternalRatingController } from './party-external-rating.controller';
import { PartyExternalRatingsProvider } from './party-external-ratings.provider';

describe('PartyExternalRatingController', () => {
  const valueGenerator = new RandomValueGenerator();

  describe('getExternalRatingsForParty', () => {
    const partyIdentifier = '010';

    const { externalRatings, externalRatingsFromApi: expectedExternalRatings } = new PartyExternalRatingGenerator(valueGenerator).generate({
      partyIdentifier,
      numberToGenerate: 2,
    });

    let partyExternalRatingsProvider: PartyExternalRatingsProvider;
    let controller: PartyExternalRatingController;

    beforeEach(() => {
      partyExternalRatingsProvider = {
        getExternalRatingsForParty: jest.fn(),
      };
      controller = new PartyExternalRatingController(partyExternalRatingsProvider);
    });

    it('returns the external ratings for the party from the provider', async () => {
      // eslint-disable-next-line jest/unbound-method
      when(partyExternalRatingsProvider.getExternalRatingsForParty).calledWith(partyIdentifier).mockResolvedValueOnce(externalRatings);

      const ratings = await controller.getExternalRatingsForParty(partyIdentifier);

      expect(ratings).toStrictEqual(expectedExternalRatings);
    });

    it('does not return unexpected keys from the response', async () => {
      const externalRatingWithUnexpectedKey = {
        ...externalRatings[0],
        unexpectedKey: valueGenerator.string(),
      };
      // eslint-disable-next-line jest/unbound-method
      when(partyExternalRatingsProvider.getExternalRatingsForParty).calledWith(partyIdentifier).mockResolvedValueOnce([externalRatingWithUnexpectedKey]);

      const ratings = await controller.getExternalRatingsForParty(partyIdentifier);

      expect(ratings).toStrictEqual([expectedExternalRatings[0]]);
    });
  });
});
