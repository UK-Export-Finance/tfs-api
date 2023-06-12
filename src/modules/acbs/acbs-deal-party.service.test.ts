import { HttpService } from '@nestjs/axios';
import { PROPERTIES } from '@ukef/constants';
import { UkefId } from '@ukef/helpers';
import { CurrentDateProvider } from '@ukef/modules/date/current-date.provider';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { CreateDealInvestorGenerator } from '@ukef-test/support/generator/create-deal-investor-generator';
import { GetDealInvestorGenerator } from '@ukef-test/support/generator/get-deal-investor-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { AxiosError } from 'axios';
import { when } from 'jest-when';
import { of, throwError } from 'rxjs';

import { AcbsDealPartyService } from './acbs-deal-party.service';
import { AcbsException } from './exception/acbs.exception';
import { AcbsBadRequestException } from './exception/acbs-bad-request.exception';
import { AcbsResourceNotFoundException } from './exception/acbs-resource-not-found.exception';
import { AcbsUnexpectedException } from './exception/acbs-unexpected.exception';

describe('AcbsDealPartyService', () => {
  const valueGenerator = new RandomValueGenerator();
  const authToken = valueGenerator.string();
  const baseUrl = valueGenerator.string();
  const useReturnExceptionHeader = false;

  let httpService: HttpService;
  let service: AcbsDealPartyService;

  let httpServiceGet: jest.Mock;
  let httpServicePost: jest.Mock;

  beforeEach(() => {
    httpService = new HttpService();

    httpServiceGet = jest.fn();
    httpService.get = httpServiceGet;
    httpServicePost = jest.fn();
    httpService.post = httpServicePost;

    service = new AcbsDealPartyService({ baseUrl, useReturnExceptionHeader }, httpService);
  });

  describe('getDealPartyForDeal', () => {
    const dealIdentifier = valueGenerator.ukefId();
    const portfolioIdentifier = valueGenerator.portfolioId();
    const acbsDealPartyURL = `/Portfolio/${portfolioIdentifier}/Deal/${dealIdentifier}/DealParty`;

    it('throws an AcbsException if the request to ACBS fails', async () => {
      const getDealPartyForDealError = new AxiosError();
      when(httpServiceGet)
        .calledWith(`/Portfolio/${portfolioIdentifier}/Deal/${dealIdentifier}/DealParty`, {
          baseURL: baseUrl,
          headers: { Authorization: `Bearer ${authToken}` },
        })
        .mockReturnValueOnce(throwError(() => getDealPartyForDealError));

      const getDealPartyPromise = service.getDealPartiesForDeal(portfolioIdentifier, dealIdentifier, authToken);

      await expect(getDealPartyPromise).rejects.toBeInstanceOf(AcbsException);
      await expect(getDealPartyPromise).rejects.toThrow(`Failed to get the deal investors for the deal with id ${dealIdentifier}.`);
      await expect(getDealPartyPromise).rejects.toHaveProperty('innerError', getDealPartyForDealError);
    });

    it('returns an empty array if ACBS responds with an empty array', async () => {
      when(httpServiceGet)
        .calledWith(acbsDealPartyURL, {
          baseURL: baseUrl,
          headers: { Authorization: `Bearer ${authToken}` },
        })
        .mockReturnValueOnce(
          of({
            data: [],
            status: 200,
            statusText: 'OK',
            config: undefined,
            headers: undefined,
          }),
        );

      const dealInvestors = await service.getDealPartiesForDeal(portfolioIdentifier, dealIdentifier, authToken);

      expect(dealInvestors).toStrictEqual([]);
    });

    it(`throws an AcbsResourceNotFoundException if ACBS responds with a 200 response where the response body is 'null'`, async () => {
      when(httpServiceGet)
        .calledWith(acbsDealPartyURL, {
          baseURL: baseUrl,
          headers: { Authorization: `Bearer ${authToken}` },
        })
        .mockReturnValueOnce(
          of({
            data: null,
            status: 200,
            statusText: 'OK',
            config: undefined,
            headers: undefined,
          }),
        );

      const getDealPartiesPromise = service.getDealPartiesForDeal(portfolioIdentifier, dealIdentifier, authToken);

      await expect(getDealPartiesPromise).rejects.toBeInstanceOf(AcbsResourceNotFoundException);
      await expect(getDealPartiesPromise).rejects.toThrow(`Deal Investors for Deal ${dealIdentifier} were not found by ACBS.`);
    });

    it('returns the deal investors for the deal if ACBS responds with same data', async () => {
      const { dealInvestorsInAcbs } = new GetDealInvestorGenerator(valueGenerator).generate({ portfolioIdentifier, dealIdentifier, numberToGenerate: 2 });

      when(httpServiceGet)
        .calledWith(acbsDealPartyURL, {
          baseURL: baseUrl,
          headers: { Authorization: `Bearer ${authToken}` },
        })
        .mockReturnValueOnce(
          of({
            data: dealInvestorsInAcbs,
            status: 200,
            statusText: 'OK',
            config: undefined,
            headers: undefined,
          }),
        );

      const dealInvestors = await service.getDealPartiesForDeal(portfolioIdentifier, dealIdentifier, authToken);

      expect(dealInvestors).toStrictEqual(dealInvestorsInAcbs);
    });
  });

  describe('createInvestorForDeal', () => {
    const currentDateProvider = new CurrentDateProvider();
    const dateStringTransformations = new DateStringTransformations();

    const dealIdentifier: UkefId = valueGenerator.ukefId();
    const { portfolioIdentifier } = PROPERTIES.GLOBAL;

    const { acbsRequestBodyToCreateDealInvestor } = new CreateDealInvestorGenerator(valueGenerator, currentDateProvider, dateStringTransformations).generate({
      numberToGenerate: 1,
      dealIdentifier: dealIdentifier,
    });

    it('sends a POST to ACBS with the specified parameters', async () => {
      when(httpServicePost)
        .calledWith(`/Portfolio/${portfolioIdentifier}/Deal/${dealIdentifier}/DealParty`, acbsRequestBodyToCreateDealInvestor, {
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

      await service.createInvestorForDeal(dealIdentifier, acbsRequestBodyToCreateDealInvestor, authToken);

      expect(httpServicePost).toHaveBeenCalledTimes(1);
      expect(httpServicePost).toHaveBeenCalledWith(`/Portfolio/${portfolioIdentifier}/Deal/${dealIdentifier}/DealParty`, acbsRequestBodyToCreateDealInvestor, {
        baseURL: baseUrl,
        headers: { Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json' },
      });
    });

    it('throws an AcbsResourceNotFoundException if ACBS responds with a 400 that is a string containing "The deal not found"', async () => {
      const axiosError = new AxiosError();
      const errorString = 'The deal not found or the user does not have access to it.';
      axiosError.response = {
        data: errorString,
        status: 400,
        statusText: 'Bad Request',
        headers: undefined,
        config: undefined,
      };

      when(httpServicePost)
        .calledWith(`/Portfolio/${portfolioIdentifier}/Deal/${dealIdentifier}/DealParty`, acbsRequestBodyToCreateDealInvestor, {
          baseURL: baseUrl,
          headers: { Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json' },
        })
        .mockReturnValueOnce(throwError(() => axiosError));

      const createInvestorForDealPromise = service.createInvestorForDeal(dealIdentifier, acbsRequestBodyToCreateDealInvestor, authToken);

      await expect(createInvestorForDealPromise).rejects.toBeInstanceOf(AcbsResourceNotFoundException);
      await expect(createInvestorForDealPromise).rejects.toThrow(`Deal with identifier ${dealIdentifier} was not found by ACBS.`);
      await expect(createInvestorForDealPromise).rejects.toHaveProperty('innerError', axiosError);
    });

    it('throws an AcbsBadRequestException if ACBS responds with a 400 that is a string that does not contain "The deal not found"', async () => {
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
        .calledWith(`/Portfolio/${portfolioIdentifier}/Deal/${dealIdentifier}/DealParty`, acbsRequestBodyToCreateDealInvestor, {
          baseURL: baseUrl,
          headers: { Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json' },
        })
        .mockReturnValueOnce(throwError(() => axiosError));

      const createInvestorForDealPromise = service.createInvestorForDeal(dealIdentifier, acbsRequestBodyToCreateDealInvestor, authToken);

      await expect(createInvestorForDealPromise).rejects.toBeInstanceOf(AcbsBadRequestException);
      await expect(createInvestorForDealPromise).rejects.toThrow(`Failed to create an investor for deal ${dealIdentifier} in ACBS.`);
      await expect(createInvestorForDealPromise).rejects.toHaveProperty('innerError', axiosError);
      await expect(createInvestorForDealPromise).rejects.toHaveProperty('errorBody', errorString);
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
        .calledWith(`/Portfolio/${portfolioIdentifier}/Deal/${dealIdentifier}/DealParty`, acbsRequestBodyToCreateDealInvestor, {
          baseURL: baseUrl,
          headers: { Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json' },
        })
        .mockReturnValueOnce(throwError(() => axiosError));

      const createInvestorForDealPromise = service.createInvestorForDeal(dealIdentifier, acbsRequestBodyToCreateDealInvestor, authToken);

      await expect(createInvestorForDealPromise).rejects.toBeInstanceOf(AcbsBadRequestException);
      await expect(createInvestorForDealPromise).rejects.toThrow(`Failed to create an investor for deal ${dealIdentifier} in ACBS.`);
      await expect(createInvestorForDealPromise).rejects.toHaveProperty('innerError', axiosError);
      await expect(createInvestorForDealPromise).rejects.toHaveProperty('errorBody', JSON.stringify(errorBody));
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
        .calledWith(`/Portfolio/${portfolioIdentifier}/Deal/${dealIdentifier}/DealParty`, acbsRequestBodyToCreateDealInvestor, {
          baseURL: baseUrl,
          headers: { Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json' },
        })
        .mockReturnValueOnce(throwError(() => axiosError));

      const createInvestorForDealPromise = service.createInvestorForDeal(dealIdentifier, acbsRequestBodyToCreateDealInvestor, authToken);

      await expect(createInvestorForDealPromise).rejects.toBeInstanceOf(AcbsUnexpectedException);
      await expect(createInvestorForDealPromise).rejects.toThrow(`Failed to create an investor for deal ${dealIdentifier} in ACBS.`);
      await expect(createInvestorForDealPromise).rejects.toHaveProperty('innerError', axiosError);
    });
  });
});
