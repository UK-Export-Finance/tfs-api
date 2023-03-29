import { HttpService } from '@nestjs/axios';
import { GetPartyGenerator } from '@ukef-test/support/generator/get-party-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { AxiosError } from 'axios';
import { when } from 'jest-when';
import { of, throwError } from 'rxjs';

import { DateStringTransformations } from '../date/date-string.transformations';
import { AcbsGetPartiesBySearchTextResponse } from './dto/acbs-get-parties-by-search-text-response.dto';
import { GetPartiesBySearchTextException } from './exception/get-parties-by-search-text.exception';
import { PartyService } from './party.service';

jest.mock('@ukef/modules/acbs/acbs-party.service');
jest.mock('@ukef/modules/acbs/acbs-authentication.service');

describe('PartyService', () => {
  const valueGenerator = new RandomValueGenerator();
  const dateStringTransformations = new DateStringTransformations();
  const idToken = valueGenerator.string();
  const baseUrl = valueGenerator.httpsUrl();
  const partyIdentifier = valueGenerator.stringOfNumericCharacters();

  let httpService: HttpService;
  let partyService: PartyService;

  let httpServiceGet: jest.Mock;

  beforeEach(() => {
    httpService = new HttpService();

    httpServiceGet = jest.fn();
    httpService.get = httpServiceGet;

    partyService = new PartyService({ baseUrl }, httpService, null, null, dateStringTransformations);
  });

  describe('getPartyIdentifierBySearchText', () => {
    const getExpectedGetPartiesBySearchTextArguments = (searchText: string): [string, object] => [
      `/Party/Search/${searchText}`,
      {
        baseURL: baseUrl,
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      },
    ];

    const { partiesInAcbs } = new GetPartyGenerator(valueGenerator, dateStringTransformations).generate({ numberToGenerate: 2 });
    const partiesInAcbsWithPartyIdentifiers: AcbsGetPartiesBySearchTextResponse = [
      { ...partiesInAcbs[0], PartyIdentifier: partyIdentifier },
      { ...partiesInAcbs[1], PartyIdentifier: valueGenerator.stringOfNumericCharacters() },
    ];

    it('returns the party identifier of the first matching party if the request is successful', async () => {
      const searchText = 'searchText';

      mockSuccessfulAcbsGetPartiesBySearchTextRequest(searchText, partiesInAcbsWithPartyIdentifiers);

      const response = await partyService.getPartyIdentifierBySearchText(idToken, searchText);

      expect(response).toStrictEqual({
        partyIdentifier: partyIdentifier,
      });
    });

    it('returns the party identifier of the first matching party if the query parameter searchText is exactly 3 characters and the request is successful', async () => {
      const searchText = '999';

      mockSuccessfulAcbsGetPartiesBySearchTextRequest(searchText, partiesInAcbsWithPartyIdentifiers);

      const response = await partyService.getPartyIdentifierBySearchText(idToken, searchText);

      expect(response).toStrictEqual({
        partyIdentifier: partyIdentifier,
      });
    });

    it('returns undefined if the request is successful and there are no matching parties', async () => {
      const searchText = 'searchText';

      when(httpServiceGet)
        .calledWith(...getExpectedGetPartiesBySearchTextArguments(searchText))
        .mockReturnValueOnce(
          of({
            data: [],
            status: 200,
            statusText: 'OK',
            config: undefined,
            headers: undefined,
          }),
        );

      const response = await partyService.getPartyIdentifierBySearchText(idToken, searchText);

      expect(response).toBeUndefined();
    });

    it('throws a GetPartiesBySearchTextException if there is an error when getting parties from ACBS', async () => {
      const searchText = 'searchText';
      const getPartyError = new AxiosError();

      when(httpServiceGet)
        .calledWith(...getExpectedGetPartiesBySearchTextArguments(searchText))
        .mockReturnValueOnce(throwError(() => getPartyError));

      const responsePromise = partyService.getPartyIdentifierBySearchText(idToken, searchText);

      await expect(responsePromise).rejects.toBeInstanceOf(GetPartiesBySearchTextException);
      await expect(responsePromise).rejects.toThrow('Failed to get parties from ACBS.');
      await expect(responsePromise).rejects.toHaveProperty('innerError', getPartyError);
    });

    it('throws a GetPartiesBySearchTextException if the required query parameter searchText is not specified', async () => {
      const responsePromise = partyService.getPartyIdentifierBySearchText(idToken, null);

      await expect(responsePromise).rejects.toBeInstanceOf(GetPartiesBySearchTextException);
      await expect(responsePromise).rejects.toThrow('The required query parameter searchText was not specified.');
      await expect(responsePromise).rejects.toHaveProperty('innerError', undefined);
    });

    it('throws a GetPartiesBySearchTextException if the query parameter searchText is empty', async () => {
      const responsePromise = partyService.getPartyIdentifierBySearchText(idToken, '');

      await expect(responsePromise).rejects.toBeInstanceOf(GetPartiesBySearchTextException);
      await expect(responsePromise).rejects.toThrow('The query parameter searchText must be non-empty.');
      await expect(responsePromise).rejects.toHaveProperty('innerError', undefined);
    });

    it('throws a GetPartiesBySearchTextException if the query parameter searchText is less than 3 characters', async () => {
      const responsePromise = partyService.getPartyIdentifierBySearchText(idToken, '00');

      await expect(responsePromise).rejects.toBeInstanceOf(GetPartiesBySearchTextException);
      await expect(responsePromise).rejects.toThrow('The query parameter searchText must be at least 3 characters.');
      await expect(responsePromise).rejects.toHaveProperty('innerError', undefined);
    });

    function mockSuccessfulAcbsGetPartiesBySearchTextRequest(searchText: string, response: AcbsGetPartiesBySearchTextResponse): void {
      when(httpServiceGet)
        .calledWith(...getExpectedGetPartiesBySearchTextArguments(searchText))
        .mockReturnValueOnce(
          of({
            data: response,
            status: 200,
            statusText: 'OK',
            config: undefined,
            headers: undefined,
          }),
        );
    }
  });
});
