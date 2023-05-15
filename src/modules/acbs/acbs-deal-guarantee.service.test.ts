import { HttpService } from '@nestjs/axios';
import { PROPERTIES } from '@ukef/constants';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { generateAcbsCreateDealGuaranteeDtoUsing } from '@ukef-test/support/requests/acbs-create-deal-guarantee-dto';
import { AxiosError } from 'axios';
import { when } from 'jest-when';
import { of, throwError } from 'rxjs';

import { AcbsDealGuaranteeService } from './acbs-deal-guarantee.service';
import { AcbsBadRequestException } from './exception/acbs-bad-request.exception';
import { AcbsResourceNotFoundException } from './exception/acbs-resource-not-found.exception';
import { AcbsUnexpectedException } from './exception/acbs-unexpected.exception';

describe('AcbsDealGuaranteeService', () => {
  const valueGenerator = new RandomValueGenerator();
  const authToken = valueGenerator.string();
  const baseUrl = valueGenerator.httpsUrl();
  const dealIdentifier = valueGenerator.stringOfNumericCharacters();
  const { portfolioIdentifier } = PROPERTIES.GLOBAL;

  let httpService: HttpService;
  let service: AcbsDealGuaranteeService;

  let httpServicePost: jest.Mock;

  beforeEach(() => {
    httpService = new HttpService();

    httpServicePost = jest.fn();
    httpService.post = httpServicePost;

    service = new AcbsDealGuaranteeService({ baseUrl }, httpService);
  });

  describe('createGuaranteeForDeal', () => {
    const newDealGuarantee = generateAcbsCreateDealGuaranteeDtoUsing(valueGenerator);

    it('sends a POST to ACBS with the specified parameters', async () => {
      when(httpServicePost)
        .calledWith(`/Portfolio/${portfolioIdentifier}/Deal/${dealIdentifier}/DealGuarantee`, newDealGuarantee, {
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

      await service.createGuaranteeForDeal(dealIdentifier, newDealGuarantee, authToken);

      expect(httpServicePost).toHaveBeenCalledTimes(1);
      expect(httpServicePost).toHaveBeenCalledWith(`/Portfolio/${portfolioIdentifier}/Deal/${dealIdentifier}/DealGuarantee`, newDealGuarantee, {
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
        .calledWith(`/Portfolio/${portfolioIdentifier}/Deal/${dealIdentifier}/DealGuarantee`, newDealGuarantee, {
          baseURL: baseUrl,
          headers: { Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json' },
        })
        .mockReturnValueOnce(throwError(() => axiosError));

      const createGuaranteeForDealPromise = service.createGuaranteeForDeal(dealIdentifier, newDealGuarantee, authToken);

      await expect(createGuaranteeForDealPromise).rejects.toBeInstanceOf(AcbsResourceNotFoundException);
      await expect(createGuaranteeForDealPromise).rejects.toThrow(`Deal with identifier ${dealIdentifier} was not found by ACBS.`);
      await expect(createGuaranteeForDealPromise).rejects.toHaveProperty('innerError', axiosError);
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
        .calledWith(`/Portfolio/${portfolioIdentifier}/Deal/${dealIdentifier}/DealGuarantee`, newDealGuarantee, {
          baseURL: baseUrl,
          headers: { Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json' },
        })
        .mockReturnValueOnce(throwError(() => axiosError));

      const createGuaranteeForDealPromise = service.createGuaranteeForDeal(dealIdentifier, newDealGuarantee, authToken);

      await expect(createGuaranteeForDealPromise).rejects.toBeInstanceOf(AcbsBadRequestException);
      await expect(createGuaranteeForDealPromise).rejects.toThrow(`Failed to create a guarantee for deal ${dealIdentifier} in ACBS.`);
      await expect(createGuaranteeForDealPromise).rejects.toHaveProperty('innerError', axiosError);
      await expect(createGuaranteeForDealPromise).rejects.toHaveProperty('errorBody', errorString);
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
        .calledWith(`/Portfolio/${portfolioIdentifier}/Deal/${dealIdentifier}/DealGuarantee`, newDealGuarantee, {
          baseURL: baseUrl,
          headers: { Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json' },
        })
        .mockReturnValueOnce(throwError(() => axiosError));

      const createGuaranteeForDealPromise = service.createGuaranteeForDeal(dealIdentifier, newDealGuarantee, authToken);

      await expect(createGuaranteeForDealPromise).rejects.toBeInstanceOf(AcbsBadRequestException);
      await expect(createGuaranteeForDealPromise).rejects.toThrow(`Failed to create a guarantee for deal ${dealIdentifier} in ACBS.`);
      await expect(createGuaranteeForDealPromise).rejects.toHaveProperty('innerError', axiosError);
      await expect(createGuaranteeForDealPromise).rejects.toHaveProperty('errorBody', JSON.stringify(errorBody));
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
        .calledWith(`/Portfolio/${portfolioIdentifier}/Deal/${dealIdentifier}/DealGuarantee`, newDealGuarantee, {
          baseURL: baseUrl,
          headers: { Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json' },
        })
        .mockReturnValueOnce(throwError(() => axiosError));

      const createGuaranteeForDealPromise = service.createGuaranteeForDeal(dealIdentifier, newDealGuarantee, authToken);

      await expect(createGuaranteeForDealPromise).rejects.toBeInstanceOf(AcbsUnexpectedException);
      await expect(createGuaranteeForDealPromise).rejects.toThrow(`Failed to create a guarantee for deal ${dealIdentifier} in ACBS.`);
      await expect(createGuaranteeForDealPromise).rejects.toHaveProperty('innerError', axiosError);
    });
  });
});
