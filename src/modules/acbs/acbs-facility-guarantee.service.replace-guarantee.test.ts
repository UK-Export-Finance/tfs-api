import { HttpService } from '@nestjs/axios';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { AxiosError } from 'axios';
import { when } from 'jest-when';
import { of, throwError } from 'rxjs';

import { AcbsFacilityGuaranteeService } from './acbs-facility-guarantee.service';
import { AcbsUpdateFacilityGuaranteeRequest } from './dto/acbs-update-facility-guarantee-request.dto';
import { AcbsBadRequestException } from './exception/acbs-bad-request.exception';
import { AcbsResourceNotFoundException } from './exception/acbs-resource-not-found.exception';
import { AcbsUnexpectedException } from './exception/acbs-unexpected.exception';

describe('AcbsFacilityGuaranteeService', () => {
  const valueGenerator = new RandomValueGenerator();
  const idToken = valueGenerator.string();
  const baseUrl = valueGenerator.httpsUrl();
  const useReturnExceptionHeader = false;
  const facilityIdentifier = valueGenerator.ukefId();
  const portfolioIdentifier = valueGenerator.portfolioId();

  const acbsRequestBodyToPutFacilityGuarantee: AcbsUpdateFacilityGuaranteeRequest = {
    GuarantorParty: {
      PartyIdentifier: valueGenerator.acbsPartyId(),
    },
    LimitKey: valueGenerator.acbsPartyId(),
    LimitType: {
      LimitTypeCode: valueGenerator.string({ length: 2 }),
    },
    LenderType: {
      LenderTypeCode: valueGenerator.string({ length: 3 }),
    },
    SectionIdentifier: valueGenerator.string({ length: 2 }),
    GuaranteeType: {
      GuaranteeTypeCode: valueGenerator.string({ length: 3 }),
    },
    EffectiveDate: valueGenerator.dateTimeString(),
    ExpirationDate: valueGenerator.dateTimeString(),
    GuaranteedLimit: valueGenerator.nonnegativeFloat(),
    GuaranteedPercentage: valueGenerator.nonnegativeInteger(),
  };

  const expectedHttpServicePutArgs = [
    `/Portfolio/${portfolioIdentifier}/Facility/${facilityIdentifier}/FacilityGuarantee`,
    acbsRequestBodyToPutFacilityGuarantee,
    {
      baseURL: baseUrl,
      headers: { Authorization: `Bearer ${idToken}`, 'Content-Type': 'application/json' },
    },
  ];

  let httpService: HttpService;
  let service: AcbsFacilityGuaranteeService;

  let httpServicePut: jest.Mock;

  beforeEach(() => {
    httpService = new HttpService();

    httpServicePut = jest.fn();
    httpService.put = httpServicePut;

    service = new AcbsFacilityGuaranteeService({ baseUrl, useReturnExceptionHeader }, httpService);
  });

  describe('replaceGuaranteeForFacility', () => {
    it('sends a PUT to ACBS with the specified parameters', async () => {
      when(httpServicePut)
        .calledWith(...expectedHttpServicePutArgs)
        .mockReturnValueOnce(
          of({
            data: '',
            status: 200,
            statusText: 'Ok',
            config: undefined,
            headers: undefined,
          }),
        );

      await service.replaceGuaranteeForFacility(portfolioIdentifier, facilityIdentifier, acbsRequestBodyToPutFacilityGuarantee, idToken);

      expect(httpServicePut).toHaveBeenCalledTimes(1);
      expect(httpServicePut).toHaveBeenCalledWith(...expectedHttpServicePutArgs);
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

      when(httpServicePut)
        .calledWith(...expectedHttpServicePutArgs)
        .mockReturnValueOnce(throwError(() => axiosError));

      const replaceGuaranteeForFacilityPromise = service.replaceGuaranteeForFacility(
        portfolioIdentifier,
        facilityIdentifier,
        acbsRequestBodyToPutFacilityGuarantee,
        idToken,
      );

      await expect(replaceGuaranteeForFacilityPromise).rejects.toBeInstanceOf(AcbsResourceNotFoundException);
      await expect(replaceGuaranteeForFacilityPromise).rejects.toThrow(`Facility with identifier ${facilityIdentifier} was not found by ACBS.`);
      await expect(replaceGuaranteeForFacilityPromise).rejects.toHaveProperty('innerError', axiosError);
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

      when(httpServicePut)
        .calledWith(...expectedHttpServicePutArgs)
        .mockReturnValueOnce(throwError(() => axiosError));

      const replaceGuaranteeForFacilityPromise = service.replaceGuaranteeForFacility(
        portfolioIdentifier,
        facilityIdentifier,
        acbsRequestBodyToPutFacilityGuarantee,
        idToken,
      );

      await expect(replaceGuaranteeForFacilityPromise).rejects.toBeInstanceOf(AcbsBadRequestException);
      await expect(replaceGuaranteeForFacilityPromise).rejects.toThrow(`Failed to replace a guarantee for facility ${facilityIdentifier} in ACBS.`);
      await expect(replaceGuaranteeForFacilityPromise).rejects.toHaveProperty('innerError', axiosError);
      await expect(replaceGuaranteeForFacilityPromise).rejects.toHaveProperty('errorBody', errorString);
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

      when(httpServicePut)
        .calledWith(...expectedHttpServicePutArgs)
        .mockReturnValueOnce(throwError(() => axiosError));

      const replaceGuaranteeForFacilityPromise = service.replaceGuaranteeForFacility(
        portfolioIdentifier,
        facilityIdentifier,
        acbsRequestBodyToPutFacilityGuarantee,
        idToken,
      );

      await expect(replaceGuaranteeForFacilityPromise).rejects.toBeInstanceOf(AcbsBadRequestException);
      await expect(replaceGuaranteeForFacilityPromise).rejects.toThrow(`Failed to replace a guarantee for facility ${facilityIdentifier} in ACBS.`);
      await expect(replaceGuaranteeForFacilityPromise).rejects.toHaveProperty('innerError', axiosError);
      await expect(replaceGuaranteeForFacilityPromise).rejects.toHaveProperty('errorBody', JSON.stringify(errorBody));
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

      const replaceGuaranteeForFacilityPromise = service.replaceGuaranteeForFacility(
        portfolioIdentifier,
        facilityIdentifier,
        acbsRequestBodyToPutFacilityGuarantee,
        idToken,
      );

      await expect(replaceGuaranteeForFacilityPromise).rejects.toBeInstanceOf(AcbsUnexpectedException);
      await expect(replaceGuaranteeForFacilityPromise).rejects.toThrow(`Failed to replace a guarantee for facility ${facilityIdentifier} in ACBS.`);
      await expect(replaceGuaranteeForFacilityPromise).rejects.toHaveProperty('innerError', axiosError);
    });
  });
});
