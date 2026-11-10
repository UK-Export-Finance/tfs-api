import { HttpService } from '@nestjs/axios';
import { AxiosError } from 'axios';
import { when } from 'jest-when';
import { PinoLogger } from 'nestjs-pino';
import { of, throwError } from 'rxjs';
import { generateAcbsCreateDealDtoUsing } from '@ukef-test/support/requests/acbs-create-deal-dto';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';

import { AcbsDealService } from './acbs-deal.service';
import { AcbsBadRequestException } from './exception/acbs-bad-request.exception';
import { AcbsException } from './exception/acbs.exception';

describe('AcbsDealService', () => {
  const valueGenerator = new RandomValueGenerator();
  const idToken = valueGenerator.string();
  const baseUrl = valueGenerator.httpsUrl();
  const useReturnExceptionHeader = false;
  const randomPortfolioIdentifier = valueGenerator.string({ length: 2 });
  const dealIdentifier = valueGenerator.stringOfNumericCharacters({ length: 10 });

  let httpService: HttpService;
  let service: AcbsDealService;

  let httpServicePost: jest.Mock;

  const newDeal = generateAcbsCreateDealDtoUsing(valueGenerator, { dealIdentifier });
  const expectedHttpServicePostArgs = [
    `/Portfolio/${randomPortfolioIdentifier}/Deal`,
    newDeal,
    {
      baseURL: baseUrl,
      headers: { Authorization: `Bearer ${idToken}`, 'Content-Type': 'application/json' },
    },
  ];

  beforeEach(() => {
    httpService = new HttpService();

    httpServicePost = jest.fn();
    httpService.post = httpServicePost;

    const logger = new PinoLogger({});
    logger.info = jest.fn();
    logger.error = jest.fn();

    service = new AcbsDealService({ baseUrl, useReturnExceptionHeader }, httpService, logger);
  });

  describe('createDeal', () => {
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

      await service.createDeal(randomPortfolioIdentifier, newDeal, idToken);

      expect(httpServicePost).toHaveBeenCalledTimes(1);
      expect(httpServicePost).toHaveBeenCalledWith(...expectedHttpServicePostArgs);
    });

    it('throws an AcbsBadRequestException if ACBS responds with a 400 error', async () => {
      const axiosError = new AxiosError();
      const errorString = valueGenerator.string();
      axiosError.response = {
        data: errorString,
        status: 400,
        statusText: 'Bad Request',
        headers: undefined!,
        config: undefined!,
      };

      when(httpServicePost)
        .calledWith(...expectedHttpServicePostArgs)
        .mockReturnValueOnce(throwError(() => axiosError));

      const createDealPromise = service.createDeal(randomPortfolioIdentifier, newDeal, idToken);

      await expect(createDealPromise).rejects.toBeInstanceOf(AcbsBadRequestException);
      await expect(createDealPromise).rejects.toThrow(`Failed to create a deal with identifier ${dealIdentifier} in ACBS.`);
      await expect(createDealPromise).rejects.toHaveProperty('innerError', axiosError);
      await expect(createDealPromise).rejects.toHaveProperty('errorBody', errorString);
    });

    it('throws an AcbsBadRequestException with a known error message if ACBS responds with a 400 error for a deal that already exists', async () => {
      const axiosError = new AxiosError();
      axiosError.response = {
        data: 'Deal exists',
        status: 400,
        statusText: 'Bad Request',
        headers: undefined!,
        config: undefined!,
      };

      when(httpServicePost)
        .calledWith(...expectedHttpServicePostArgs)
        .mockReturnValueOnce(throwError(() => axiosError));

      const createDealPromise = service.createDeal(randomPortfolioIdentifier, newDeal, idToken);

      await expect(createDealPromise).rejects.toBeInstanceOf(AcbsBadRequestException);
      await expect(createDealPromise).rejects.toThrow('Bad request');
      await expect(createDealPromise).rejects.toHaveProperty('innerError', axiosError);
      await expect(createDealPromise).rejects.toHaveProperty('errorBody', `Deal with identifier ${dealIdentifier} already exists in ACBS.`);
    });

    it('throws an AcbsBadRequestException with a known error message if ACBS responds with a duck-typed axios-like error that is not an instance of AxiosError (e.g. constructed by a different copy of the axios module, such as the ESM build used internally by @nestjs/axios)', async () => {
      const duckTypedAxiosError = {
        isAxiosError: true,
        response: {
          data: 'Deal exists',
          status: 400,
          statusText: 'Bad Request',
          headers: undefined,
          config: undefined,
        },
      };

      when(httpServicePost)
        .calledWith(...expectedHttpServicePostArgs)
        .mockReturnValueOnce(throwError(() => duckTypedAxiosError));

      const createDealPromise = service.createDeal(randomPortfolioIdentifier, newDeal, idToken);

      await expect(createDealPromise).rejects.toBeInstanceOf(AcbsBadRequestException);
      await expect(createDealPromise).rejects.toThrow('Bad request');
      await expect(createDealPromise).rejects.toHaveProperty('innerError', duckTypedAxiosError);
      await expect(createDealPromise).rejects.toHaveProperty('errorBody', `Deal with identifier ${dealIdentifier} already exists in ACBS.`);
    });

    it('throws an AcbsException if ACBS responds with an error code that is not 400', async () => {
      const axiosError = new AxiosError();
      const errorBody = { errorMessage: valueGenerator.string() };
      axiosError.response = {
        data: errorBody,
        status: 401,
        statusText: 'Unauthorized',
        headers: undefined!,
        config: undefined!,
      };

      when(httpServicePost)
        .calledWith(...expectedHttpServicePostArgs)
        .mockReturnValueOnce(throwError(() => axiosError));

      const createDealPromise = service.createDeal(randomPortfolioIdentifier, newDeal, idToken);

      await expect(createDealPromise).rejects.toBeInstanceOf(AcbsException);
      await expect(createDealPromise).rejects.toThrow(`Failed to create a deal with identifier ${dealIdentifier} in ACBS.`);
      await expect(createDealPromise).rejects.toHaveProperty('innerError', axiosError);
    });
  });
});
