import { HttpService } from '@nestjs/axios';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { getMockAcbsAuthenticationService } from '@ukef-test/support/abcs-authentication.service.mock';
import { CreatePartyGenerator } from '@ukef-test/support/generator/create-party-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { when } from 'jest-when';

import { AcbsPartyService } from '../acbs/acbs-party.service';
import { PartyService } from './party.service';

jest.mock('@ukef/modules/acbs/acbs-party.service');
jest.mock('@ukef/modules/acbs-authentication/acbs-authentication.service');

describe('PartyService', () => {
  const valueGenerator = new RandomValueGenerator();
  const dateStringTransformations = new DateStringTransformations();
  const idToken = valueGenerator.string();

  let httpService: HttpService;
  let partyService: PartyService;
  let acbsPartyServiceCreateParty: jest.Mock;

  let httpServicePost: jest.Mock;

  beforeEach(() => {
    httpService = new HttpService();

    httpServicePost = jest.fn();
    httpService.post = httpServicePost;

    const acbsPartyService = new AcbsPartyService(null, null);
    acbsPartyServiceCreateParty = jest.fn();
    acbsPartyService.createParty = acbsPartyServiceCreateParty;

    const mockAcbsAuthenticationService = getMockAcbsAuthenticationService();
    const acbsAuthenticationService = mockAcbsAuthenticationService.service;
    const acbsAuthenticationServiceGetIdToken = mockAcbsAuthenticationService.getIdToken;
    when(acbsAuthenticationServiceGetIdToken).calledWith().mockResolvedValueOnce(idToken);

    partyService = new PartyService(acbsAuthenticationService, acbsPartyService, new DateStringTransformations());
  });

  describe('createParty', () => {
    const { acbsCreatePartyRequest, createPartyRequest } = new CreatePartyGenerator(valueGenerator, dateStringTransformations).generate({
      numberToGenerate: 1,
    });
    const createPartyRequestItem = createPartyRequest[0];

    it('returns the identifier of the new party if the request is successful', async () => {
      when(acbsPartyServiceCreateParty).calledWith(acbsCreatePartyRequest, idToken).mockReturnValueOnce({ partyIdentifier: '00000000' });

      const response = await partyService.createParty(createPartyRequestItem);

      expect(response).toStrictEqual({
        partyIdentifier: '00000000',
      });
    });

    it('creates a party in ACBS with a transformation of the requested new party', async () => {
      await partyService.createParty(createPartyRequestItem);

      expect(acbsPartyServiceCreateParty).toHaveBeenCalledWith(acbsCreatePartyRequest, idToken);
    });
  });
});
