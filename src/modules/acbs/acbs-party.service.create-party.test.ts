import { HttpService } from '@nestjs/axios';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { AxiosError } from 'axios';
import { when } from 'jest-when';
import { of, throwError } from 'rxjs';

import { DateStringTransformations } from '../date/date-string.transformations';
import { AcbsPartyService } from './acbs-party.service';
import { CreatePartyGenerator } from '@ukef-test/support/generator/create-party-generator';
import { CreatePartyInAcbsFailedException } from '../party/exception/create-party-in-acbs-failed.exception';

describe('AcbsPartyService', () => {
  const valueGenerator = new RandomValueGenerator();
  const dateStringTransformations = new DateStringTransformations();
  const idToken = valueGenerator.string();
  const baseUrl = valueGenerator.httpsUrl();

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

    service = new AcbsPartyService({ baseUrl }, httpService);
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
            headers: undefined,
          }),
        );

      await service.createParty(newParty, idToken);

      expect(httpServicePost).toHaveBeenCalledTimes(1);
      expect(httpServicePost).toHaveBeenCalledWith(...expectedHttpServicePostArgs);
    });

//rename and edit this to test what is returned
    it('returns a party', async () => {
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

      await service.createParty(newParty, idToken);

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
        headers: undefined,
        config: undefined,
      };

      when(httpServicePost)
        .calledWith(...expectedHttpServicePostArgs)
        .mockReturnValueOnce(throwError(() => axiosError));

      const createFacilityPromise = service.createParty(newParty, idToken);

      await expect(createFacilityPromise).rejects.toBeInstanceOf(CreatePartyInAcbsFailedException);
      await expect(createFacilityPromise).rejects.toThrow(`Failed to create party in ACBS.`);
      await expect(createFacilityPromise).rejects.toHaveProperty('innerError', axiosError);
      await expect(createFacilityPromise).rejects.toHaveProperty('errorBody', errorString);
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

      const createDealPromise = service.createParty(newParty, idToken);

      await expect(createDealPromise).rejects.toBeInstanceOf(CreatePartyInAcbsFailedException);
      await expect(createDealPromise).rejects.toThrow(`Failed to create party in ACBS.`);
      await expect(createDealPromise).rejects.toHaveProperty('innerError', axiosError);
    });
  });
});
