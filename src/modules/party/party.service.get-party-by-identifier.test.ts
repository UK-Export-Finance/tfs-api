import { PartyGenerator } from '@ukef-test/support/generator/party-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { when } from 'jest-when';

import { AcbsAuthenticationService } from '../acbs/acbs-authentication.service';
import { AcbsPartyService } from '../acbs/acbs-party.service';
import { AcbsGetPartyResponseDto } from '../acbs/dto/acbs-get-party-response.dto';
import { Party } from './party.interface';
import { PartyService } from './party.service';

jest.mock('@ukef/modules/acbs/acbs-party.service');
jest.mock('@ukef/modules/acbs/acbs-authentication.service');

describe('PartyService', () => {
  const valueGenerator = new RandomValueGenerator();
  const idToken = valueGenerator.string();
  const baseUrl = valueGenerator.httpsUrl();

  let acbsAuthenticationService: AcbsAuthenticationService;
  let acbsPartyService: AcbsPartyService;
  let service: PartyService;

  let acbsPartyServiceGetPartyByIdentifier: jest.Mock;

  beforeEach(() => {
    acbsPartyService = new AcbsPartyService(null, null);

    acbsPartyServiceGetPartyByIdentifier = jest.fn();
    acbsPartyService.getPartyByIdentifier = acbsPartyServiceGetPartyByIdentifier;

    acbsAuthenticationService = new AcbsAuthenticationService(null, null, null);
    const acbsAuthenticationServiceGetIdToken = jest.fn();
    acbsAuthenticationService.getIdToken = acbsAuthenticationServiceGetIdToken;

    service = new PartyService({ baseUrl }, null, acbsAuthenticationService, acbsPartyService);

    when(acbsAuthenticationServiceGetIdToken).calledWith().mockResolvedValueOnce(idToken);
  });

  describe('getPartyByIdentifier', () => {
    const partyIdentifier = valueGenerator.stringOfNumericCharacters();

    it('returns a transformation of the external ratings from ACBS when OfficerRiskDate IS NOT null', async () => {
      const officerRiskDateInAcbs = '2023-02-01T00:00:00Z';
      const expectedOfficerRiskDate = '2023-02-01';
      const { partiesInAcbs, parties } = new PartyGenerator(valueGenerator).generate({ numberToGenerate: 1 });
      const partyInAcbs: AcbsGetPartyResponseDto = {
        ...partiesInAcbs[0],
        OfficerRiskDate: officerRiskDateInAcbs,
      };
      const expectedParty: Party = {
        ...parties[0],
        officerRiskDate: expectedOfficerRiskDate,
      };
      when(acbsPartyServiceGetPartyByIdentifier).calledWith(partyIdentifier, idToken).mockResolvedValueOnce(partyInAcbs);

      const party = await service.getPartyByIdentifier(partyIdentifier);

      expect(party).toStrictEqual(expectedParty);
    });

    it('returns a transformation of the external ratings from ACBS when OfficerRiskDate IS null', async () => {
      const { partiesInAcbs, parties } = new PartyGenerator(valueGenerator).generate({ numberToGenerate: 1 });
      const partyInAcbs: AcbsGetPartyResponseDto = {
        ...partiesInAcbs[0],
        OfficerRiskDate: null,
      };
      const expectedParty: Party = {
        ...parties[0],
        officerRiskDate: null,
      };
      when(acbsPartyServiceGetPartyByIdentifier).calledWith(partyIdentifier, idToken).mockResolvedValueOnce(partyInAcbs);

      const party = await service.getPartyByIdentifier(partyIdentifier);

      expect(party).toStrictEqual(expectedParty);
    });
  });
});
