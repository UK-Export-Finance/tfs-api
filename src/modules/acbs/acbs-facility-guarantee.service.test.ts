import { HttpService } from '@nestjs/axios';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { generateAcbsCreateFacilityGuaranteeDtoUsing } from '@ukef-test/support/requests/acbs-create-facility-guarantee-dto';
import { AxiosError } from 'axios';
import { when } from 'jest-when';
import { of, throwError } from 'rxjs';

import { AcbsFacilityGuaranteeService } from './acbs-facility-guarantee.service';
import { AcbsGetFacilityGuaranteeDto, AcbsGetFacilityGuaranteesResponseDto } from './dto/acbs-get-facility-guarantees-response.dto';
import { AcbsException } from './exception/acbs.exception';
import { AcbsBadRequestException } from './exception/acbs-bad-request.exception';
import { AcbsResourceNotFoundException } from './exception/acbs-resource-not-found.exception';
import { AcbsUnexpectedException } from './exception/acbs-unexpected.exception';

describe('AcbsFacilityGuaranteeService', () => {
  const valueGenerator = new RandomValueGenerator();
  const authToken = valueGenerator.string();
  const idToken = valueGenerator.string();
  const baseUrl = valueGenerator.httpsUrl();
  const portfolioIdentifier = valueGenerator.string({ length: 2 });
  const facilityIdentifier = valueGenerator.facilityId();

  let httpService: HttpService;
  let service: AcbsFacilityGuaranteeService;

  let httpServiceGet: jest.Mock;
  let httpServicePost: jest.Mock;

  const expectedHttpServiceGetArgs = [
    `/Portfolio/${portfolioIdentifier}/Facility/${facilityIdentifier}/FacilityGuarantee`,
    {
      baseURL: baseUrl,
      headers: { Authorization: `Bearer ${idToken}` },
    },
  ];

  beforeEach(() => {
    httpService = new HttpService();

    httpServiceGet = jest.fn();
    httpService.get = httpServiceGet;

    httpServicePost = jest.fn();
    httpService.post = httpServicePost;

    service = new AcbsFacilityGuaranteeService({ baseUrl }, httpService);
  });

  const generateFacilityGuarantee = (): AcbsGetFacilityGuaranteeDto => ({
    EffectiveDate: valueGenerator.dateTimeString(),
    GuarantorParty: {
      PartyIdentifier: valueGenerator.acbsPartyId(),
    },
    LimitKey: valueGenerator.acbsPartyId(),
    ExpirationDate: valueGenerator.dateTimeString(),
    GuaranteedLimit: valueGenerator.nonnegativeFloat(),
    GuaranteeType: {
      GuaranteeTypeCode: valueGenerator.string(),
    },
  });

  const facilityGuaranteesInAcbs: AcbsGetFacilityGuaranteesResponseDto = [generateFacilityGuarantee(), generateFacilityGuarantee()];

  describe('getGuaranteesForFacility', () => {
    it('returns the guarantees for the facility from ACBS if ACBS responds with the guarantees', async () => {
      when(httpServiceGet)
        .calledWith(...expectedHttpServiceGetArgs)
        .mockReturnValueOnce(
          of({
            data: facilityGuaranteesInAcbs,
            status: 200,
            statusText: 'Ok',
            config: undefined,
            headers: undefined,
          }),
        );

      const guarantees = await service.getGuaranteesForFacility(portfolioIdentifier, facilityIdentifier, idToken);

      expect(guarantees).toBe(facilityGuaranteesInAcbs);
    });

    it('returns an empty array if ACBS responds with an empty array', async () => {
      when(httpServiceGet)
        .calledWith(...expectedHttpServiceGetArgs)
        .mockReturnValueOnce(
          of({
            data: [],
            status: 200,
            statusText: 'Ok',
            config: undefined,
            headers: undefined,
          }),
        );

      const guarantees = await service.getGuaranteesForFacility(portfolioIdentifier, facilityIdentifier, idToken);

      expect(guarantees).toStrictEqual([]);
    });

    it('throws an AcbsException if the request to ACBS fails', async () => {
      const getGuaranteesForFacilityError = new AxiosError();
      when(httpServiceGet)
        .calledWith(...expectedHttpServiceGetArgs)
        .mockReturnValueOnce(throwError(() => getGuaranteesForFacilityError));

      const getGuaranteesForFacilityPromise = service.getGuaranteesForFacility(portfolioIdentifier, facilityIdentifier, idToken);

      await expect(getGuaranteesForFacilityPromise).rejects.toBeInstanceOf(AcbsException);
      await expect(getGuaranteesForFacilityPromise).rejects.toThrow(`Failed to get the guarantees for the facility with identifier ${facilityIdentifier}.`);
      await expect(getGuaranteesForFacilityPromise).rejects.toHaveProperty('innerError', getGuaranteesForFacilityError);
    });

    it(`throws an AcbsResourceNotFoundException if ACBS responds with a 200 response where the response body is 'null'`, async () => {
      when(httpServiceGet)
        .calledWith(...expectedHttpServiceGetArgs)
        .mockReturnValueOnce(
          of({
            data: null,
            status: 200,
            statusText: 'Ok',
            config: undefined,
            headers: undefined,
          }),
        );

      const getGuaranteesForFacilityPromise = service.getGuaranteesForFacility(portfolioIdentifier, facilityIdentifier, idToken);

      await expect(getGuaranteesForFacilityPromise).rejects.toBeInstanceOf(AcbsResourceNotFoundException);
      await expect(getGuaranteesForFacilityPromise).rejects.toThrow(`Guarantees for facility with identifier ${facilityIdentifier} were not found by ACBS.`);
    });
  });

  describe('createGuaranteeForFacility', () => {
    const newFacilityGuarantee = generateAcbsCreateFacilityGuaranteeDtoUsing(valueGenerator);

    it('sends a POST to ACBS with the specified parameters', async () => {
      when(httpServicePost)
        .calledWith(`/Portfolio/${portfolioIdentifier}/Facility/${facilityIdentifier}/FacilityGuarantee`, newFacilityGuarantee, {
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

      await service.createGuaranteeForFacility(facilityIdentifier, newFacilityGuarantee, authToken);

      expect(httpServicePost).toHaveBeenCalledTimes(1);
      expect(httpServicePost).toHaveBeenCalledWith(`/Portfolio/${portfolioIdentifier}/Facility/${facilityIdentifier}/FacilityGuarantee`, newFacilityGuarantee, {
        baseURL: baseUrl,
        headers: { Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json' },
      });
    });

    it('throws an AcbsResourceNotFoundException if ACBS responds with a 400 that is a string containing "The facility not found"', async () => {
      const axiosError = new AxiosError();
      const errorString = 'The facility not found or the user does not have access to it.';
      axiosError.response = {
        data: errorString,
        status: 400,
        statusText: 'Bad Request',
        headers: undefined,
        config: undefined,
      };

      when(httpServicePost)
        .calledWith(`/Portfolio/${portfolioIdentifier}/Facility/${facilityIdentifier}/FacilityGuarantee`, newFacilityGuarantee, {
          baseURL: baseUrl,
          headers: { Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json' },
        })
        .mockReturnValueOnce(throwError(() => axiosError));

      const createGuaranteeForFacilityPromise = service.createGuaranteeForFacility(facilityIdentifier, newFacilityGuarantee, authToken);

      await expect(createGuaranteeForFacilityPromise).rejects.toBeInstanceOf(AcbsResourceNotFoundException);
      await expect(createGuaranteeForFacilityPromise).rejects.toThrow(`Facility with identifier ${facilityIdentifier} was not found by ACBS.`);
      await expect(createGuaranteeForFacilityPromise).rejects.toHaveProperty('innerError', axiosError);
    });

    it('throws an AcbsBadRequestException if ACBS responds with a 400 that is a string that does not contain "The facility not found"', async () => {
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
        .calledWith(`/Portfolio/${portfolioIdentifier}/Facility/${facilityIdentifier}/FacilityGuarantee`, newFacilityGuarantee, {
          baseURL: baseUrl,
          headers: { Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json' },
        })
        .mockReturnValueOnce(throwError(() => axiosError));

      const createGuaranteeForFacilityPromise = service.createGuaranteeForFacility(facilityIdentifier, newFacilityGuarantee, authToken);

      await expect(createGuaranteeForFacilityPromise).rejects.toBeInstanceOf(AcbsBadRequestException);
      await expect(createGuaranteeForFacilityPromise).rejects.toThrow(`Failed to create a guarantee for facility ${facilityIdentifier} in ACBS.`);
      await expect(createGuaranteeForFacilityPromise).rejects.toHaveProperty('innerError', axiosError);
      await expect(createGuaranteeForFacilityPromise).rejects.toHaveProperty('errorBody', errorString);
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
        .calledWith(`/Portfolio/${portfolioIdentifier}/Facility/${facilityIdentifier}/FacilityGuarantee`, newFacilityGuarantee, {
          baseURL: baseUrl,
          headers: { Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json' },
        })
        .mockReturnValueOnce(throwError(() => axiosError));

      const createGuaranteeForFacilityPromise = service.createGuaranteeForFacility(facilityIdentifier, newFacilityGuarantee, authToken);

      await expect(createGuaranteeForFacilityPromise).rejects.toBeInstanceOf(AcbsBadRequestException);
      await expect(createGuaranteeForFacilityPromise).rejects.toThrow(`Failed to create a guarantee for facility ${facilityIdentifier} in ACBS.`);
      await expect(createGuaranteeForFacilityPromise).rejects.toHaveProperty('innerError', axiosError);
      await expect(createGuaranteeForFacilityPromise).rejects.toHaveProperty('errorBody', JSON.stringify(errorBody));
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
        .calledWith(`/Portfolio/${portfolioIdentifier}/Facility/${facilityIdentifier}/FacilityGuarantee`, newFacilityGuarantee, {
          baseURL: baseUrl,
          headers: { Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json' },
        })
        .mockReturnValueOnce(throwError(() => axiosError));

      const createGuaranteeForFacilityPromise = service.createGuaranteeForFacility(facilityIdentifier, newFacilityGuarantee, authToken);

      await expect(createGuaranteeForFacilityPromise).rejects.toBeInstanceOf(AcbsUnexpectedException);
      await expect(createGuaranteeForFacilityPromise).rejects.toThrow(`Failed to create a guarantee for facility ${facilityIdentifier} in ACBS.`);
      await expect(createGuaranteeForFacilityPromise).rejects.toHaveProperty('innerError', axiosError);
    });
  });
});
