import { HttpService } from '@nestjs/axios';
import { PROPERTIES } from '@ukef/constants';
import { GetFacilityGenerator } from '@ukef-test/support/generator/get-facility-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { AxiosError } from 'axios';
import { when } from 'jest-when';
import { of, throwError } from 'rxjs';

import { DateStringTransformations } from '../date/date-string.transformations';
import { AcbsFacilityService } from './acbs-facility.service';
import { AcbsException } from './exception/acbs.exception';
import { AcbsResourceNotFoundException } from './exception/acbs-resource-not-found.exception';

describe('AcbsFacilityService', () => {
  const valueGenerator = new RandomValueGenerator();
  const dateStringTransformations = new DateStringTransformations();
  const idToken = valueGenerator.string();
  const baseUrl = valueGenerator.httpsUrl();

  let httpService: HttpService;
  let service: AcbsFacilityService;

  let httpServiceGet: jest.Mock;

  beforeEach(() => {
    httpService = new HttpService();

    httpServiceGet = jest.fn();
    httpService.get = httpServiceGet;

    service = new AcbsFacilityService({ baseUrl }, httpService);
  });

  describe('getFacilityByIdentifier', () => {
    const { portfolioIdentifier } = PROPERTIES.GLOBAL;
    const facilityIdentifier = valueGenerator.ukefId();

    it('returns the facility if ACBS responds with the facility', async () => {
      const { facilitiesInAcbs } = new GetFacilityGenerator(valueGenerator, dateStringTransformations).generate({
        numberToGenerate: 1,
        facilityIdentifier,
        portfolioIdentifier,
      });
      const [facilityInAcbs] = facilitiesInAcbs;

      when(httpServiceGet)
        .calledWith(`/Portfolio/${portfolioIdentifier}/Facility/${facilityIdentifier}`, {
          baseURL: baseUrl,
          headers: { Authorization: `Bearer ${idToken}` },
        })
        .mockReturnValueOnce(
          of({
            data: facilityInAcbs,
            status: 200,
            statusText: 'OK',
            config: undefined,
            headers: undefined,
          }),
        );

      const facility = await service.getFacilityByIdentifier(facilityIdentifier, idToken);

      expect(facility).toStrictEqual(facilityInAcbs);
    });

    it('throws an AcbsException if the request to ACBS fails', async () => {
      const getFacilityByIdentifierError = new AxiosError();
      when(httpServiceGet)
        .calledWith(`/Portfolio/${portfolioIdentifier}/Facility/${facilityIdentifier}`, {
          baseURL: baseUrl,
          headers: { Authorization: `Bearer ${idToken}` },
        })
        .mockReturnValueOnce(throwError(() => getFacilityByIdentifierError));

      const getFacilityPromise = service.getFacilityByIdentifier(facilityIdentifier, idToken);

      await expect(getFacilityPromise).rejects.toBeInstanceOf(AcbsException);
      await expect(getFacilityPromise).rejects.toThrow(`Failed to get the facility with identifier ${facilityIdentifier}.`);
      await expect(getFacilityPromise).rejects.toHaveProperty('innerError', getFacilityByIdentifierError);
    });

    it('throws an AcbsResourceNotFoundException if ACBS responds with a 400 response that is a string containing "The facility not found"', async () => {
      const axiosError = new AxiosError();
      axiosError.response = {
        data: 'The facility not found or user does not have access',
        status: 400,
        statusText: 'Bad Request',
        headers: undefined,
        config: undefined,
      };

      when(httpServiceGet)
        .calledWith(`/Portfolio/${portfolioIdentifier}/Facility/${facilityIdentifier}`, {
          baseURL: baseUrl,
          headers: { Authorization: `Bearer ${idToken}` },
        })
        .mockReturnValueOnce(throwError(() => axiosError));

      const getFacilityPromise = service.getFacilityByIdentifier(facilityIdentifier, idToken);

      await expect(getFacilityPromise).rejects.toBeInstanceOf(AcbsResourceNotFoundException);
      await expect(getFacilityPromise).rejects.toThrow(`Facility with identifier ${facilityIdentifier} was not found by ACBS.`);
      await expect(getFacilityPromise).rejects.toHaveProperty('innerError', axiosError);
    });

    it('throws an AcbsException if ACBS responds with a 400 response that is a string that does NOT contain "The facility not found"', async () => {
      const axiosError = new AxiosError();
      axiosError.response = {
        data: 'some error string',
        status: 400,
        statusText: 'Bad Request',
        headers: undefined,
        config: undefined,
      };

      when(httpServiceGet)
        .calledWith(`/Portfolio/${portfolioIdentifier}/Facility/${facilityIdentifier}`, {
          baseURL: baseUrl,
          headers: { Authorization: `Bearer ${idToken}` },
        })
        .mockReturnValueOnce(throwError(() => axiosError));

      const getFacilityPromise = service.getFacilityByIdentifier(facilityIdentifier, idToken);

      await expect(getFacilityPromise).rejects.toBeInstanceOf(AcbsException);
      await expect(getFacilityPromise).rejects.toThrow(`Failed to get the facility with identifier ${facilityIdentifier}.`);
      await expect(getFacilityPromise).rejects.toHaveProperty('innerError', axiosError);
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
        .calledWith(`/Portfolio/${portfolioIdentifier}/Facility/${facilityIdentifier}`, {
          baseURL: baseUrl,
          headers: { Authorization: `Bearer ${idToken}` },
        })
        .mockReturnValueOnce(throwError(() => axiosError));

      const getFacilityPromise = service.getFacilityByIdentifier(facilityIdentifier, idToken);

      await expect(getFacilityPromise).rejects.toBeInstanceOf(AcbsException);
      await expect(getFacilityPromise).rejects.toThrow(`Failed to get the facility with identifier ${facilityIdentifier}.`);
      await expect(getFacilityPromise).rejects.toHaveProperty('innerError', axiosError);
    });
  });
});
