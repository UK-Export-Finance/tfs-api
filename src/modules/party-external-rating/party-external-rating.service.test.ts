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

  beforeEach(() => {
    acbsAuthenticationService = new AcbsAuthenticationService(null, null, null);
    acbsService = new AcbsPartyExternalRatingService(null, null);
    service = new PartyExternalRatingService(acbsAuthenticationService, acbsService);

    // eslint-disable-next-line jest/unbound-method
    when(acbsAuthenticationService.getIdToken).calledWith().mockResolvedValueOnce(authToken);
  });

  describe('getExternalRatingsForParty', () => {
    const partyIdentifier = valueGenerator.stringOfNumericCharacters();

    it('returns a transformation of the external ratings from ACBS', async () => {
      const { externalRatingsInAcbs, externalRatings: expectedExternalRatings } = new PartyExternalRatingGenerator(valueGenerator).generate({
        partyIdentifier,
        numberToGenerate: 2,
      });
      // eslint-disable-next-line jest/unbound-method
      when(acbsService.getExternalRatingsForParty).calledWith(partyIdentifier, authToken).mockResolvedValueOnce(externalRatingsInAcbs);

      const externalRatings = await service.getExternalRatingsForParty(partyIdentifier);

      expect(externalRatings).toStrictEqual(expectedExternalRatings);
    });

    it('returns an empty array if ACBS returns an empty array', async () => {
      // eslint-disable-next-line jest/unbound-method
      when(acbsService.getExternalRatingsForParty).calledWith(partyIdentifier, authToken).mockResolvedValueOnce([]);

      const externalRatings = await service.getExternalRatingsForParty(partyIdentifier);

      expect(externalRatings).toStrictEqual([]);
    });
  });
});
