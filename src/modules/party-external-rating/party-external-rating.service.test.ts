import { AcbsPartyExternalRatingService } from '@ukef/modules/acbs/acbs-party-external-rating.service';
import { PartyExternalRatingGenerator } from '@ukef-test/support/generator/party-external-rating-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { when } from 'jest-when';

import { AcbsAuthenticationService } from '../acbs/acbs-authentication.service';
import { PartyExternalRatingService } from './party-external-rating.service';

jest.mock('@ukef/modules/acbs/acbs-party-external-rating.service');
jest.mock('@ukef/modules/acbs/acbs-authentication.service');

describe('PartyExternalRatingService', () => {
  const valueGenerator = new RandomValueGenerator();
  const authToken = valueGenerator.string();

  let acbsAuthenticationService: AcbsAuthenticationService;
  let acbsService: AcbsPartyExternalRatingService;
  let service: PartyExternalRatingService;

  let acbsPartyExternalRatingServiceGetExternalRatingsForParty: jest.Mock;

  beforeEach(() => {
    acbsAuthenticationService = new AcbsAuthenticationService(null, null, null);
    const acbsAuthenticationServiceGetIdToken = jest.fn();
    acbsAuthenticationService.getIdToken = acbsAuthenticationServiceGetIdToken;
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
