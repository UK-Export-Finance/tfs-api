import { HttpService } from '@nestjs/axios';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { UpdateLoanGenerator } from '@ukef-test/support/generator/update-loan-generator';
import { AxiosError } from 'axios';
import { when } from 'jest-when';
import { of, throwError } from 'rxjs';

import { AcbsLoanService } from './acbs-loan-service';
import { AcbsBadRequestException } from './exception/acbs-bad-request.exception';
import { AcbsResourceNotFoundException } from './exception/acbs-resource-not-found.exception';
import { AcbsUnexpectedException } from './exception/acbs-unexpected.exception';

describe('AcbsLoanService', () => {
  const valueGenerator = new RandomValueGenerator();
  const dateStringTransformations = new DateStringTransformations();
  const idToken = valueGenerator.string();
  const baseUrl = valueGenerator.httpsUrl();
  const portfolioIdentifier = valueGenerator.portfolioId();
  const facilityIdentifier = valueGenerator.facilityId();
  const loanIdentifier = valueGenerator.loanId();
  let httpService: HttpService;
  let service: AcbsLoanService;

  let httpServicePut: jest.Mock;

  const { acbsUpdateLoanRequest } = new UpdateLoanGenerator(valueGenerator, dateStringTransformations).generate({
    numberToGenerate: 1,
    facilityIdentifier,
    portfolioIdentifier,
    loanIdentifier,
  });

  const expectedHttpServicePutArgs = [
    `/Portfolio/${portfolioIdentifier}/Loan/${loanIdentifier}`,
    acbsUpdateLoanRequest,
    {
      baseURL: baseUrl,
      headers: { Authorization: `Bearer ${idToken}`, 'Content-Type': 'application/json' },
    },
  ];

  beforeEach(() => {
    httpService = new HttpService();

    httpServicePut = jest.fn();
    httpService.put = httpServicePut;

    service = new AcbsLoanService({ baseUrl }, httpService);
  });

  describe('updateLoanByIdentifier', () => {
    it('sends a PUT to ACBS to update a loan with the specified parameters', async () => {
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

      await service.updateLoanByIdentifier(portfolioIdentifier, acbsUpdateLoanRequest, idToken);

      expect(httpServicePut).toHaveBeenCalledTimes(1);
      expect(httpServicePut).toHaveBeenCalledWith(...expectedHttpServicePutArgs);
    });

    it('throws an AcbsBadRequestException if ACBS responds with a 400 error with a string that does not contain "The loan not found', async () => {
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

      const updateLoanPromise = service.updateLoanByIdentifier(portfolioIdentifier, acbsUpdateLoanRequest, idToken);

      await expect(updateLoanPromise).rejects.toBeInstanceOf(AcbsBadRequestException);
      await expect(updateLoanPromise).rejects.toThrow(`Failed to update loan with identifier ${loanIdentifier} in ACBS.`);
      await expect(updateLoanPromise).rejects.toHaveProperty('innerError', axiosError);
      await expect(updateLoanPromise).rejects.toHaveProperty('errorBody', errorString);
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

      const updateLoanPromise = service.updateLoanByIdentifier(portfolioIdentifier, acbsUpdateLoanRequest, idToken);

      await expect(updateLoanPromise).rejects.toBeInstanceOf(AcbsBadRequestException);
      await expect(updateLoanPromise).rejects.toThrow(`Failed to update loan with identifier ${loanIdentifier} in ACBS.`);
      await expect(updateLoanPromise).rejects.toHaveProperty('innerError', axiosError);
      await expect(updateLoanPromise).rejects.toHaveProperty('errorBody', JSON.stringify(errorObject));
    });

    it('throws an AcbsResourceNotFoundException if ACBS responds with a 400 error with "The loan not found or the user does not have access to it"', async () => {
      const axiosError = new AxiosError();
      const errorString = 'The loan not found or the user does not have access to it';
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

      const updateLoanPromise = service.updateLoanByIdentifier(portfolioIdentifier, acbsUpdateLoanRequest, idToken);

      await expect(updateLoanPromise).rejects.toBeInstanceOf(AcbsResourceNotFoundException);
      await expect(updateLoanPromise).rejects.toThrow(`Loan with identifier ${loanIdentifier} was not found by ACBS.`);
      await expect(updateLoanPromise).rejects.toHaveProperty('innerError', axiosError);
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

      const createDealPromise = service.updateLoanByIdentifier(portfolioIdentifier, acbsUpdateLoanRequest, idToken);

      await expect(createDealPromise).rejects.toBeInstanceOf(AcbsUnexpectedException);
      await expect(createDealPromise).rejects.toThrow(`Failed to update loan with identifier ${loanIdentifier} in ACBS.`);
      await expect(createDealPromise).rejects.toHaveProperty('innerError', axiosError);
    });
  });
});
