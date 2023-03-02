import { NotFoundException } from '@nestjs/common';
import { AcbsService } from '@ukef/modules/acbs/acbs.service';
import { RandomValueGenerator } from '@ukef-test/support/random-value-generator';
import { when } from 'jest-when';

import { AcbsAuthenticationService } from '../acbs/acbs-authentication.service';
import { AcbsResourceNotFoundException } from '../acbs/exception/acbs-resource-not-found.exception';
import { AcbsPartyExternalRatingsProvider } from './acbs-party-external-ratings.provider';

jest.mock('@ukef/modules/acbs/acbs.service');
jest.mock('@ukef/modules/acbs/acbs-authentication.service');

describe('AcbsPartyExternalRatingsProvider', () => {
  const valueGenerator = new RandomValueGenerator();
  const authToken = valueGenerator.string();
  const baseUrl = valueGenerator.string();

  let acbsAuthenticationService: AcbsAuthenticationService;
  let acbsService: AcbsService;
  let provider: AcbsPartyExternalRatingsProvider;

  beforeEach(() => {
    acbsAuthenticationService = new AcbsAuthenticationService(null, null, null);
    acbsService = new AcbsService(null, null);
    provider = new AcbsPartyExternalRatingsProvider(acbsAuthenticationService, acbsService);
  });

  describe('getExternalRatingsForParty', () => {
    const partyIdentifier = '001';

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

    const externalRatingsInAcbs = [
      {
        PartyIdentifier: partyIdentifier,
        RatingEntity: {
          RatingEntityCode: ratingEntityCodeA,
        },
        AssignedRating: {
          AssignedRatingCode: assignedRatingCodeA,
        },
        RatedDate: ratedDateA,
        ProbabilityofDefault: probabilityofDefaultA,
        LossGivenDefault: lossGivenDefaultA,
        RiskWeighting: riskWeightingA,
        ExternalRatingNote1: externalRatingNote1A,
        ExternalRatingNote2: externalRatingNote2A,
        ExternalRatingUserCode1: {
          UserCode1: externalRatingUserCode1A,
        },
        ExternalRatingUserCode2: {
          UserCode2: externalRatingUserCode2A,
        },
      },
      {
        PartyIdentifier: partyIdentifier,
        RatingEntity: {
          RatingEntityCode: ratingEntityCodeB,
        },
        AssignedRating: {
          AssignedRatingCode: assignedRatingCodeB,
        },
        RatedDate: ratedDateB,
        ProbabilityofDefault: probabilityofDefaultB,
        LossGivenDefault: lossGivenDefaultB,
        RiskWeighting: riskWeightingB,
        ExternalRatingNote1: externalRatingNote1B,
        ExternalRatingNote2: externalRatingNote2B,
        ExternalRatingUserCode1: {
          UserCode1: externalRatingUserCode1B,
        },
        ExternalRatingUserCode2: {
          UserCode2: externalRatingUserCode2B,
        },
      },
    ];

    const expectedExternalRatings = [
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

    it('returns a transformation of the external ratings from ACBS', async () => {
      // eslint-disable-next-line jest/unbound-method
      when(acbsAuthenticationService.getIdToken).calledWith().mockResolvedValueOnce(authToken);
      // eslint-disable-next-line jest/unbound-method
      when(acbsService.getExternalRatingsForParty).calledWith(partyIdentifier, authToken).mockResolvedValueOnce(externalRatingsInAcbs);

      const externalRatings = await provider.getExternalRatingsForParty(partyIdentifier);

      expect(externalRatings).toStrictEqual(expectedExternalRatings);
    });

    it('returns an empty array if ACBS returns an empty array', async () => {
      // eslint-disable-next-line jest/unbound-method
      when(acbsAuthenticationService.getIdToken).calledWith().mockResolvedValueOnce(authToken);
      // eslint-disable-next-line jest/unbound-method
      when(acbsService.getExternalRatingsForParty).calledWith(partyIdentifier, authToken).mockResolvedValueOnce([]);

      const externalRatings = await provider.getExternalRatingsForParty(partyIdentifier);

      expect(externalRatings).toStrictEqual([]);
    });
  });
});
