import { PartyExternalRatingGenerator } from '@ukef-test/support/generator/party-external-rating-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { when } from 'jest-when';

import { PartyExternalRatingController } from './party-external-rating.controller';
import { PartyExternalRatingService } from './party-external-rating.service';

jest.mock('./party-external-rating.service');

describe('PartyExternalRatingController', () => {
  const valueGenerator = new RandomValueGenerator();

  describe('getExternalRatingsForParty', () => {
    const partyIdentifier = '010';

    const { externalRatings, externalRatingsFromApi: expectedExternalRatings } = new PartyExternalRatingGenerator(valueGenerator).generate({
      partyIdentifier,
      numberToGenerate: 2,
    });

    let partyExternalRatingService: PartyExternalRatingService;
    let controller: PartyExternalRatingController;

    beforeEach(() => {
      partyExternalRatingService = new PartyExternalRatingService(null, null);
      controller = new PartyExternalRatingController(partyExternalRatingService);
    });

    it('returns the external ratings for the party from the service', async () => {
      // eslint-disable-next-line jest/unbound-method
      when(partyExternalRatingService.getExternalRatingsForParty).calledWith(partyIdentifier).mockResolvedValueOnce(externalRatings);

      const ratings = await controller.getExternalRatingsForParty(partyIdentifier);

      expect(ratings).toStrictEqual(expectedExternalRatings);
    });

    it('does NOT return unexpected keys from the external ratings from the service', async () => {
      const externalRatingWithUnexpectedKey = {
        ...externalRatings[0],
        unexpectedKey: valueGenerator.string(),
      };
      // eslint-disable-next-line jest/unbound-method
      when(partyExternalRatingService.getExternalRatingsForParty).calledWith(partyIdentifier).mockResolvedValueOnce([externalRatingWithUnexpectedKey]);

      const ratings = await controller.getExternalRatingsForParty(partyIdentifier);

      expect(ratings).toStrictEqual([expectedExternalRatings[0]]);
    });
  });
});
