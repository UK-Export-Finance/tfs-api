import { HttpService } from '@nestjs/axios';
import { PROPERTIES } from '@ukef/constants';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { CreateFacilityActivationTransactionGenerator } from '@ukef-test/support/generator/create-facility-activation-transaction-generator';
import { CreateFacilityLoanGenerator } from '@ukef-test/support/generator/create-facility-loan-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { AxiosError } from 'axios';
import { when } from 'jest-when';
import { of, throwError } from 'rxjs';

import { AcbsBundleInformationService } from './acbs-bundle-information.service';
import { AcbsCreateBundleInformationRequestDto } from './dto/acbs-create-bundle-information-request.dto';
import { LoanAdvanceTransaction } from './dto/bundle-actions/loan-advance-transaction.bundle-action';
import { AcbsBadRequestException } from './exception/acbs-bad-request.exception';
import { AcbsResourceNotFoundException } from './exception/acbs-resource-not-found.exception';
import { AcbsUnexpectedException } from './exception/acbs-unexpected.exception';

describe('AcbsBundleInformationService', () => {
  const valueGenerator = new RandomValueGenerator();
  const idToken = valueGenerator.string();
  const baseUrl = valueGenerator.httpsUrl();
  const { servicingQueueIdentifier } = PROPERTIES.GLOBAL;
  const facilityIdentifier = valueGenerator.ukefId();
  const bundleIdentifier = valueGenerator.acbsBundleId();
  const borrowerPartyIdentifier = valueGenerator.acbsPartyId();
  const effectiveDate = valueGenerator.dateOnlyString();

  let httpService: HttpService;
  let service: AcbsBundleInformationService;

  let httpServicePost: jest.Mock;

  const { acbsRequestBodyToCreateFacilityActivationTransaction } = new CreateFacilityActivationTransactionGenerator(
    valueGenerator,
    new DateStringTransformations(),
  ).generate({
    numberToGenerate: 1,
    facilityIdentifier,
    bundleIdentifier,
    borrowerPartyIdentifier,
    effectiveDate,
  });

  const expectedHttpServicePostArgsWithBody = (body: AcbsCreateBundleInformationRequestDto) => [
    `/BundleInformation?servicingQueueIdentifier=${servicingQueueIdentifier}`,
    body,
    {
      baseURL: baseUrl,
      headers: { Authorization: `Bearer ${idToken}`, 'Content-Type': 'application/json' },
    },
  ];

  const expectedHttpServicePostArgs = expectedHttpServicePostArgsWithBody(acbsRequestBodyToCreateFacilityActivationTransaction);

  beforeEach(() => {
    httpService = new HttpService();

    httpServicePost = jest.fn();
    httpService.post = httpServicePost;

    service = new AcbsBundleInformationService({ baseUrl }, httpService);
  });

  describe('createBundleInformation', () => {
    it('sends a POST to ACBS with the specified parameters', async () => {
      when(httpServicePost)
        .calledWith(...expectedHttpServicePostArgs)
        .mockReturnValueOnce(
          of({
            data: '',
            status: 201,
            statusText: 'Created',
            config: undefined,
            headers: { bundleidentifier: bundleIdentifier },
          }),
        );

      const response = await service.createBundleInformation(acbsRequestBodyToCreateFacilityActivationTransaction, idToken);

      expect(httpServicePost).toHaveBeenCalledTimes(1);
      expect(httpServicePost).toHaveBeenCalledWith(...expectedHttpServicePostArgs);
      expect(response).toEqual({ BundleIdentifier: bundleIdentifier });
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

      when(httpServicePost)
        .calledWith(...expectedHttpServicePostArgs)
        .mockReturnValueOnce(throwError(() => axiosError));

      const createBundleInformationPromise = service.createBundleInformation(acbsRequestBodyToCreateFacilityActivationTransaction, idToken);

      await expect(createBundleInformationPromise).rejects.toBeInstanceOf(AcbsBadRequestException);
      await expect(createBundleInformationPromise).rejects.toThrow(`Failed to create a bundleInformation in ACBS.`);
      await expect(createBundleInformationPromise).rejects.toHaveProperty('innerError', axiosError);
      await expect(createBundleInformationPromise).rejects.toHaveProperty('errorBody', errorString);
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

      const createBundleInformationPromise = service.createBundleInformation(acbsRequestBodyToCreateFacilityActivationTransaction, idToken);

      await expect(createBundleInformationPromise).rejects.toBeInstanceOf(AcbsUnexpectedException);
      await expect(createBundleInformationPromise).rejects.toThrow(`Failed to create a bundleInformation in ACBS.`);
      await expect(createBundleInformationPromise).rejects.toHaveProperty('innerError', axiosError);
    });

    describe('creating a FacilityCodeValueTransaction', () => {
      it('throws an AcbsResourceNotFoundException if ACBS responds with a 400 error that is a string containing "Facility does not exist"', async () => {
        const axiosError = new AxiosError();
        axiosError.response = {
          data: `Facility does not exist or user does not have access to it: '${facilityIdentifier}'`,
          status: 400,
          statusText: 'Bad Request',
          headers: undefined,
          config: undefined,
        };

        when(httpServicePost)
          .calledWith(...expectedHttpServicePostArgs)
          .mockReturnValueOnce(throwError(() => axiosError));

        const createBundleInformationPromise = service.createBundleInformation(acbsRequestBodyToCreateFacilityActivationTransaction, idToken);

        await expect(createBundleInformationPromise).rejects.toBeInstanceOf(AcbsResourceNotFoundException);
        await expect(createBundleInformationPromise).rejects.toThrow(`Facility with identifier ${facilityIdentifier} was not found by ACBS.`);
        await expect(createBundleInformationPromise).rejects.toHaveProperty('innerError', axiosError);
      });

      it('throws an AcbsBadRequestException if ACBS responds with a 400 error that is a string that does not contain "Facility does not exist"', async () => {
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

        const createBundleInformationPromise = service.createBundleInformation(acbsRequestBodyToCreateFacilityActivationTransaction, idToken);

        await expect(createBundleInformationPromise).rejects.toBeInstanceOf(AcbsBadRequestException);
        await expect(createBundleInformationPromise).rejects.toThrow(`Failed to create a bundleInformation in ACBS.`);
        await expect(createBundleInformationPromise).rejects.toHaveProperty('innerError', axiosError);
        await expect(createBundleInformationPromise).rejects.toHaveProperty('errorBody', errorString);
      });

      it('throws an AcbsBadRequestException if ACBS responds with a 400 error that is not a string', async () => {
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

        const createBundleInformationPromise = service.createBundleInformation(acbsRequestBodyToCreateFacilityActivationTransaction, idToken);

        await expect(createBundleInformationPromise).rejects.toBeInstanceOf(AcbsBadRequestException);
        await expect(createBundleInformationPromise).rejects.toThrow(`Failed to create a bundleInformation in ACBS.`);
        await expect(createBundleInformationPromise).rejects.toHaveProperty('innerError', axiosError);
        await expect(createBundleInformationPromise).rejects.toHaveProperty('errorBody', JSON.stringify(errorBody));
      });
    });

    describe('creating a LoanAdvanceTransaction', () => {
      const loanIdentifier = valueGenerator.loanId();

      const loanAdvanceTransactionMessage: LoanAdvanceTransaction = {
        $type: 'LoanAdvanceTransaction',
        EffectiveDate: valueGenerator.dateTimeString(),
        LoanIdentifier: loanIdentifier,
        TransactionTypeCode: valueGenerator.string(),
        IsDraftIndicator: valueGenerator.boolean(),
        LoanAdvanceAmount: valueGenerator.nonnegativeInteger(),
        CashOffsetTypeCode: valueGenerator.string(),
      };
      const acbsRequestBodyToCreateLoanAdvanceTransaction: AcbsCreateBundleInformationRequestDto<LoanAdvanceTransaction> = {
        ...acbsRequestBodyToCreateFacilityActivationTransaction,
        BundleMessageList: [loanAdvanceTransactionMessage],
      };
      const expectedHttpServicePostArgsForLoanAdvanceTransaction = expectedHttpServicePostArgsWithBody(acbsRequestBodyToCreateLoanAdvanceTransaction);

      it('throws an AcbsResourceNotFoundException if ACBS responds with a 400 error that is a string containing "Loan does not exist"', async () => {
        const axiosError = new AxiosError();
        axiosError.response = {
          data: `Loan does not exist or user does not have access to it: '${loanIdentifier}'`,
          status: 400,
          statusText: 'Bad Request',
          headers: undefined,
          config: undefined,
        };

        when(httpServicePost)
          .calledWith(...expectedHttpServicePostArgsForLoanAdvanceTransaction)
          .mockReturnValueOnce(throwError(() => axiosError));

        const createBundleInformationPromise = service.createBundleInformation(acbsRequestBodyToCreateLoanAdvanceTransaction, idToken);

        await expect(createBundleInformationPromise).rejects.toBeInstanceOf(AcbsResourceNotFoundException);
        await expect(createBundleInformationPromise).rejects.toThrow(`Loan with identifier ${loanIdentifier} was not found by ACBS.`);
        await expect(createBundleInformationPromise).rejects.toHaveProperty('innerError', axiosError);
      });

      it('throws an AcbsBadRequestException if ACBS responds with a 400 error that is a string that does not contain "Loan does not exist"', async () => {
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
          .calledWith(...expectedHttpServicePostArgsForLoanAdvanceTransaction)
          .mockReturnValueOnce(throwError(() => axiosError));

        const createBundleInformationPromise = service.createBundleInformation(acbsRequestBodyToCreateLoanAdvanceTransaction, idToken);

        await expect(createBundleInformationPromise).rejects.toBeInstanceOf(AcbsBadRequestException);
        await expect(createBundleInformationPromise).rejects.toThrow(`Failed to create a bundleInformation in ACBS.`);
        await expect(createBundleInformationPromise).rejects.toHaveProperty('innerError', axiosError);
        await expect(createBundleInformationPromise).rejects.toHaveProperty('errorBody', errorString);
      });

      it('throws an AcbsBadRequestException if ACBS responds with a 400 error that is not a string', async () => {
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
          .calledWith(...expectedHttpServicePostArgsForLoanAdvanceTransaction)
          .mockReturnValueOnce(throwError(() => axiosError));

        const createBundleInformationPromise = service.createBundleInformation(acbsRequestBodyToCreateLoanAdvanceTransaction, idToken);

        await expect(createBundleInformationPromise).rejects.toBeInstanceOf(AcbsBadRequestException);
        await expect(createBundleInformationPromise).rejects.toThrow(`Failed to create a bundleInformation in ACBS.`);
        await expect(createBundleInformationPromise).rejects.toHaveProperty('innerError', axiosError);
        await expect(createBundleInformationPromise).rejects.toHaveProperty('errorBody', JSON.stringify(errorBody));
      });
    });

    describe('creating a NewLoanRequest', () => {
      const { acbsRequestBodyToCreateFacilityLoanGbp } = new CreateFacilityLoanGenerator(valueGenerator, new DateStringTransformations()).generate({
        numberToGenerate: 1,
        facilityIdentifier,
        bundleIdentifier,
      });
      const expectedHttpServicePostArgsForNewLoanRequest = expectedHttpServicePostArgsWithBody(acbsRequestBodyToCreateFacilityLoanGbp);

      it('throws an AcbsResourceNotFoundException if ACBS responds with a 400 error that is a string containing "Facility does not exist"', async () => {
        const axiosError = new AxiosError();
        axiosError.response = {
          data: `Facility does not exist or user does not have access to it: '${facilityIdentifier}'`,
          status: 400,
          statusText: 'Bad Request',
          headers: undefined,
          config: undefined,
        };

        when(httpServicePost)
          .calledWith(...expectedHttpServicePostArgsForNewLoanRequest)
          .mockReturnValueOnce(throwError(() => axiosError));

        const createBundleInformationPromise = service.createBundleInformation(acbsRequestBodyToCreateFacilityLoanGbp, idToken);

        await expect(createBundleInformationPromise).rejects.toBeInstanceOf(AcbsResourceNotFoundException);
        await expect(createBundleInformationPromise).rejects.toThrow(`Facility with identifier ${facilityIdentifier} was not found by ACBS.`);
        await expect(createBundleInformationPromise).rejects.toHaveProperty('innerError', axiosError);
      });

      it('throws an AcbsBadRequestException if ACBS responds with a 400 error that is a string that does not contain "Facility does not exist"', async () => {
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
          .calledWith(...expectedHttpServicePostArgsForNewLoanRequest)
          .mockReturnValueOnce(throwError(() => axiosError));

        const createBundleInformationPromise = service.createBundleInformation(acbsRequestBodyToCreateFacilityLoanGbp, idToken);

        await expect(createBundleInformationPromise).rejects.toBeInstanceOf(AcbsBadRequestException);
        await expect(createBundleInformationPromise).rejects.toThrow(`Failed to create a bundleInformation in ACBS.`);
        await expect(createBundleInformationPromise).rejects.toHaveProperty('innerError', axiosError);
        await expect(createBundleInformationPromise).rejects.toHaveProperty('errorBody', errorString);
      });

      it('throws an AcbsBadRequestException if ACBS responds with a 400 error that is not a string', async () => {
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
          .calledWith(...expectedHttpServicePostArgsForNewLoanRequest)
          .mockReturnValueOnce(throwError(() => axiosError));

        const createBundleInformationPromise = service.createBundleInformation(acbsRequestBodyToCreateFacilityLoanGbp, idToken);

        await expect(createBundleInformationPromise).rejects.toBeInstanceOf(AcbsBadRequestException);
        await expect(createBundleInformationPromise).rejects.toThrow(`Failed to create a bundleInformation in ACBS.`);
        await expect(createBundleInformationPromise).rejects.toHaveProperty('innerError', axiosError);
        await expect(createBundleInformationPromise).rejects.toHaveProperty('errorBody', JSON.stringify(errorBody));
      });
    });
  });
});
