import { HttpService } from '@nestjs/axios';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { UpdateFacilityGenerator } from '@ukef-test/support/generator/update-facility-generator';
import { AxiosError } from 'axios';
import { when } from 'jest-when';
import { of, throwError } from 'rxjs';

import { DateStringTransformations } from '../date/date-string.transformations';
import { AcbsFacilityService } from './acbs-facility.service';
import { AcbsBadRequestException } from './exception/acbs-bad-request.exception';
import { AcbsResourceNotFoundException } from './exception/acbs-resource-not-found.exception';
import { AcbsUnexpectedException } from './exception/acbs-unexpected.exception';

describe('AcbsFacilityService', () => {
  const valueGenerator = new RandomValueGenerator();
  const idToken = valueGenerator.string();
  const baseUrl = valueGenerator.httpsUrl();
  const useReturnExceptionHeader = false;
  const randomPortfolioIdentifier = valueGenerator.string({ length: 2 });
  const facilityIdentifier = valueGenerator.facilityId();

  let httpService: HttpService;
  let service: AcbsFacilityService;

  let httpServicePut: jest.Mock;

  const { acbsUpdateFacilityRequest: updatedFacility } = new UpdateFacilityGenerator(valueGenerator, new DateStringTransformations()).generate({
    numberToGenerate: 1,
    facilityIdentifier,
  });

  const expectedHttpServicePutArgs = [
    `/Portfolio/${randomPortfolioIdentifier}/Facility/${facilityIdentifier}`,
    updatedFacility,
    {
      baseURL: baseUrl,
      headers: { Authorization: `Bearer ${idToken}`, 'Content-Type': 'application/json' },
    },
  ];

  beforeEach(() => {
    httpService = new HttpService();

    httpServicePut = jest.fn();
    httpService.put = httpServicePut;

    service = new AcbsFacilityService({ baseUrl, useReturnExceptionHeader }, httpService);
  });

  describe('updateFacility', () => {
    it('sends a PUT to ACBS to update a facility with the specified parameters', async () => {
      when(httpServicePut)
        .calledWith(...expectedHttpServicePutArgs)
        .mockReturnValueOnce(
          of({
            data: '',
            status: 200,
            statusText: 'OK',
            config: undefined,
            headers: undefined,
          }),
        );

      await service.updateFacilityByIdentifier(randomPortfolioIdentifier, updatedFacility, idToken);

      expect(httpServicePut).toHaveBeenCalledTimes(1);
      expect(httpServicePut).toHaveBeenCalledWith(...expectedHttpServicePutArgs);
    });

    it('throws an AcbsBadRequestException if ACBS responds with a 400 error', async () => {
      const axiosError = new AxiosError();
      const errorString = valueGenerator.string();
      axiosError.response = {
        data: errorString,
        status: 400,
        statusText: 'Bad Request',
        headers: undefined,
        config: undefined,
      };

      when(httpServicePut)
        .calledWith(...expectedHttpServicePutArgs)
        .mockReturnValueOnce(throwError(() => axiosError));

      const updateFacilityPromise = service.updateFacilityByIdentifier(randomPortfolioIdentifier, updatedFacility, idToken);

      await expect(updateFacilityPromise).rejects.toBeInstanceOf(AcbsBadRequestException);
      await expect(updateFacilityPromise).rejects.toThrow(`Failed to update a facility with identifier ${facilityIdentifier} in ACBS.`);
      await expect(updateFacilityPromise).rejects.toHaveProperty('innerError', axiosError);
      await expect(updateFacilityPromise).rejects.toHaveProperty('errorBody', errorString);
    });

    it('throws an AcbsBadRequestException if ACBS responds with non-string message', async () => {
      const axiosError = new AxiosError();
      const errorObject = { errorObject: 'errorObjectMessage' };
      axiosError.response = {
        data: errorObject,
        status: 400,
        statusText: 'Bad Request',
        headers: undefined,
        config: undefined,
      };

      when(httpServicePut)
        .calledWith(...expectedHttpServicePutArgs)
        .mockReturnValueOnce(throwError(() => axiosError));

      const updateFacilityPromise = service.updateFacilityByIdentifier(randomPortfolioIdentifier, updatedFacility, idToken);

      await expect(updateFacilityPromise).rejects.toBeInstanceOf(AcbsBadRequestException);
      await expect(updateFacilityPromise).rejects.toThrow(`Failed to update a facility with identifier ${facilityIdentifier} in ACBS.`);
      await expect(updateFacilityPromise).rejects.toHaveProperty('innerError', axiosError);
      await expect(updateFacilityPromise).rejects.toHaveProperty('errorBody', JSON.stringify(errorObject));
    });

    it('throws an AcbsResourceNotFoundException if ACBS responds with a 400 error with "The Facility not found or the user does not have access to it."', async () => {
      const axiosError = new AxiosError();
      const errorString = 'The Facility not found or the user does not have access to it.';
      axiosError.response = {
        data: errorString,
        status: 400,
        statusText: 'Bad Request',
        headers: undefined,
        config: undefined,
      };

      when(httpServicePut)
        .calledWith(...expectedHttpServicePutArgs)
        .mockReturnValueOnce(throwError(() => axiosError));

      const updateFacilityPromise = service.updateFacilityByIdentifier(randomPortfolioIdentifier, updatedFacility, idToken);

      await expect(updateFacilityPromise).rejects.toBeInstanceOf(AcbsResourceNotFoundException);
      await expect(updateFacilityPromise).rejects.toThrow(`Facility with identifier ${facilityIdentifier} was not found by ACBS.`);
      await expect(updateFacilityPromise).rejects.toHaveProperty('innerError', axiosError);
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

      when(httpServicePut)
        .calledWith(...expectedHttpServicePutArgs)
        .mockReturnValueOnce(throwError(() => axiosError));

      const createDealPromise = service.updateFacilityByIdentifier(randomPortfolioIdentifier, updatedFacility, idToken);

      await expect(createDealPromise).rejects.toBeInstanceOf(AcbsUnexpectedException);
      await expect(createDealPromise).rejects.toThrow(`Failed to update a facility with identifier ${facilityIdentifier} in ACBS.`);
      await expect(createDealPromise).rejects.toHaveProperty('innerError', axiosError);
    });
  });
});
