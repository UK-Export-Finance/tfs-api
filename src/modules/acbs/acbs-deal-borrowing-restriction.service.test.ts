import { HttpService } from '@nestjs/axios';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { AxiosError } from 'axios';
import { when } from 'jest-when';
import { of, throwError } from 'rxjs';

import { AcbsDealBorrowingRestrictionService } from './acbs-deal-borrowing-restriction.service';
import { AcbsUpdateDealBorrowingRestrictionRequest } from './dto/acbs-update-deal-borrowing-restriction-request.dto';
import { AcbsBadRequestException } from './exception/acbs-bad-request.exception';
import { AcbsResourceNotFoundException } from './exception/acbs-resource-not-found.exception';
import { AcbsUnexpectedException } from './exception/acbs-unexpected.exception';

describe('AcbsDealBorrowingRestrictionService', () => {
  const valueGenerator = new RandomValueGenerator();
  const idToken = valueGenerator.string();
  const baseUrl = valueGenerator.httpsUrl();
  const dealIdentifier = valueGenerator.stringOfNumericCharacters();
  const portfolioIdentifier = valueGenerator.portfolioId();

  const newBorrowingRestriction: AcbsUpdateDealBorrowingRestrictionRequest = {
    SequenceNumber: valueGenerator.nonnegativeInteger(),
    RestrictGroupCategory: {
      RestrictGroupCategoryCode: valueGenerator.string(),
    },
    IncludingIndicator: valueGenerator.boolean(),
    IncludeExcludeAllItemsIndicator: valueGenerator.boolean(),
  };

  const expectedHttpServicePutArgs = [
    `/Portfolio/${portfolioIdentifier}/Deal/${dealIdentifier}/BorrowingRestriction`,
    newBorrowingRestriction,
    {
      baseURL: baseUrl,
      headers: { Authorization: `Bearer ${idToken}`, 'Content-Type': 'application/json' },
    },
  ];

  let httpService: HttpService;
  let service: AcbsDealBorrowingRestrictionService;

  let httpServicePut: jest.Mock;

  beforeEach(() => {
    httpService = new HttpService();

    httpServicePut = jest.fn();
    httpService.put = httpServicePut;

    service = new AcbsDealBorrowingRestrictionService({ baseUrl }, httpService);
  });

  describe('updateBorrowingRestrictionForDeal', () => {
    it('sends a PUT to ACBS with the specified parameters', async () => {
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

      await service.updateBorrowingRestrictionForDeal(portfolioIdentifier, dealIdentifier, newBorrowingRestriction, idToken);

      expect(httpServicePut).toHaveBeenCalledTimes(1);
      expect(httpServicePut).toHaveBeenCalledWith(...expectedHttpServicePutArgs);
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

      when(httpServicePut)
        .calledWith(...expectedHttpServicePutArgs)
        .mockReturnValueOnce(throwError(() => axiosError));

      const updateBorrowingRestrictionForDealPromise = service.updateBorrowingRestrictionForDeal(
        portfolioIdentifier,
        dealIdentifier,
        newBorrowingRestriction,
        idToken,
      );

      await expect(updateBorrowingRestrictionForDealPromise).rejects.toBeInstanceOf(AcbsResourceNotFoundException);
      await expect(updateBorrowingRestrictionForDealPromise).rejects.toThrow(`Deal with identifier ${dealIdentifier} was not found by ACBS.`);
      await expect(updateBorrowingRestrictionForDealPromise).rejects.toHaveProperty('innerError', axiosError);
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

      when(httpServicePut)
        .calledWith(...expectedHttpServicePutArgs)
        .mockReturnValueOnce(throwError(() => axiosError));

      const updateBorrowingRestrictionForDealPromise = service.updateBorrowingRestrictionForDeal(
        portfolioIdentifier,
        dealIdentifier,
        newBorrowingRestriction,
        idToken,
      );

      await expect(updateBorrowingRestrictionForDealPromise).rejects.toBeInstanceOf(AcbsBadRequestException);
      await expect(updateBorrowingRestrictionForDealPromise).rejects.toThrow(`Failed to update a borrowing restriction for deal ${dealIdentifier} in ACBS.`);
      await expect(updateBorrowingRestrictionForDealPromise).rejects.toHaveProperty('innerError', axiosError);
      await expect(updateBorrowingRestrictionForDealPromise).rejects.toHaveProperty('errorBody', errorString);
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

      const updateBorrowingRestrictionForDealPromise = service.updateBorrowingRestrictionForDeal(
        portfolioIdentifier,
        dealIdentifier,
        newBorrowingRestriction,
        idToken,
      );

      await expect(updateBorrowingRestrictionForDealPromise).rejects.toBeInstanceOf(AcbsBadRequestException);
      await expect(updateBorrowingRestrictionForDealPromise).rejects.toThrow(`Failed to update a borrowing restriction for deal ${dealIdentifier} in ACBS.`);
      await expect(updateBorrowingRestrictionForDealPromise).rejects.toHaveProperty('innerError', axiosError);
      await expect(updateBorrowingRestrictionForDealPromise).rejects.toHaveProperty('errorBody', JSON.stringify(errorBody));
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

      const updateBorrowingRestrictionForDealPromise = service.updateBorrowingRestrictionForDeal(
        portfolioIdentifier,
        dealIdentifier,
        newBorrowingRestriction,
        idToken,
      );

      await expect(updateBorrowingRestrictionForDealPromise).rejects.toBeInstanceOf(AcbsUnexpectedException);
      await expect(updateBorrowingRestrictionForDealPromise).rejects.toThrow(`Failed to update a borrowing restriction for deal ${dealIdentifier} in ACBS.`);
      await expect(updateBorrowingRestrictionForDealPromise).rejects.toHaveProperty('innerError', axiosError);
    });
  });
});
