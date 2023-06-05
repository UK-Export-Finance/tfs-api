import { HttpService } from '@nestjs/axios';
import { AcbsPartyService } from '@ukef/modules/acbs/acbs-party.service';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { getMockAcbsAuthenticationService } from '@ukef-test/support/abcs-authentication.service.mock';
import { GetPartyGenerator } from '@ukef-test/support/generator/get-party-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { when } from 'jest-when';

import { AcbsGetPartiesBySearchTextResponseDto } from './dto/acbs-get-parties-by-search-text-response.dto';
import { GetPartiesBySearchTextException } from './exception/get-parties-by-search-text.exception';
import { PartyService } from './party.service';

jest.mock('@ukef/modules/acbs/acbs-party.service');
jest.mock('@ukef/modules/acbs-authentication/acbs-authentication.service');

describe('PartyService', () => {
  const valueGenerator = new RandomValueGenerator();
  const dateStringTransformations = new DateStringTransformations();
  const idToken = valueGenerator.string();
  const partyIdentifier = valueGenerator.stringOfNumericCharacters();

  let httpService: HttpService;
  let partyService: PartyService;
  let acbsPartyServiceGetPartyBySearchText: jest.Mock;

  let httpServiceGet: jest.Mock;

  beforeEach(() => {
    httpService = new HttpService();

    httpServiceGet = jest.fn();
    httpService.get = httpServiceGet;

    const acbsPartyService = new AcbsPartyService(null, null);
    acbsPartyServiceGetPartyBySearchText = jest.fn();
    acbsPartyService.getPartyBySearchText = acbsPartyServiceGetPartyBySearchText;

    const mockAcbsAuthenticationService = getMockAcbsAuthenticationService();
    const acbsAuthenticationService = mockAcbsAuthenticationService.service;
    const acbsAuthenticationServiceGetIdToken = mockAcbsAuthenticationService.getIdToken;
    when(acbsAuthenticationServiceGetIdToken).calledWith().mockResolvedValueOnce(idToken);

    partyService = new PartyService(acbsAuthenticationService, acbsPartyService, dateStringTransformations);
  });

  describe('getPartyIdentifierBySearchText', () => {
    const { acbsParties } = new GetPartyGenerator(valueGenerator, dateStringTransformations).generate({ numberToGenerate: 2 });
    const partiesInAcbsWithPartyIdentifiers: AcbsGetPartiesBySearchTextResponseDto = [
      { ...acbsParties[0], PartyIdentifier: partyIdentifier },
      { ...acbsParties[1], PartyIdentifier: valueGenerator.stringOfNumericCharacters() },
    ];

    it('returns the party identifier of the first matching party if the request is successful', async () => {
      const searchText = 'searchText';

      when(acbsPartyServiceGetPartyBySearchText).calledWith(searchText, idToken).mockResolvedValueOnce(partiesInAcbsWithPartyIdentifiers);

      const response = await partyService.getPartyIdentifierBySearchText(searchText);

      expect(response).toStrictEqual({
        partyIdentifier: partyIdentifier,
      });
    });

    it('returns the party identifier of the first matching party if the query parameter searchText is exactly 3 characters and the request is successful', async () => {
      const searchText = '999';

      when(acbsPartyServiceGetPartyBySearchText).calledWith(searchText, idToken).mockResolvedValueOnce(partiesInAcbsWithPartyIdentifiers);

      const response = await partyService.getPartyIdentifierBySearchText(searchText);

      expect(response).toStrictEqual({
        partyIdentifier: partyIdentifier,
      });
    });

    it('returns undefined if the request is successful and there are no matching parties', async () => {
      const searchText = 'searchText';

      when(acbsPartyServiceGetPartyBySearchText).calledWith(searchText, idToken).mockResolvedValueOnce([]);

      const response = await partyService.getPartyIdentifierBySearchText(searchText);

      expect(response).toBeUndefined();
    });

    it('throws a GetPartiesBySearchTextException if the required query parameter searchText is not specified', async () => {
      const responsePromise = partyService.getPartyIdentifierBySearchText(null);

      await expect(responsePromise).rejects.toBeInstanceOf(GetPartiesBySearchTextException);
      await expect(responsePromise).rejects.toThrow('The required query parameter searchText was not specified.');
      await expect(responsePromise).rejects.toHaveProperty('innerError', undefined);
    });

    it('throws a GetPartiesBySearchTextException if the query parameter searchText is empty', async () => {
      const responsePromise = partyService.getPartyIdentifierBySearchText('');

      await expect(responsePromise).rejects.toBeInstanceOf(GetPartiesBySearchTextException);
      await expect(responsePromise).rejects.toThrow('The query parameter searchText must be non-empty.');
      await expect(responsePromise).rejects.toHaveProperty('innerError', undefined);
    });

    it('throws a GetPartiesBySearchTextException if the query parameter searchText is less than 3 characters', async () => {
      const responsePromise = partyService.getPartyIdentifierBySearchText('00');

      await expect(responsePromise).rejects.toBeInstanceOf(GetPartiesBySearchTextException);
      await expect(responsePromise).rejects.toThrow('The query parameter searchText must be at least 3 characters.');
      await expect(responsePromise).rejects.toHaveProperty('innerError', undefined);
    });
  });
});
