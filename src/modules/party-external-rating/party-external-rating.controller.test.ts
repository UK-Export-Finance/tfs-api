import { RandomValueGenerator } from '@ukef-test/support/random-value-generator';
import { when } from 'jest-when';

import { PartyExternalRatingController } from './party-external-rating.controller';
import { PartyExternalRatingsProvider } from './party-external-ratings.provider';

describe('PartyExternalRatingController', () => {
  const valueGenerator = new RandomValueGenerator();

  describe('getExternalRatingsForParty', () => {
    const partyIdentifier = '010';

    const ratingEntityCodeA = valueGenerator.stringOfNumericCharacters();
    const assignedRatingCodeA = valueGenerator.stringOfNumericCharacters();
    const ratedDateA = valueGenerator.date();
    const probabilityofDefaultA = valueGenerator.probabilityFloat();
    const lossGivenDefaultA = valueGenerator.nonnegativeFloat();
    const riskWeightingA = valueGenerator.nonnegativeFloat();
    const externalRatingNote1A = valueGenerator.string();
    const externalRatingNote2A = valueGenerator.string();
    const externalRatingUserCode1A = valueGenerator.string();
    const externalRatingUserCode2A = valueGenerator.string();

    const ratingEntityCodeB = valueGenerator.stringOfNumericCharacters();
    const assignedRatingCodeB = valueGenerator.stringOfNumericCharacters();
    const ratedDateB = valueGenerator.date();
    const probabilityofDefaultB = valueGenerator.probabilityFloat();
    const lossGivenDefaultB = valueGenerator.nonnegativeFloat();
    const riskWeightingB = valueGenerator.nonnegativeFloat();
    const externalRatingNote1B = valueGenerator.string();
    const externalRatingNote2B = valueGenerator.string();
    const externalRatingUserCode1B = valueGenerator.string();
    const externalRatingUserCode2B = valueGenerator.string();

    const externalRatings = [
      {
        partyIdentifier: partyIdentifier,
        ratingEntity: {
          ratingEntityCode: ratingEntityCodeA,
        },
        assignedRating: {
          assignedRatingCode: assignedRatingCodeA,
        },
        ratedDate: ratedDateA,
        probabilityofDefault: probabilityofDefaultA,
        lossGivenDefault: lossGivenDefaultA,
        riskWeighting: riskWeightingA,
        externalRatingNote1: externalRatingNote1A,
        externalRatingNote2: externalRatingNote2A,
        externalRatingUserCode1: externalRatingUserCode1A,
        externalRatingUserCode2: externalRatingUserCode2A,
      },
      {
        partyIdentifier: partyIdentifier,
        ratingEntity: {
          ratingEntityCode: ratingEntityCodeB,
        },
        assignedRating: {
          assignedRatingCode: assignedRatingCodeB,
        },
        ratedDate: ratedDateB,
        probabilityofDefault: probabilityofDefaultB,
        lossGivenDefault: lossGivenDefaultB,
        riskWeighting: riskWeightingB,
        externalRatingNote1: externalRatingNote1B,
        externalRatingNote2: externalRatingNote2B,
        externalRatingUserCode1: externalRatingUserCode1B,
        externalRatingUserCode2: externalRatingUserCode2B,
      },
    ];

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

      expect(ratings).toStrictEqual(externalRatings);
    });

    it('does not return unexpected keys from the response', async () => {
      const externalRatingWithoutUnexpectedKey = externalRatings[0];
      const externalRatingWithUnexpectedKey = {
        ...externalRatingWithoutUnexpectedKey,
        unexpectedKey: valueGenerator.string(),
      };

      // eslint-disable-next-line jest/unbound-method
      when(partyExternalRatingsProvider.getExternalRatingsForParty).calledWith(partyIdentifier).mockResolvedValueOnce([externalRatingWithUnexpectedKey]);
      const ratings = await controller.getExternalRatingsForParty(partyIdentifier);

      expect(ratings).toStrictEqual([externalRatingWithoutUnexpectedKey]);
    });
  });
});
