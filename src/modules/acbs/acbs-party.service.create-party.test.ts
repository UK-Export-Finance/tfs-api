import { HttpService } from '@nestjs/axios';
import { CreatePartyGenerator } from '@ukef-test/support/generator/create-party-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { AxiosError } from 'axios';
import { when } from 'jest-when';
import { of, throwError } from 'rxjs';

import { DateStringTransformations } from '../date/date-string.transformations';
import { AcbsPartyService } from './acbs-party.service';
import { AcbsBadRequestException } from './exception/acbs-bad-request.exception';
import { AcbsUnexpectedException } from './exception/acbs-unexpected.exception';

describe('AcbsPartyService', () => {
  const valueGenerator = new RandomValueGenerator();
  const dateStringTransformations = new DateStringTransformations();
  const idToken = valueGenerator.string();
  const baseUrl = valueGenerator.httpsUrl();
  const useReturnExceptionHeader = false;

  let httpService: HttpService;
  let service: AcbsPartyService;

  let httpServicePost: jest.Mock;

  const { acbsCreatePartyRequest: newParty } = new CreatePartyGenerator(valueGenerator, dateStringTransformations).generate({
    numberToGenerate: 1,
  });

  const expectedHttpServicePostArgs = [
    `/Party`,
    newParty,
    {
      baseURL: baseUrl,
      headers: { Authorization: `Bearer ${idToken}`, 'Content-Type': 'application/json' },
    },
  ];

  beforeEach(() => {
    httpService = new HttpService();

    httpServicePost = jest.fn();
    httpService.post = httpServicePost;

    service = new AcbsPartyService({ baseUrl, useReturnExceptionHeader }, httpService);
  });

  describe('createParty', () => {
    it('sends a POST to ACBS to create a party with the specified parameters', async () => {
      when(httpServicePost)
        .calledWith(...expectedHttpServicePostArgs)
        .mockReturnValueOnce(
          of({
            data: '',
            status: 201,
            statusText: 'Created',
            config: undefined,
            headers: {
              location: `/Party/00000000`,
            },
          }),
        );

      await service.createParty(newParty, idToken);

      expect(httpServicePost).toHaveBeenCalledTimes(1);
      expect(httpServicePost).toHaveBeenCalledWith(...expectedHttpServicePostArgs);
    });

    it('returns the identifier of the new party if the request is successful', async () => {
      when(httpServicePost)
        .calledWith(...expectedHttpServicePostArgs)
        .mockReturnValueOnce(
          of({
            data: '',
            status: 201,
            statusText: 'Created',
            config: undefined,
            headers: {
              location: `/Party/00000000`,
            },
          }),
        );

      const response = await service.createParty(newParty, idToken);

      expect(response).toStrictEqual({
        partyIdentifier: '00000000',
      });
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

      const createPartyPromise = service.createParty(newParty, idToken);

      await expect(createPartyPromise).rejects.toBeInstanceOf(AcbsBadRequestException);
      await expect(createPartyPromise).rejects.toThrow(`Failed to create party in ACBS.`);
      await expect(createPartyPromise).rejects.toHaveProperty('innerError', axiosError);
      await expect(createPartyPromise).rejects.toHaveProperty('errorBody', errorString);
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

      const createPartyPromise = service.createParty(newParty, idToken);

      await expect(createPartyPromise).rejects.toBeInstanceOf(AcbsUnexpectedException);
      await expect(createPartyPromise).rejects.toThrow(`Failed to create party in ACBS.`);
      await expect(createPartyPromise).rejects.toHaveProperty('innerError', axiosError);
    });
  });
});
