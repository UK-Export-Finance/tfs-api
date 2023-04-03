import { HttpService } from '@nestjs/axios';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { GetPartyGenerator } from '@ukef-test/support/generator/get-party-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { AxiosError } from 'axios';
import { when } from 'jest-when';
import { of, throwError } from 'rxjs';

import { AcbsGetPartiesBySearchTextResponse } from './dto/acbs-get-parties-by-search-text-response.dto';
import { GetPartiesBySearchTextException } from './exception/get-parties-by-search-text.exception';
import { PartyService } from './party.service';

jest.mock('@ukef/modules/acbs/acbs-party.service');
jest.mock('@ukef/modules/acbs-authentication/acbs-authentication.service');

describe('PartyService', () => {
  const valueGenerator = new RandomValueGenerator();
  const dateStringTransformations = new DateStringTransformations();
  const idToken = valueGenerator.string();
  const baseUrl = valueGenerator.httpsUrl();

  let httpService: HttpService;
  let partyService: PartyService;

  let httpServiceGet: jest.Mock;

  beforeEach(() => {
    httpService = new HttpService();

    httpServiceGet = jest.fn();
    httpService.get = httpServiceGet;

    partyService = new PartyService({ baseUrl }, httpService, null, null, dateStringTransformations);
  });

  describe('getPartyBySearchText', () => {
    const getExpectedGetPartiesBySearchTextArguments = (searchText: string): [string, object] => [
      `/Party/Search/${searchText}`,
      {
        baseURL: baseUrl,
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      },
    ];

    const { partiesInAcbs, parties } = new GetPartyGenerator(valueGenerator, dateStringTransformations).generate({ numberToGenerate: 2 });
    const partiesInAcbsWithPartyIdentifiers: AcbsGetPartiesBySearchTextResponse = [
      { ...partiesInAcbs[0], PartyIdentifier: valueGenerator.stringOfNumericCharacters() },
      { ...partiesInAcbs[1], PartyIdentifier: valueGenerator.stringOfNumericCharacters() },
    ];

    it('returns matching parties in the correct format if the request is successful', async () => {
      const searchText = 'searchText';

      mockSuccessfulAcbsGetPartiesBySearchTextRequest(searchText, partiesInAcbsWithPartyIdentifiers);

      const response = await partyService.getPartiesBySearchText(idToken, searchText);

      expect(response).toStrictEqual(parties);
    });

    it('returns matching parties in the correct format if the query parameter searchText is exactly 3 characters and the request is successful', async () => {
      const searchText = '999';

      mockSuccessfulAcbsGetPartiesBySearchTextRequest(searchText, partiesInAcbsWithPartyIdentifiers);

      const response = await partyService.getPartiesBySearchText(idToken, searchText);

      expect(response).toStrictEqual(parties);
    });

    it("returns matching parties in the correct format if the query parameter searchText is 'A!@'' and the request is successful", async () => {
      const searchText = 'A!@';

      mockSuccessfulAcbsGetPartiesBySearchTextRequest(searchText, partiesInAcbsWithPartyIdentifiers);

      const response = await partyService.getPartiesBySearchText(idToken, searchText);

      expect(response).toStrictEqual(parties);
    });

    it('returns matching parties in the correct format in the case that there is a null officerRiskDate and the request is successful', async () => {
      const searchText = 'searchText';

      const partiesInAcbsWithNullOfficerRiskDate = JSON.parse(JSON.stringify(partiesInAcbs));
      partiesInAcbsWithNullOfficerRiskDate[0].OfficerRiskDate = null;

      const partiesWithNullOfficerRiskDate = JSON.parse(JSON.stringify(parties));
      partiesWithNullOfficerRiskDate[0].officerRiskDate = null;

      mockSuccessfulAcbsGetPartiesBySearchTextRequest(searchText, partiesInAcbsWithNullOfficerRiskDate);

      const response = await partyService.getPartiesBySearchText(idToken, searchText);

      expect(response).toStrictEqual(partiesWithNullOfficerRiskDate);
    });

    it('returns an empty array if the request is successful and there are no matching parties', async () => {
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

      const response = await partyService.getPartiesBySearchText(idToken, searchText);

      expect(response).toStrictEqual([]);
    });

    it('throws a GetPartiesBySearchTextException if there is an error when getting parties from ACBS', async () => {
      const searchText = 'searchText';
      const getPartiesError = new AxiosError();

      when(httpServiceGet)
        .calledWith(...getExpectedGetPartiesBySearchTextArguments(searchText))
        .mockReturnValueOnce(throwError(() => getPartiesError));

      const responsePromise = partyService.getPartiesBySearchText(idToken, searchText);

      await expect(responsePromise).rejects.toBeInstanceOf(GetPartiesBySearchTextException);
      await expect(responsePromise).rejects.toThrow('Failed to get parties from ACBS.');
      await expect(responsePromise).rejects.toHaveProperty('innerError', getPartiesError);
    });

    it('throws a GetPartiesBySearchTextException if the required query parameter searchText is not specified', async () => {
      const responsePromise = partyService.getPartiesBySearchText(idToken, null);

      await expect(responsePromise).rejects.toBeInstanceOf(GetPartiesBySearchTextException);
      await expect(responsePromise).rejects.toThrow('The required query parameter searchText was not specified.');
      await expect(responsePromise).rejects.toHaveProperty('innerError', undefined);
    });

    it('throws a GetPartiesBySearchTextException if the query parameter searchText is empty', async () => {
      const responsePromise = partyService.getPartiesBySearchText(idToken, '');

      await expect(responsePromise).rejects.toBeInstanceOf(GetPartiesBySearchTextException);
      await expect(responsePromise).rejects.toThrow('The query parameter searchText must be non-empty.');
      await expect(responsePromise).rejects.toHaveProperty('innerError', undefined);
    });

    it('throws a GetPartiesBySearchTextException if the query parameter searchText is less than 3 characters', async () => {
      const responsePromise = partyService.getPartiesBySearchText(idToken, '00');

      await expect(responsePromise).rejects.toBeInstanceOf(GetPartiesBySearchTextException);
      await expect(responsePromise).rejects.toThrow('The query parameter searchText must be at least 3 characters.');
      await expect(responsePromise).rejects.toHaveProperty('innerError', undefined);
    });

    it('throws a GetPartiesBySearchTextException if the query parameter searchText is 3 whitespaces', async () => {
      const responsePromise = partyService.getPartiesBySearchText(idToken, '   ');

      await expect(responsePromise).rejects.toBeInstanceOf(GetPartiesBySearchTextException);
      await expect(responsePromise).rejects.toThrow('The query parameter searchText cannot contain only whitespaces.');
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
