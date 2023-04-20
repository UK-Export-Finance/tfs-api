import { HttpService } from '@nestjs/axios';
import { PROPERTIES } from '@ukef/constants';
import { CreateFacilityCovenantGenerator } from '@ukef-test/support/generator/create-facility-covenant-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { AxiosError } from 'axios';
import { when } from 'jest-when';
import { of, throwError } from 'rxjs';

import { DateStringTransformations } from '../date/date-string.transformations';
import { AcbsFacilityCovenantService } from './acbs-facility-covenant.service';
import { AcbsBadRequestException } from './exception/acbs-bad-request.exception';
import { AcbsResourceNotFoundException } from './exception/acbs-resource-not-found.exception';
import { AcbsUnexpectedException } from './exception/acbs-unexpected.exception';

describe('AcbsFacilityCovenantService', () => {
  const valueGenerator = new RandomValueGenerator();
  const dateStringTransformations = new DateStringTransformations();
  const authToken = valueGenerator.string();
  const baseUrl = valueGenerator.httpsUrl();
  const covenantIdentifier = valueGenerator.ukefId();
  const facilityIdentifier = valueGenerator.ukefId();
  const facilityTypeCode = valueGenerator.stringOfNumericCharacters();
  const limitKeyValue = valueGenerator.string();
  const portfolioIdentifier = PROPERTIES.GLOBAL.portfolioIdentifier;

  let httpService: HttpService;
  let service: AcbsFacilityCovenantService;

  let httpServicePost: jest.Mock;

  beforeEach(() => {
    httpService = new HttpService();

    httpServicePost = jest.fn();
    httpService.post = httpServicePost;

    service = new AcbsFacilityCovenantService({ baseUrl }, httpService);
  });

  describe('createCovenantForFacility', () => {
    const { acbsRequestBodyToCreateFacilityCovenant: newFacilityCovenant } = new CreateFacilityCovenantGenerator(
      valueGenerator,
      dateStringTransformations,
    ).generate({
      numberToGenerate: 1,
      covenantIdentifier,
      facilityIdentifier,
      facilityTypeCode,
      limitKeyValue,
    });

    it('sends a POST to ACBS with the specified parameters', async () => {
      when(httpServicePost)
        .calledWith(`/Portfolio/${portfolioIdentifier}/Facility/${facilityIdentifier}/Covenant`, newFacilityCovenant, {
          baseURL: baseUrl,
          headers: { Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json' },
        })
        .mockReturnValueOnce(
          of({
            data: '',
            status: 201,
            statusText: 'Created',
            config: undefined,
            headers: undefined,
          }),
        );

      await service.createCovenantForFacility(facilityIdentifier, newFacilityCovenant, authToken);

      expect(httpServicePost).toHaveBeenCalledTimes(1);
      expect(httpServicePost).toHaveBeenCalledWith(`/Portfolio/${portfolioIdentifier}/Facility/${facilityIdentifier}/Covenant`, newFacilityCovenant, {
        baseURL: baseUrl,
        headers: { Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json' },
      });
    });

    it('throws an AcbsResourceNotFoundException if ACBS responds with a 400 that is a string containing "Facility not found"', async () => {
      const axiosError = new AxiosError();
      const errorString = 'Facility not found or the user does not have access to it.';
      axiosError.response = {
        data: errorString,
        status: 400,
        statusText: 'Bad Request',
        headers: undefined,
        config: undefined,
      };

      when(httpServicePost)
        .calledWith(`/Portfolio/${portfolioIdentifier}/Facility/${facilityIdentifier}/Covenant`, newFacilityCovenant, {
          baseURL: baseUrl,
          headers: { Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json' },
        })
        .mockReturnValueOnce(throwError(() => axiosError));

      const createCovenantForFacilityPromise = service.createCovenantForFacility(facilityIdentifier, newFacilityCovenant, authToken);

      await expect(createCovenantForFacilityPromise).rejects.toBeInstanceOf(AcbsResourceNotFoundException);
      await expect(createCovenantForFacilityPromise).rejects.toThrow(`Facility with identifier ${facilityIdentifier} was not found by ACBS.`);
      await expect(createCovenantForFacilityPromise).rejects.toHaveProperty('innerError', axiosError);
    });

    it('throws an AcbsBadRequestException if ACBS responds with a 400 that is a string that does not contain "Facility not found"', async () => {
      const axiosError = new AxiosError();
      const errorString = valueGenerator.string();
      axiosError.response = {
        data: errorString,
        status: 400,
        statusText: 'Bad Request',
        headers: undefined,
        config: undefined,
      };

      when(httpServicePost)
        .calledWith(`/Portfolio/${portfolioIdentifier}/Facility/${facilityIdentifier}/Covenant`, newFacilityCovenant, {
          baseURL: baseUrl,
          headers: { Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json' },
        })
        .mockReturnValueOnce(throwError(() => axiosError));

      const createCovenantForFacilityPromise = service.createCovenantForFacility(facilityIdentifier, newFacilityCovenant, authToken);

      await expect(createCovenantForFacilityPromise).rejects.toBeInstanceOf(AcbsBadRequestException);
      await expect(createCovenantForFacilityPromise).rejects.toThrow(`Failed to create a covenant for facility ${facilityIdentifier} in ACBS.`);
      await expect(createCovenantForFacilityPromise).rejects.toHaveProperty('innerError', axiosError);
      await expect(createCovenantForFacilityPromise).rejects.toHaveProperty('errorBody', errorString);
    });

    it('throws an AcbsBadRequestException if ACBS responds with a 400 that is not a string', async () => {
      const axiosError = new AxiosError();
      const errorBody = { errorMessage: valueGenerator.string() };
      axiosError.response = {
        data: errorBody,
        status: 400,
        statusText: 'Bad Request',
        headers: undefined,
        config: undefined,
      };

      when(httpServicePost)
        .calledWith(`/Portfolio/${portfolioIdentifier}/Facility/${facilityIdentifier}/Covenant`, newFacilityCovenant, {
          baseURL: baseUrl,
          headers: { Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json' },
        })
        .mockReturnValueOnce(throwError(() => axiosError));

      const createCovenantForFacilityPromise = service.createCovenantForFacility(facilityIdentifier, newFacilityCovenant, authToken);

      await expect(createCovenantForFacilityPromise).rejects.toBeInstanceOf(AcbsBadRequestException);
      await expect(createCovenantForFacilityPromise).rejects.toThrow(`Failed to create a covenant for facility ${facilityIdentifier} in ACBS.`);
      await expect(createCovenantForFacilityPromise).rejects.toHaveProperty('innerError', axiosError);
      await expect(createCovenantForFacilityPromise).rejects.toHaveProperty('errorBody', JSON.stringify(errorBody));
    });

    it('throws an AcbsUnexpectedException if ACBS responds with an error code that is not 400', async () => {
      const axiosError = new AxiosError();
      const errorBody = { errorMessage: valueGenerator.string() };
      axiosError.response = {
        data: errorBody,
        status: 401,
        statusText: 'Unauthorized',
        headers: undefined,
        config: undefined,
      };

      when(httpServicePost)
        .calledWith(`/Portfolio/${portfolioIdentifier}/Facility/${facilityIdentifier}/Covenant`, newFacilityCovenant, {
          baseURL: baseUrl,
          headers: { Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json' },
        })
        .mockReturnValueOnce(throwError(() => axiosError));

      const createCovenantForFacilityPromise = service.createCovenantForFacility(facilityIdentifier, newFacilityCovenant, authToken);

      await expect(createCovenantForFacilityPromise).rejects.toBeInstanceOf(AcbsUnexpectedException);
      await expect(createCovenantForFacilityPromise).rejects.toThrow(`Failed to create a covenant for facility ${facilityIdentifier} in ACBS.`);
      await expect(createCovenantForFacilityPromise).rejects.toHaveProperty('innerError', axiosError);
    });
  });
});
