import { AcbsPartyExternalRatingService } from '@ukef/modules/acbs/acbs-party-external-rating.service';
import { AcbsAuthenticationService } from '@ukef/modules/acbs-authentication/acbs-authentication.service';
import { getMockAcbsAuthenticationService } from '@ukef-test/support/abcs-authentication.service.mock';
import { CreatePartyExternalRatingGenerator } from '@ukef-test/support/generator/create-party-external-rating-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { when } from 'jest-when';

import { DateStringTransformations } from '../date/date-string.transformations';
import { PartyExternalRatingService } from './party-external-rating.service';

jest.mock('@ukef/modules/acbs/acbs-party-external-rating.service');
jest.mock('@ukef/modules/acbs-authentication/acbs-authentication.service');

describe('PartyExternalRatingService', () => {
  const valueGenerator = new RandomValueGenerator();
  const dateStringTransformations = new DateStringTransformations();
  const idToken = valueGenerator.string();

  let acbsAuthenticationService: AcbsAuthenticationService;
  let acbsService: AcbsPartyExternalRatingService;
  let service: PartyExternalRatingService;

  let acbsPartyExternalRatingServiceCreateExternalRatingForParty: jest.Mock;

  beforeEach(() => {
    const mockAcbsAuthenticationService = getMockAcbsAuthenticationService();
    acbsAuthenticationService = mockAcbsAuthenticationService.service;
    const acbsAuthenticationServiceGetIdToken = mockAcbsAuthenticationService.getIdToken;
    when(acbsAuthenticationServiceGetIdToken).calledWith().mockResolvedValueOnce(idToken);

    acbsService = new AcbsPartyExternalRatingService(null, null);
    acbsPartyExternalRatingServiceCreateExternalRatingForParty = jest.fn();
    acbsService.createExternalRatingForParty = acbsPartyExternalRatingServiceCreateExternalRatingForParty;

    service = new PartyExternalRatingService(acbsAuthenticationService, acbsService, dateStringTransformations);
  });

  describe('createExternalRatingForParty', () => {
    const partyIdentifier = valueGenerator.stringOfNumericCharacters();

    const { acbsExternalRatingToCreate, apiExternalRatingToCreate } = new CreatePartyExternalRatingGenerator(
      valueGenerator,
      dateStringTransformations,
    ).generate({
      numberToGenerate: 1,
      partyIdentifier,
    });

    it('creates a covenant in ACBS with a transformation of the requested new covenant', async () => {
      await service.createExternalRatingForParty(partyIdentifier, apiExternalRatingToCreate);

      expect(acbsPartyExternalRatingServiceCreateExternalRatingForParty).toHaveBeenCalledWith(acbsExternalRatingToCreate, idToken);
    });
  });
});
