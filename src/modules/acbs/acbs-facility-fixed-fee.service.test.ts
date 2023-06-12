import { HttpService } from '@nestjs/axios';
import { ENUMS } from '@ukef/constants';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { CreateFacilityFixedFeeGenerator } from '@ukef-test/support/generator/create-facility-fixed-fee-generator';
import { GetFacilityFixedFeeGenerator } from '@ukef-test/support/generator/get-facility-fixed-fee-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { AxiosError } from 'axios';
import { when } from 'jest-when';
import { of, throwError } from 'rxjs';

import { AcbsFacilityFixedFeeService } from './acbs-facility-fixed-fee.service';
import { AcbsException } from './exception/acbs.exception';
import { AcbsBadRequestException } from './exception/acbs-bad-request.exception';
import { AcbsResourceNotFoundException } from './exception/acbs-resource-not-found.exception';
import { AcbsUnexpectedException } from './exception/acbs-unexpected.exception';

describe('AcbsFacilityFixedFeeService', () => {
  const valueGenerator = new RandomValueGenerator();
  const idToken = valueGenerator.string();
  const baseUrl = valueGenerator.httpsUrl();
  const useReturnExceptionHeader = false;
  const portfolioIdentifier = valueGenerator.portfolioId();
  const facilityIdentifier = valueGenerator.facilityId();
  const borrowerPartyIdentifier = valueGenerator.acbsPartyId();
  const facilityTypeCode = valueGenerator.enumValue(ENUMS.FACILITY_TYPE_IDS);

  let httpService: HttpService;
  let service: AcbsFacilityFixedFeeService;

  let httpServiceGet: jest.Mock;
  let httpServicePost: jest.Mock;

  const expectedHttpServiceGetArgs = [
    `/Portfolio/${portfolioIdentifier}/Facility/${facilityIdentifier}/Fee`,
    {
      baseURL: baseUrl,
      headers: { Authorization: `Bearer ${idToken}` },
    },
  ];

  beforeEach(() => {
    httpService = new HttpService();

    httpServiceGet = jest.fn();
    httpService.get = httpServiceGet;

    httpServicePost = jest.fn();
    httpService.post = httpServicePost;

    service = new AcbsFacilityFixedFeeService({ baseUrl, useReturnExceptionHeader }, httpService);
  });

  const { acbsFacilityFixedFees: facilityFixedFeesInAcbs } = new GetFacilityFixedFeeGenerator(valueGenerator, new DateStringTransformations()).generate({
    numberToGenerate: 2,
    facilityIdentifier,
    portfolioIdentifier,
  });

  const { acbsRequestBodyToCreateFacilityFixedFee } = new CreateFacilityFixedFeeGenerator(valueGenerator, new DateStringTransformations()).generate({
    numberToGenerate: 1,
    facilityTypeCode,
    borrowerPartyIdentifier,
  });

  const expectedHttpServicePostArgs = [
    `/Portfolio/${portfolioIdentifier}/Facility/${facilityIdentifier}/Fee/FixedFee`,
    acbsRequestBodyToCreateFacilityFixedFee,
    {
      baseURL: baseUrl,
      headers: { Authorization: `Bearer ${idToken}`, 'Content-Type': 'application/json' },
    },
  ];

  describe('getFixedFeesForFacility', () => {
    it('returns the fixed fees for the facility from ACBS if ACBS responds with the fixed fees', async () => {
      when(httpServiceGet)
        .calledWith(...expectedHttpServiceGetArgs)
        .mockReturnValueOnce(
          of({
            data: facilityFixedFeesInAcbs,
            status: 200,
            statusText: 'Ok',
            config: undefined,
            headers: undefined,
          }),
        );

      const fixedFees = await service.getFixedFeesForFacility(portfolioIdentifier, facilityIdentifier, idToken);

      expect(fixedFees).toBe(facilityFixedFeesInAcbs);
    });

    it('returns an empty array if ACBS responds with an empty array', async () => {
      when(httpServiceGet)
        .calledWith(...expectedHttpServiceGetArgs)
        .mockReturnValueOnce(
          of({
            data: [],
            status: 200,
            statusText: 'Ok',
            config: undefined,
            headers: undefined,
          }),
        );

      const fixedFees = await service.getFixedFeesForFacility(portfolioIdentifier, facilityIdentifier, idToken);

      expect(fixedFees).toStrictEqual([]);
    });

    it('throws an AcbsException if the request to ACBS fails', async () => {
      const getFixedFeesForFacilityError = new AxiosError();
      when(httpServiceGet)
        .calledWith(...expectedHttpServiceGetArgs)
        .mockReturnValueOnce(throwError(() => getFixedFeesForFacilityError));

      const getFixedFeesForFacilityPromise = service.getFixedFeesForFacility(portfolioIdentifier, facilityIdentifier, idToken);

      await expect(getFixedFeesForFacilityPromise).rejects.toBeInstanceOf(AcbsException);
      await expect(getFixedFeesForFacilityPromise).rejects.toThrow(`Failed to get the fixed fees for the facility with identifier ${facilityIdentifier}.`);
      await expect(getFixedFeesForFacilityPromise).rejects.toHaveProperty('innerError', getFixedFeesForFacilityError);
    });
  });

  describe('createFixedFeeForFacility', () => {
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

      await service.createFixedFeeForFacility(portfolioIdentifier, facilityIdentifier, acbsRequestBodyToCreateFacilityFixedFee, idToken);

      expect(httpServicePost).toHaveBeenCalledTimes(1);
      expect(httpServicePost).toHaveBeenCalledWith(
        `/Portfolio/${portfolioIdentifier}/Facility/${facilityIdentifier}/Fee/FixedFee`,
        acbsRequestBodyToCreateFacilityFixedFee,
        {
          baseURL: baseUrl,
          headers: { Authorization: `Bearer ${idToken}`, 'Content-Type': 'application/json' },
        },
      );
    });

    it('throws an AcbsResourceNotFoundException if ACBS responds with a 400 that is a string containing "Invalid PortfolioId and FacilityId combination"', async () => {
      const axiosError = new AxiosError();
      const errorString = 'Invalid PortfolioId and FacilityId combination.';
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

      const createFixedFeeForFacilityPromise = service.createFixedFeeForFacility(
        portfolioIdentifier,
        facilityIdentifier,
        acbsRequestBodyToCreateFacilityFixedFee,
        idToken,
      );

      await expect(createFixedFeeForFacilityPromise).rejects.toBeInstanceOf(AcbsResourceNotFoundException);
      await expect(createFixedFeeForFacilityPromise).rejects.toThrow(`Facility with identifier ${facilityIdentifier} was not found by ACBS.`);
      await expect(createFixedFeeForFacilityPromise).rejects.toHaveProperty('innerError', axiosError);
    });

    it('throws an AcbsBadRequestException if ACBS responds with a 400 that is a string containing "FixedFee exists"', async () => {
      const axiosError = new AxiosError();
      const errorString = 'FixedFee exists';
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

      const createFixedFeeForFacilityPromise = service.createFixedFeeForFacility(
        portfolioIdentifier,
        facilityIdentifier,
        acbsRequestBodyToCreateFacilityFixedFee,
        idToken,
      );

      await expect(createFixedFeeForFacilityPromise).rejects.toBeInstanceOf(AcbsBadRequestException);
      await expect(createFixedFeeForFacilityPromise).rejects.toThrow(`Bad request`);
      await expect(createFixedFeeForFacilityPromise).rejects.toHaveProperty('innerError', axiosError);
    });

    it('throws an AcbsBadRequestException if ACBS responds with a 400 that is a string that does not contain "Invalid PortfolioId and FacilityId combination" and "FixedFee exists"', async () => {
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

      const createFixedFeeForFacilityPromise = service.createFixedFeeForFacility(
        portfolioIdentifier,
        facilityIdentifier,
        acbsRequestBodyToCreateFacilityFixedFee,
        idToken,
      );

      await expect(createFixedFeeForFacilityPromise).rejects.toBeInstanceOf(AcbsBadRequestException);
      await expect(createFixedFeeForFacilityPromise).rejects.toThrow(`Failed to create a fixed fee for facility ${facilityIdentifier} in ACBS.`);
      await expect(createFixedFeeForFacilityPromise).rejects.toHaveProperty('innerError', axiosError);
      await expect(createFixedFeeForFacilityPromise).rejects.toHaveProperty('errorBody', errorString);
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

      const createFixedFeeForFacilityPromise = service.createFixedFeeForFacility(
        portfolioIdentifier,
        facilityIdentifier,
        acbsRequestBodyToCreateFacilityFixedFee,
        idToken,
      );

      await expect(createFixedFeeForFacilityPromise).rejects.toBeInstanceOf(AcbsBadRequestException);
      await expect(createFixedFeeForFacilityPromise).rejects.toThrow(`Failed to create a fixed fee for facility ${facilityIdentifier} in ACBS.`);
      await expect(createFixedFeeForFacilityPromise).rejects.toHaveProperty('innerError', axiosError);
      await expect(createFixedFeeForFacilityPromise).rejects.toHaveProperty('errorBody', JSON.stringify(errorBody));
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

      const createFixedFeeForFacilityPromise = service.createFixedFeeForFacility(
        portfolioIdentifier,
        facilityIdentifier,
        acbsRequestBodyToCreateFacilityFixedFee,
        idToken,
      );

      await expect(createFixedFeeForFacilityPromise).rejects.toBeInstanceOf(AcbsUnexpectedException);
      await expect(createFixedFeeForFacilityPromise).rejects.toThrow(`Failed to create a fixed fee for facility ${facilityIdentifier} in ACBS.`);
      await expect(createFixedFeeForFacilityPromise).rejects.toHaveProperty('innerError', axiosError);
    });
  });
});
