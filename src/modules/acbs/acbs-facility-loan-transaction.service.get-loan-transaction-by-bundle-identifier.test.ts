import { HttpService } from '@nestjs/axios';
import { PROPERTIES } from '@ukef/constants';
import { GetFacilityLoanTransactionGenerator } from '@ukef-test/support/generator/get-facility-loan-transaction-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { AxiosError } from 'axios';
import { when } from 'jest-when';
import { of, throwError } from 'rxjs';

import { DateStringTransformations } from '../date/date-string.transformations';
import { AcbsFacilityLoanTransactionService } from './acbs-facility-loan-transaction.service';
import { AcbsException } from './exception/acbs.exception';
import { AcbsResourceNotFoundException } from './exception/acbs-resource-not-found.exception';

describe('AcbsFacilityLoanTransactionService', () => {
  const valueGenerator = new RandomValueGenerator();
  const dateStringTransformations = new DateStringTransformations();
  const idToken = valueGenerator.string();
  const baseUrl = valueGenerator.httpsUrl();

  let httpService: HttpService;
  let service: AcbsFacilityLoanTransactionService;

  let httpServiceGet: jest.Mock;

  beforeEach(() => {
    httpService = new HttpService();

    httpServiceGet = jest.fn();
    httpService.get = httpServiceGet;

    service = new AcbsFacilityLoanTransactionService({ baseUrl }, httpService);
  });

  describe('getLoanTransactionByBundleIdentifier', () => {
    const portfolioIdentifier = PROPERTIES.GLOBAL.portfolioIdentifier;
    const facilityIdentifier = valueGenerator.ukefId();
    const bundleIdentifier = valueGenerator.string({ length: 9 });

    it('returns the loan transaction if ACBS responds with the loan transaction', async () => {
      const { facilityLoanTransactionsInAcbs } = new GetFacilityLoanTransactionGenerator(valueGenerator, dateStringTransformations).generate({
        numberToGenerate: 1,
        facilityIdentifier,
        portfolioIdentifier,
      });
      const loanTransactionInAcbs = facilityLoanTransactionsInAcbs[0];

      when(httpServiceGet)
        .calledWith(`/BundleInformation/${bundleIdentifier}?returnItems=true`, {
          baseURL: baseUrl,
          headers: { Authorization: `Bearer ${idToken}` },
        })
        .mockReturnValueOnce(
          of({
            data: loanTransactionInAcbs,
            status: 200,
            statusText: 'OK',
            config: undefined,
            headers: undefined,
          }),
        );

      const loanTransaction = await service.getLoanTransactionByBundleIdentifier(bundleIdentifier, idToken);

      expect(loanTransaction).toStrictEqual(loanTransactionInAcbs);
    });

    it('throws an AcbsException if the request to ACBS fails', async () => {
      const getLoanTransactionByBundleIdentifierError = new AxiosError();
      when(httpServiceGet)
        .calledWith(`/BundleInformation/${bundleIdentifier}?returnItems=true`, {
          baseURL: baseUrl,
          headers: { Authorization: `Bearer ${idToken}` },
        })
        .mockReturnValueOnce(throwError(() => getLoanTransactionByBundleIdentifierError));

      const getLoanTransactionPromise = service.getLoanTransactionByBundleIdentifier(bundleIdentifier, idToken);

      await expect(getLoanTransactionPromise).rejects.toBeInstanceOf(AcbsException);
      await expect(getLoanTransactionPromise).rejects.toThrow(`Failed to get the loan transaction with bundle identifier ${bundleIdentifier}.`);
      await expect(getLoanTransactionPromise).rejects.toHaveProperty('innerError', getLoanTransactionByBundleIdentifierError);
    });

    it('throws an AcbsResourceNotFoundException if ACBS responds with a 400 response that is a string containing "BundleInformation not found"', async () => {
      const axiosError = new AxiosError();
      axiosError.response = {
        data: 'BundleInformation not found or user does not have access to it.',
        status: 400,
        statusText: 'Bad Request',
        headers: undefined,
        config: undefined,
      };

      when(httpServiceGet)
        .calledWith(`/BundleInformation/${bundleIdentifier}?returnItems=true`, {
          baseURL: baseUrl,
          headers: { Authorization: `Bearer ${idToken}` },
        })
        .mockReturnValueOnce(throwError(() => axiosError));

      const getLoanTransactionPromise = service.getLoanTransactionByBundleIdentifier(bundleIdentifier, idToken);

      await expect(getLoanTransactionPromise).rejects.toBeInstanceOf(AcbsResourceNotFoundException);
      await expect(getLoanTransactionPromise).rejects.toThrow(`Loan transaction with bundle identifier ${bundleIdentifier} was not found by ACBS.`);
      await expect(getLoanTransactionPromise).rejects.toHaveProperty('innerError', axiosError);
    });

    it('throws an AcbsException if ACBS responds with a 400 response that is a string that does NOT contain "BundleInformation not found"', async () => {
      const axiosError = new AxiosError();
      axiosError.response = {
        data: 'some error string',
        status: 400,
        statusText: 'Bad Request',
        headers: undefined,
        config: undefined,
      };

      when(httpServiceGet)
        .calledWith(`/BundleInformation/${bundleIdentifier}?returnItems=true`, {
          baseURL: baseUrl,
          headers: { Authorization: `Bearer ${idToken}` },
        })
        .mockReturnValueOnce(throwError(() => axiosError));

      const getLoanTransactionPromise = service.getLoanTransactionByBundleIdentifier(bundleIdentifier, idToken);

      await expect(getLoanTransactionPromise).rejects.toBeInstanceOf(AcbsException);
      await expect(getLoanTransactionPromise).rejects.toThrow(`Failed to get the loan transaction with bundle identifier ${bundleIdentifier}.`);
      await expect(getLoanTransactionPromise).rejects.toHaveProperty('innerError', axiosError);
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
        .calledWith(`/BundleInformation/${bundleIdentifier}?returnItems=true`, {
          baseURL: baseUrl,
          headers: { Authorization: `Bearer ${idToken}` },
        })
        .mockReturnValueOnce(throwError(() => axiosError));

      const getLoanTransactionPromise = service.getLoanTransactionByBundleIdentifier(bundleIdentifier, idToken);

      await expect(getLoanTransactionPromise).rejects.toBeInstanceOf(AcbsException);
      await expect(getLoanTransactionPromise).rejects.toThrow(`Failed to get the loan transaction with bundle identifier ${bundleIdentifier}.`);
      await expect(getLoanTransactionPromise).rejects.toHaveProperty('innerError', axiosError);
    });
  });
});
