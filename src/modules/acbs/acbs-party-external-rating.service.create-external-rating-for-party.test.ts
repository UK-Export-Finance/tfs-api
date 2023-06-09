import { HttpService } from '@nestjs/axios';
import { CreatePartyExternalRatingGenerator } from '@ukef-test/support/generator/create-party-external-rating-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { AxiosError } from 'axios';
import { when } from 'jest-when';
import { of, throwError } from 'rxjs';

import { DateStringTransformations } from '../date/date-string.transformations';
import { AcbsPartyExternalRatingService } from './acbs-party-external-rating.service';
import { AcbsBadRequestException } from './exception/acbs-bad-request.exception';
import { AcbsResourceNotFoundException } from './exception/acbs-resource-not-found.exception';
import { AcbsUnexpectedException } from './exception/acbs-unexpected.exception';

describe('AcbsPartyExternalRatingService', () => {
  const valueGenerator = new RandomValueGenerator();
  const dateStringTransformations = new DateStringTransformations();
  const idToken = valueGenerator.string();
  const baseUrl = valueGenerator.httpsUrl();
  const useReturnExceptionHeader = false;

  let httpService: HttpService;
  let service: AcbsPartyExternalRatingService;

  let httpServicePost: jest.Mock;

  const partyIdentifier = valueGenerator.acbsPartyId();

  const { acbsExternalRatingToCreate } = new CreatePartyExternalRatingGenerator(valueGenerator, dateStringTransformations).generate({
    numberToGenerate: 1,
    partyIdentifier,
  });

  const expectedHttpServicePostArgs = [
    `/Party/${partyIdentifier}/PartyExternalRating`,
    acbsExternalRatingToCreate,
    {
      baseURL: baseUrl,
      headers: { Authorization: `Bearer ${idToken}`, 'Content-Type': 'application/json' },
    },
  ];

  beforeEach(() => {
    httpService = new HttpService();

    httpServicePost = jest.fn();
    httpService.post = httpServicePost;

    service = new AcbsPartyExternalRatingService({ baseUrl, useReturnExceptionHeader }, httpService);
  });

  describe('createExternalRatingForParty', () => {
    it('sends a POST to ACBS to create a party external rating with the specified parameters', async () => {
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

      await service.createExternalRatingForParty(acbsExternalRatingToCreate, idToken);

      expect(httpServicePost).toHaveBeenCalledTimes(1);
      expect(httpServicePost).toHaveBeenCalledWith(...expectedHttpServicePostArgs);
    });

    it('throws an AcbsResourceNotFoundException if ACBS responds with a 400 that is a string containing "partyIdentifier is not valid"', async () => {
      const axiosError = new AxiosError();
      const errorString = 'partyIdentifier is not valid';
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

      const createExternalRatingPromise = service.createExternalRatingForParty(acbsExternalRatingToCreate, idToken);

      await expect(createExternalRatingPromise).rejects.toBeInstanceOf(AcbsResourceNotFoundException);
      await expect(createExternalRatingPromise).rejects.toThrow(`Party with identifier ${partyIdentifier} was not found by ACBS.`);
      await expect(createExternalRatingPromise).rejects.toHaveProperty('innerError', axiosError);
    });

    it('throws an AcbsBadRequestException if ACBS responds with a 400 that is a string that does not contain "partyIdentifier is not valid"', async () => {
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

      const createExternalRatingPromise = service.createExternalRatingForParty(acbsExternalRatingToCreate, idToken);

      await expect(createExternalRatingPromise).rejects.toBeInstanceOf(AcbsBadRequestException);
      await expect(createExternalRatingPromise).rejects.toThrow(`Failed to create party external rating in ACBS.`);
      await expect(createExternalRatingPromise).rejects.toHaveProperty('innerError', axiosError);
      await expect(createExternalRatingPromise).rejects.toHaveProperty('errorBody', errorString);
    });

    it('throws an AcbsBadRequestException if ACBS responds with a 400 that is a not string', async () => {
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

      const createExternalRatingPromise = service.createExternalRatingForParty(acbsExternalRatingToCreate, idToken);

      await expect(createExternalRatingPromise).rejects.toBeInstanceOf(AcbsBadRequestException);
      await expect(createExternalRatingPromise).rejects.toThrow(`Failed to create party external rating in ACBS.`);
      await expect(createExternalRatingPromise).rejects.toHaveProperty('innerError', axiosError);
      await expect(createExternalRatingPromise).rejects.toHaveProperty('errorBody', JSON.stringify(errorBody));
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

      const createExternalRatingPromise = service.createExternalRatingForParty(acbsExternalRatingToCreate, idToken);

      await expect(createExternalRatingPromise).rejects.toBeInstanceOf(AcbsUnexpectedException);
      await expect(createExternalRatingPromise).rejects.toThrow(`Failed to create party external rating in ACBS.`);
      await expect(createExternalRatingPromise).rejects.toHaveProperty('innerError', axiosError);
    });
  });
});
