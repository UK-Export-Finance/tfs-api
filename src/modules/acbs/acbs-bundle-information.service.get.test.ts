import { HttpService } from '@nestjs/axios';
import { GetFacilityActivationTransactionGenerator } from '@ukef-test/support/generator/get-facility-activation-transaction-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { AxiosError } from 'axios';
import { when } from 'jest-when';
import { of, throwError } from 'rxjs';

import { DateStringTransformations } from '../date/date-string.transformations';
import { AcbsBundleInformationService } from './acbs-bundle-information.service';
import { AcbsException } from './exception/acbs.exception';
import { AcbsResourceNotFoundException } from './exception/acbs-resource-not-found.exception';

describe('AcbsBundleInformationService', () => {
  const valueGenerator = new RandomValueGenerator();
  const dateStringTransformations = new DateStringTransformations();
  const idToken = valueGenerator.string();
  const baseUrl = valueGenerator.httpsUrl();

  let httpService: HttpService;
  let service: AcbsBundleInformationService;

  let httpServiceGet: jest.Mock;

  beforeEach(() => {
    httpService = new HttpService();

    httpServiceGet = jest.fn();
    httpService.get = httpServiceGet;

    service = new AcbsBundleInformationService({ baseUrl }, httpService);
  });

  describe('getBundleInformationByIdentifier', () => {
    const facilityIdentifier = valueGenerator.ukefId();
    const bundleIdentifier = valueGenerator.acbsBundleId();

    it('returns the bundle information if ACBS responds with the bundle information', async () => {
      const { acbsFacilityActivationTransaction: expectedBundleInformation } = new GetFacilityActivationTransactionGenerator(
        valueGenerator,
        dateStringTransformations,
      ).generate({
        numberToGenerate: 1,
        facilityIdentifier,
      });

      when(httpServiceGet)
        .calledWith(`/BundleInformation/${bundleIdentifier}?returnItems=true`, {
          baseURL: baseUrl,
          headers: { Authorization: `Bearer ${idToken}` },
        })
        .mockReturnValueOnce(
          of({
            data: expectedBundleInformation,
            status: 200,
            statusText: 'OK',
            config: undefined,
            headers: undefined,
          }),
        );

      const bundleInformation = await service.getBundleInformationByIdentifier(bundleIdentifier, idToken);

      expect(bundleInformation).toStrictEqual(expectedBundleInformation);
    });

    it('throws an AcbsException if the request to ACBS fails', async () => {
      const getBundleInformationByIdentifierError = new AxiosError();
      when(httpServiceGet)
        .calledWith(`/BundleInformation/${bundleIdentifier}?returnItems=true`, {
          baseURL: baseUrl,
          headers: { Authorization: `Bearer ${idToken}` },
        })
        .mockReturnValueOnce(throwError(() => getBundleInformationByIdentifierError));

      const getLoanTransactionPromise = service.getBundleInformationByIdentifier(bundleIdentifier, idToken);

      await expect(getLoanTransactionPromise).rejects.toBeInstanceOf(AcbsException);
      await expect(getLoanTransactionPromise).rejects.toThrow(`Failed to get the bundle information with bundle identifier ${bundleIdentifier}.`);
      await expect(getLoanTransactionPromise).rejects.toHaveProperty('innerError', getBundleInformationByIdentifierError);
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

      const getLoanTransactionPromise = service.getBundleInformationByIdentifier(bundleIdentifier, idToken);

      await expect(getLoanTransactionPromise).rejects.toBeInstanceOf(AcbsResourceNotFoundException);
      await expect(getLoanTransactionPromise).rejects.toThrow(`Bundle information with bundle identifier ${bundleIdentifier} was not found by ACBS.`);
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

      const getLoanTransactionPromise = service.getBundleInformationByIdentifier(bundleIdentifier, idToken);

      await expect(getLoanTransactionPromise).rejects.toBeInstanceOf(AcbsException);
      await expect(getLoanTransactionPromise).rejects.toThrow(`Failed to get the bundle information with bundle identifier ${bundleIdentifier}.`);
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

      const getLoanTransactionPromise = service.getBundleInformationByIdentifier(bundleIdentifier, idToken);

      await expect(getLoanTransactionPromise).rejects.toBeInstanceOf(AcbsException);
      await expect(getLoanTransactionPromise).rejects.toThrow(`Failed to get the bundle information with bundle identifier ${bundleIdentifier}.`);
      await expect(getLoanTransactionPromise).rejects.toHaveProperty('innerError', axiosError);
    });
  });
});
