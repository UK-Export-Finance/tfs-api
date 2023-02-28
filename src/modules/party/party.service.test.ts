import { HttpService } from '@nestjs/axios';
import { GetPartiesBySearchTextException } from '@ukef/modules/party/exception/get-parties-by-search-text.exception';
import { PartyService } from '@ukef/modules/party/party.service';
import { AxiosError } from 'axios';
import { when } from 'jest-when';
import { of, throwError } from 'rxjs';

import { AcbsGetPartiesBySearchTextResponseElement } from './dto/acbs-get-parties-by-search-text-response-element.dto';

describe('PartyService', () => {
  const config = { baseUrl: 'the base url' };
  const idToken = 'the id token';

  let httpService: HttpService;
  let partyService: PartyService;

  const getExpectedGetPartiesBySearchTextArguments = (searchText: string): [string, object] => [
    '/Party/Search/' + searchText,
    {
      baseURL: 'the base url',
      headers: {
        Authorization: 'Bearer ' + idToken,
      },
    },
  ];

  const acbsResponse: AcbsGetPartiesBySearchTextResponseElement[] = [
    {
      PartyAlternateIdentifier: '00309999',
      IndustryClassification: { IndustryClassificationCode: '2401' },
      PartyName1: 'ACTUAL IMPORT EXPORT',
      PartyName2: '',
      PartyName3: '',
      MinorityClass: { MinorityClassCode: '20' },
      CitizenshipClass: { CitizenshipClassCode: '2' },
      OfficerRiskDate: '2018-03-21T00:00:00Z',
      PrimaryAddress: { Country: { CountryCode: 'DZA' } },
    },
    {
      PartyAlternateIdentifier: '00999999',
      IndustryClassification: { IndustryClassificationCode: '0001' },
      PartyName1: 'AV 2022-10-1039',
      PartyName2: '',
      PartyName3: '',
      MinorityClass: { MinorityClassCode: '70' },
      CitizenshipClass: { CitizenshipClassCode: '1' },
      OfficerRiskDate: '2022-10-10T00:00:00Z',
      PrimaryAddress: { Country: { CountryCode: 'GBR' } },
    },
  ];

  const acbsResponseWithNullOfficerRiskDate: AcbsGetPartiesBySearchTextResponseElement[] = [
    {
      PartyAlternateIdentifier: '00309999',
      IndustryClassification: { IndustryClassificationCode: '2401' },
      PartyName1: 'ACTUAL IMPORT EXPORT',
      PartyName2: '',
      PartyName3: '',
      MinorityClass: { MinorityClassCode: '20' },
      CitizenshipClass: { CitizenshipClassCode: '2' },
      OfficerRiskDate: null,
      PrimaryAddress: { Country: { CountryCode: 'DZA' } },
    },
  ];

  beforeEach(() => {
    httpService = new HttpService();
    partyService = new PartyService(config, httpService);
  });

  describe('successful request', () => {
    it('returns matching parties in the correct format if the request is successful', async () => {
      const searchText = 'searchText';

      mockSuccessfulAcbsGetPartiesBySearchTextRequest(searchText, acbsResponse);

      const response = await partyService.getPartiesBySearchText(idToken, searchText);

      expect(response).toStrictEqual([
        {
          alternateIdentifier: '00309999',
          industryClassification: '2401',
          name1: 'ACTUAL IMPORT EXPORT',
          name2: '',
          name3: '',
          smeType: '20',
          citizenshipClass: '2',
          officerRiskDate: '2018-03-21',
          countryCode: 'DZA',
        },
        {
          alternateIdentifier: '00999999',
          industryClassification: '0001',
          name1: 'AV 2022-10-1039',
          name2: '',
          name3: '',
          smeType: '70',
          citizenshipClass: '1',
          officerRiskDate: '2022-10-10',
          countryCode: 'GBR',
        },
      ]);
    });

    it('returns matching parties in the correct format if the query parameter searchText is exactly 3 characters and the request is successful', async () => {
      const searchText = '999';

      mockSuccessfulAcbsGetPartiesBySearchTextRequest(searchText, acbsResponse);

      const response = await partyService.getPartiesBySearchText(idToken, searchText);

      expect(response).toStrictEqual([
        {
          alternateIdentifier: '00309999',
          industryClassification: '2401',
          name1: 'ACTUAL IMPORT EXPORT',
          name2: '',
          name3: '',
          smeType: '20',
          citizenshipClass: '2',
          officerRiskDate: '2018-03-21',
          countryCode: 'DZA',
        },
        {
          alternateIdentifier: '00999999',
          industryClassification: '0001',
          name1: 'AV 2022-10-1039',
          name2: '',
          name3: '',
          smeType: '70',
          citizenshipClass: '1',
          officerRiskDate: '2022-10-10',
          countryCode: 'GBR',
        },
      ]);
    });

    it('returns matching parties in the correct format in the case that there is a null officerRiskDate and the request is successful', async () => {
      const searchText = 'searchText';

      mockSuccessfulAcbsGetPartiesBySearchTextRequest(searchText, acbsResponseWithNullOfficerRiskDate);

      const response = await partyService.getPartiesBySearchText(idToken, searchText);

      expect(response).toStrictEqual([
        {
          alternateIdentifier: '00309999',
          industryClassification: '2401',
          name1: 'ACTUAL IMPORT EXPORT',
          name2: '',
          name3: '',
          smeType: '20',
          citizenshipClass: '2',
          officerRiskDate: null,
          countryCode: 'DZA',
        },
      ]);
    });

    it('returns an empty array if the request is successful and there are no matching parties', async () => {
      const searchText = 'searchText';

      // eslint-disable-next-line jest/unbound-method
      when(httpService.get)
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
  });

  describe('failed request', () => {
    it('throws a GetPartiesBySearchTextException if there is an error when getting parties from ACBS', async () => {
      const searchText = 'searchText';
      const getPartiesError = new AxiosError();

      // eslint-disable-next-line jest/unbound-method
      when(httpService.get)
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
  });

  function mockSuccessfulAcbsGetPartiesBySearchTextRequest(searchText: string, response: AcbsGetPartiesBySearchTextResponseElement[]): void {
    // eslint-disable-next-line jest/unbound-method
    when(httpService.get)
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
