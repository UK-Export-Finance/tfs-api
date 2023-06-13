import { HttpService } from '@nestjs/axios';
import { PROPERTIES } from '@ukef/constants';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { generateAcbsCreateFacilityGuaranteeDtoUsing } from '@ukef-test/support/requests/acbs-create-facility-guarantee-dto';
import { AxiosError } from 'axios';
import { when } from 'jest-when';
import { of, throwError } from 'rxjs';

import { AcbsFacilityGuaranteeService } from './acbs-facility-guarantee.service';
import { AcbsBadRequestException } from './exception/acbs-bad-request.exception';
import { AcbsResourceNotFoundException } from './exception/acbs-resource-not-found.exception';
import { AcbsUnexpectedException } from './exception/acbs-unexpected.exception';

describe('AcbsFacilityGuaranteeService', () => {
  const valueGenerator = new RandomValueGenerator();
  const idToken = valueGenerator.string();
  const baseUrl = valueGenerator.httpsUrl();
  const useReturnExceptionHeader = false;
  const { portfolioIdentifier } = PROPERTIES.GLOBAL;
  const facilityIdentifier = valueGenerator.facilityId();
  const newFacilityGuarantee = generateAcbsCreateFacilityGuaranteeDtoUsing(valueGenerator);

  let httpService: HttpService;
  let service: AcbsFacilityGuaranteeService;

  let httpServicePost: jest.Mock;

  const expectedHttpServicePostArgs = [
    `/Portfolio/${portfolioIdentifier}/Facility/${facilityIdentifier}/FacilityGuarantee`,
    newFacilityGuarantee,
    {
      baseURL: baseUrl,
      headers: { Authorization: `Bearer ${idToken}`, 'Content-Type': 'application/json' },
    },
  ];

  beforeEach(() => {
    httpService = new HttpService();

    httpServicePost = jest.fn();
    httpService.post = httpServicePost;

    service = new AcbsFacilityGuaranteeService({ baseUrl, useReturnExceptionHeader }, httpService);
  });

  describe('createGuaranteeForFacility', () => {
    it('sends a POST to ACBS with the specified parameters', async () => {
      when(httpServicePost)
        .calledWith(...expectedHttpServicePostArgs)
        .mockReturnValueOnce(
          of({
            data: '',
            status: 201,
            statusText: 'Created',
            config: undefined,
            headers: undefined,
          }),
        );

      await service.createGuaranteeForFacility(facilityIdentifier, newFacilityGuarantee, idToken);

      expect(httpServicePost).toHaveBeenCalledTimes(1);
      expect(httpServicePost).toHaveBeenCalledWith(`/Portfolio/${portfolioIdentifier}/Facility/${facilityIdentifier}/FacilityGuarantee`, newFacilityGuarantee, {
        baseURL: baseUrl,
        headers: { Authorization: `Bearer ${idToken}`, 'Content-Type': 'application/json' },
      });
    });

    it('throws an AcbsResourceNotFoundException if ACBS responds with a 400 that is a string containing "The facility not found"', async () => {
      const axiosError = new AxiosError();
      const errorString = 'The facility not found or the user does not have access to it.';
      axiosError.response = {
        data: errorString,
        status: 400,
        statusText: 'Bad Request',
        headers: undefined,
        config: undefined,
      };

      when(httpServicePost)
        .calledWith(...expectedHttpServicePostArgs)
        .mockReturnValueOnce(throwError(() => axiosError));

      const createGuaranteeForFacilityPromise = service.createGuaranteeForFacility(facilityIdentifier, newFacilityGuarantee, idToken);

      await expect(createGuaranteeForFacilityPromise).rejects.toBeInstanceOf(AcbsResourceNotFoundException);
      await expect(createGuaranteeForFacilityPromise).rejects.toThrow(`Facility with identifier ${facilityIdentifier} was not found by ACBS.`);
      await expect(createGuaranteeForFacilityPromise).rejects.toHaveProperty('innerError', axiosError);
    });

    it('throws an AcbsBadRequestException if ACBS responds with a 400 that is a string that does not contain "The facility not found"', async () => {
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
        .calledWith(...expectedHttpServicePostArgs)
        .mockReturnValueOnce(throwError(() => axiosError));

      const createGuaranteeForFacilityPromise = service.createGuaranteeForFacility(facilityIdentifier, newFacilityGuarantee, idToken);

      await expect(createGuaranteeForFacilityPromise).rejects.toBeInstanceOf(AcbsBadRequestException);
      await expect(createGuaranteeForFacilityPromise).rejects.toThrow(`Failed to create a guarantee for facility ${facilityIdentifier} in ACBS.`);
      await expect(createGuaranteeForFacilityPromise).rejects.toHaveProperty('innerError', axiosError);
      await expect(createGuaranteeForFacilityPromise).rejects.toHaveProperty('errorBody', errorString);
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
        .calledWith(...expectedHttpServicePostArgs)
        .mockReturnValueOnce(throwError(() => axiosError));

      const createGuaranteeForFacilityPromise = service.createGuaranteeForFacility(facilityIdentifier, newFacilityGuarantee, idToken);

      await expect(createGuaranteeForFacilityPromise).rejects.toBeInstanceOf(AcbsBadRequestException);
      await expect(createGuaranteeForFacilityPromise).rejects.toThrow(`Failed to create a guarantee for facility ${facilityIdentifier} in ACBS.`);
      await expect(createGuaranteeForFacilityPromise).rejects.toHaveProperty('innerError', axiosError);
      await expect(createGuaranteeForFacilityPromise).rejects.toHaveProperty('errorBody', JSON.stringify(errorBody));
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
        .calledWith(...expectedHttpServicePostArgs)
        .mockReturnValueOnce(throwError(() => axiosError));

      const createGuaranteeForFacilityPromise = service.createGuaranteeForFacility(facilityIdentifier, newFacilityGuarantee, idToken);

      await expect(createGuaranteeForFacilityPromise).rejects.toBeInstanceOf(AcbsUnexpectedException);
      await expect(createGuaranteeForFacilityPromise).rejects.toThrow(`Failed to create a guarantee for facility ${facilityIdentifier} in ACBS.`);
      await expect(createGuaranteeForFacilityPromise).rejects.toHaveProperty('innerError', axiosError);
    });
  });
});
