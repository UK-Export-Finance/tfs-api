import { HttpService } from '@nestjs/axios';
import { CreateFacilityGenerator } from '@ukef-test/support/generator/create-facility-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { AxiosError } from 'axios';
import { when } from 'jest-when';
import { of, throwError } from 'rxjs';

import { DateStringTransformations } from '../date/date-string.transformations';
import { AcbsFacilityService } from './acbs-facility.service';
import { AcbsBadRequestException } from './exception/acbs-bad-request.exception';
import { AcbsUnexpectedException } from './exception/acbs-unexpected.exception';

describe('AcbsFacilityService', () => {
  const valueGenerator = new RandomValueGenerator();
  const idToken = valueGenerator.string();
  const baseUrl = valueGenerator.httpsUrl();
  const randomPortfolioIdentifier = valueGenerator.string({ length: 2 });
  const facilityIdentifier = valueGenerator.facilityId();

  let httpService: HttpService;
  let service: AcbsFacilityService;

  let httpServicePost: jest.Mock;

  const { acbsCreateFacilityRequest: newFacility } = new CreateFacilityGenerator(valueGenerator, new DateStringTransformations()).generate({
    numberToGenerate: 1,
    facilityIdentifier,
  });

  const expectedHttpServicePostArgs = [
    `/Portfolio/${randomPortfolioIdentifier}/Facility`,
    newFacility,
    {
      baseURL: baseUrl,
      headers: { Authorization: `Bearer ${idToken}`, 'Content-Type': 'application/json' },
    },
  ];

  beforeEach(() => {
    httpService = new HttpService();

    httpServicePost = jest.fn();
    httpService.post = httpServicePost;

    service = new AcbsFacilityService({ baseUrl }, httpService);
  });

  describe('createFacility', () => {
    it('sends a POST to ACBS to create a facility with the specified parameters', async () => {
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

      await service.createFacility(randomPortfolioIdentifier, newFacility, idToken);

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

      const createFacilityPromise = service.createFacility(randomPortfolioIdentifier, newFacility, idToken);

      await expect(createFacilityPromise).rejects.toBeInstanceOf(AcbsBadRequestException);
      await expect(createFacilityPromise).rejects.toThrow(`Failed to create a facility with identifier ${facilityIdentifier} in ACBS.`);
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

      const createDealPromise = service.createFacility(randomPortfolioIdentifier, newFacility, idToken);

      await expect(createDealPromise).rejects.toBeInstanceOf(AcbsUnexpectedException);
      await expect(createDealPromise).rejects.toThrow(`Failed to create a facility with identifier ${facilityIdentifier} in ACBS.`);
      await expect(createDealPromise).rejects.toHaveProperty('innerError', axiosError);
    });
  });
});
