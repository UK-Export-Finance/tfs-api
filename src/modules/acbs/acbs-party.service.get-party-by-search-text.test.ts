import { HttpService } from '@nestjs/axios';
import { GetPartyGenerator } from '@ukef-test/support/generator/get-party-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { AxiosError } from 'axios';
import { when } from 'jest-when';
import { of, throwError } from 'rxjs';

import { DateStringTransformations } from '../date/date-string.transformations';
import { AcbsPartyService } from './acbs-party.service';
import { AcbsException } from './exception/acbs.exception';

describe('AcbsPartyService', () => {
  const valueGenerator = new RandomValueGenerator();
  const dateStringTransformations = new DateStringTransformations();
  const idToken = valueGenerator.string();
  const baseUrl = valueGenerator.httpsUrl();

  let httpService: HttpService;
  let service: AcbsPartyService;

  let httpServiceGet: jest.Mock;

  beforeEach(() => {
    httpService = new HttpService();

    httpServiceGet = jest.fn();
    httpService.get = httpServiceGet;

    service = new AcbsPartyService({ baseUrl }, httpService);
  });

  describe('getPartyBySearchText', () => {
    const searchText = 'searchText';

    it('returns the party if ACBS responds with the party', async () => {
      const { partiesInAcbs } = new GetPartyGenerator(valueGenerator, dateStringTransformations).generate({ numberToGenerate: 1 });
      const [partyInAcbs] = partiesInAcbs;

      when(httpServiceGet)
        .calledWith(`/Party/Search/${searchText}`, {
          baseURL: baseUrl,
          headers: { Authorization: `Bearer ${idToken}` },
        })
        .mockReturnValueOnce(
          of({
            data: partyInAcbs,
            status: 200,
            statusText: 'OK',
            config: undefined,
            headers: undefined,
          }),
        );

      const party = await service.getPartyBySearchText(searchText, idToken);

      expect(party).toStrictEqual(partyInAcbs);
    });

    it('returns an empty array if ACBS responds with a 200 response with an empty array', async () => {
      when(httpServiceGet)
        .calledWith(`/Party/Search/${searchText}`, {
          baseURL: baseUrl,
          headers: { Authorization: `Bearer ${idToken}` },
        })
        .mockReturnValueOnce(
          of({
            data: [],
            status: 200,
            statusText: 'OK',
            config: undefined,
            headers: undefined,
          }),
        );

      const party = await service.getPartyBySearchText(searchText, idToken);

      expect(party).toStrictEqual([]);
    });

    it('throws an AcbsException if the request to ACBS fails', async () => {
      const getPartyError = new AxiosError();
      when(httpServiceGet)
        .calledWith(`/Party/Search/${searchText}`, {
          baseURL: baseUrl,
          headers: { Authorization: `Bearer ${idToken}` },
        })
        .mockReturnValueOnce(throwError(() => getPartyError));

      const getExternalRatingsPromise = service.getPartyBySearchText(searchText, idToken);

      await expect(getExternalRatingsPromise).rejects.toBeInstanceOf(AcbsException);
      await expect(getExternalRatingsPromise).rejects.toThrow(`Failed to get parties from ACBS with search text ${searchText}.`);
      await expect(getExternalRatingsPromise).rejects.toHaveProperty('innerError', getPartyError);
    });

    it('throws an AcbsException if ACBS responds with a 400 response that is a string that does NOT contain "Party not found"', async () => {
      const axiosError = new AxiosError();
      axiosError.response = {
        data: 'some error string',
        status: 400,
        statusText: 'Bad Request',
        headers: undefined,
        config: undefined,
      };

      when(httpServiceGet)
        .calledWith(`/Party/Search/${searchText}`, {
          baseURL: baseUrl,
          headers: { Authorization: `Bearer ${idToken}` },
        })
        .mockReturnValueOnce(throwError(() => axiosError));

      const getExternalRatingsPromise = service.getPartyBySearchText(searchText, idToken);

      await expect(getExternalRatingsPromise).rejects.toBeInstanceOf(AcbsException);
      await expect(getExternalRatingsPromise).rejects.toThrow(`Failed to get parties from ACBS with search text ${searchText}.`);
      await expect(getExternalRatingsPromise).rejects.toHaveProperty('innerError', axiosError);
    });

    it('throws an AcbsException if ACBS responds with a 400 response that is NOT a string', async () => {
      const axiosError = new AxiosError();
      axiosError.response = {
        data: { errorMessage: valueGenerator.string() },
        status: 400,
        statusText: 'Bad Request',
        headers: undefined,
        config: undefined,
      };

      when(httpServiceGet)
        .calledWith(`/Party/Search/${searchText}`, {
          baseURL: baseUrl,
          headers: { Authorization: `Bearer ${idToken}` },
        })
        .mockReturnValueOnce(throwError(() => axiosError));

      const getExternalRatingsPromise = service.getPartyBySearchText(searchText, idToken);

      await expect(getExternalRatingsPromise).rejects.toBeInstanceOf(AcbsException);
      await expect(getExternalRatingsPromise).rejects.toThrow(`Failed to get parties from ACBS with search text ${searchText}.`);
      await expect(getExternalRatingsPromise).rejects.toHaveProperty('innerError', axiosError);
    });
  });
});
