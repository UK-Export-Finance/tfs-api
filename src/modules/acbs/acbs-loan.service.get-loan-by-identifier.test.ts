import { HttpService } from '@nestjs/axios';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { UpdateLoanGenerator } from '@ukef-test/support/generator/update-loan-generator';
import { AxiosError } from 'axios';
import { when } from 'jest-when';
import { of, throwError } from 'rxjs';

import { AcbsLoanService } from './acbs-loan-service';
import { AcbsException } from './exception/acbs.exception';
import { AcbsResourceNotFoundException } from './exception/acbs-resource-not-found.exception';

describe('AcbsLoanService', () => {
  const valueGenerator = new RandomValueGenerator();
  const dateStringTransformations = new DateStringTransformations();
  const idToken = valueGenerator.string();
  const baseUrl = valueGenerator.httpsUrl();
  const useReturnExceptionHeader = false;
  const portfolioIdentifier = valueGenerator.portfolioId();
  const facilityIdentifier = valueGenerator.facilityId();
  const loanIdentifier = valueGenerator.loanId();
  let httpService: HttpService;
  let service: AcbsLoanService;

  let httpServiceGet: jest.Mock;

  const { acbsGetExistingLoanResponse } = new UpdateLoanGenerator(valueGenerator, dateStringTransformations).generate({
    numberToGenerate: 1,
    facilityIdentifier,
    portfolioIdentifier,
    loanIdentifier,
  });

  const expectedHttpServiceGetArgs = [
    `/Portfolio/${portfolioIdentifier}/Loan/${loanIdentifier}`,
    {
      baseURL: baseUrl,
      headers: { Authorization: `Bearer ${idToken}` },
    },
  ];

  beforeEach(() => {
    httpService = new HttpService();

    httpServiceGet = jest.fn();
    httpService.get = httpServiceGet;

    service = new AcbsLoanService({ baseUrl, useReturnExceptionHeader }, httpService);
  });

  describe('getLoanByLoanIdentifier', () => {
    const successfulAcbsResponse = {
      data: acbsGetExistingLoanResponse,
      status: 200,
      statusText: 'Ok',
      config: undefined,
      headers: undefined,
    };

    const badRequestAcbsResponseWithoutDataField = {
      status: 400,
      statusText: 'Bad Request',
      headers: undefined,
      config: undefined,
    };

    it('returns the loan by loan identifier from ACBS if ACBS responds with the loan', async () => {
      when(httpServiceGet)
        .calledWith(...expectedHttpServiceGetArgs)
        .mockReturnValueOnce(of(successfulAcbsResponse));

      const loans = await service.getLoanByIdentifier(portfolioIdentifier, loanIdentifier, idToken);

      expect(loans).toBe(acbsGetExistingLoanResponse);
    });

    it('throws an AcbsResourceNotFoundException if ACBS responds with a 400 response that is a string containing "Loan not found"', async () => {
      const axiosError = new AxiosError();
      axiosError.response = { ...badRequestAcbsResponseWithoutDataField, data: 'Loan not found or user does not have access to it.' };

      when(httpServiceGet)
        .calledWith(...expectedHttpServiceGetArgs)
        .mockReturnValueOnce(throwError(() => axiosError));

      const getLoansPromise = service.getLoanByIdentifier(portfolioIdentifier, loanIdentifier, idToken);

      await expect(getLoansPromise).rejects.toBeInstanceOf(AcbsResourceNotFoundException);
      await expect(getLoansPromise).rejects.toThrow(`Loan with identifier ${loanIdentifier} was not found by ACBS.`);
      await expect(getLoansPromise).rejects.toHaveProperty('innerError', axiosError);
    });

    it('throws an AcbsException if ACBS responds with a 400 response that is a string that does NOT contain "Loan not found"', async () => {
      const axiosError = new AxiosError();
      axiosError.response = { ...badRequestAcbsResponseWithoutDataField, data: 'some error string' };

      when(httpServiceGet)
        .calledWith(...expectedHttpServiceGetArgs)
        .mockReturnValueOnce(throwError(() => axiosError));

      const getLoansPromise = service.getLoanByIdentifier(portfolioIdentifier, loanIdentifier, idToken);

      await expect(getLoansPromise).rejects.toBeInstanceOf(AcbsException);
      await expect(getLoansPromise).rejects.toThrow(`Failed to get the loan with the loan identifier ${loanIdentifier}.`);
      await expect(getLoansPromise).rejects.toHaveProperty('innerError', axiosError);
    });

    it('throws an AcbsException if ACBS responds with a 400 response that is NOT a string', async () => {
      const axiosError = new AxiosError();
      axiosError.response = {
        ...badRequestAcbsResponseWithoutDataField,
        data: { errorMessage: valueGenerator.string() },
      };

      when(httpServiceGet)
        .calledWith(...expectedHttpServiceGetArgs)
        .mockReturnValueOnce(throwError(() => axiosError));

      const getLoansPromise = service.getLoanByIdentifier(portfolioIdentifier, loanIdentifier, idToken);

      await expect(getLoansPromise).rejects.toBeInstanceOf(AcbsException);
      await expect(getLoansPromise).rejects.toThrow(`Failed to get the loan with the loan identifier ${loanIdentifier}.`);
      await expect(getLoansPromise).rejects.toHaveProperty('innerError', axiosError);
    });
  });
});
