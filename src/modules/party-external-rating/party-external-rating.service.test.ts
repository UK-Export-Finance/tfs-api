import { AcbsPartyExternalRatingService } from '@ukef/modules/acbs/acbs-party-external-rating.service';
import { AcbsAuthenticationService } from '@ukef/modules/acbs-authentication/acbs-authentication.service';
import { getMockAcbsAuthenticationService } from '@ukef-test/support/abcs-authentication.service.mock';
import { PartyExternalRatingGenerator } from '@ukef-test/support/generator/party-external-rating-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { when } from 'jest-when';

import { PartyExternalRatingService } from './party-external-rating.service';

jest.mock('@ukef/modules/acbs/acbs-party-external-rating.service');
jest.mock('@ukef/modules/acbs-authentication/acbs-authentication.service');

describe('PartyExternalRatingService', () => {
  const valueGenerator = new RandomValueGenerator();
  const authToken = valueGenerator.string();

  let acbsAuthenticationService: AcbsAuthenticationService;
  let acbsService: AcbsPartyExternalRatingService;
  let service: PartyExternalRatingService;

  let acbsPartyExternalRatingServiceGetExternalRatingsForParty: jest.Mock;

  beforeEach(() => {
    const mockAcbsAuthenticationService = getMockAcbsAuthenticationService();
    acbsAuthenticationService = mockAcbsAuthenticationService.service;
    const acbsAuthenticationServiceGetIdToken = mockAcbsAuthenticationService.getIdToken;
    when(acbsAuthenticationServiceGetIdToken).calledWith().mockResolvedValueOnce(authToken);

    acbsService = new AcbsPartyExternalRatingService(null, null);
    acbsPartyExternalRatingServiceGetExternalRatingsForParty = jest.fn();
    acbsService.getExternalRatingsForParty = acbsPartyExternalRatingServiceGetExternalRatingsForParty;

    service = new PartyExternalRatingService(acbsAuthenticationService, acbsService);
  });

  describe('getExternalRatingsForParty', () => {
    const partyIdentifier = valueGenerator.stringOfNumericCharacters();

    it('returns a transformation of the external ratings from ACBS', async () => {
      const { externalRatingsInAcbs, externalRatings: expectedExternalRatings } = new PartyExternalRatingGenerator(valueGenerator).generate({
        partyIdentifier,
        numberToGenerate: 2,
      });
      when(acbsPartyExternalRatingServiceGetExternalRatingsForParty).calledWith(partyIdentifier, authToken).mockResolvedValueOnce(externalRatingsInAcbs);

      const externalRatings = await service.getExternalRatingsForParty(partyIdentifier);

      expect(externalRatings).toStrictEqual(expectedExternalRatings);
    });

    it('returns an empty array if ACBS returns an empty array', async () => {
      when(acbsPartyExternalRatingServiceGetExternalRatingsForParty).calledWith(partyIdentifier, authToken).mockResolvedValueOnce([]);

      const externalRatings = await service.getExternalRatingsForParty(partyIdentifier);

      expect(externalRatings).toStrictEqual([]);
    });
  });
});
