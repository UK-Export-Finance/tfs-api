import { GetPartyExternalRatingGenerator } from '@ukef-test/support/generator/get-party-external-rating-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { when } from 'jest-when';

import { PartyExternalRatingController } from './party-external-rating.controller';
import { PartyExternalRatingService } from './party-external-rating.service';

jest.mock('./party-external-rating.service');

describe('PartyExternalRatingController', () => {
  const valueGenerator = new RandomValueGenerator();

  describe('getExternalRatingsForParty', () => {
    const partyIdentifier = '010';

    const { externalRatings, externalRatingsFromApi: expectedExternalRatings } = new GetPartyExternalRatingGenerator(valueGenerator).generate({
      partyIdentifier,
      numberToGenerate: 2,
    });

    let partyExternalRatingService: PartyExternalRatingService;
    let controller: PartyExternalRatingController;

    let partyExternalRatingServiceGetExternalRatingsForParty: jest.Mock;

    beforeEach(() => {
      partyExternalRatingService = new PartyExternalRatingService(null, null);

      partyExternalRatingServiceGetExternalRatingsForParty = jest.fn();
      partyExternalRatingService.getExternalRatingsForParty = partyExternalRatingServiceGetExternalRatingsForParty;

      controller = new PartyExternalRatingController(partyExternalRatingService);
    });

    it('returns the external ratings for the party from the service', async () => {
      when(partyExternalRatingServiceGetExternalRatingsForParty).calledWith(partyIdentifier).mockResolvedValueOnce(externalRatings);

      const ratings = await controller.getExternalRatingsForParty(partyIdentifier);

      expect(ratings).toStrictEqual(expectedExternalRatings);
    });

    it('does NOT return unexpected keys from the external ratings from the service', async () => {
      const externalRatingWithUnexpectedKey = {
        ...externalRatings[0],
        unexpectedKey: valueGenerator.string(),
      };
      when(partyExternalRatingServiceGetExternalRatingsForParty).calledWith(partyIdentifier).mockResolvedValueOnce([externalRatingWithUnexpectedKey]);

      const ratings = await controller.getExternalRatingsForParty(partyIdentifier);

      expect(ratings).toStrictEqual([expectedExternalRatings[0]]);
    });
  });
});
