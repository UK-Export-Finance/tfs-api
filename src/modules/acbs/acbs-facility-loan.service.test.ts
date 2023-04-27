import { HttpService } from '@nestjs/axios';
import { GetFacilityLoanGenerator } from '@ukef-test/support/generator/get-facility-loan-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { AxiosError } from 'axios';
import { when } from 'jest-when';
import { of, throwError } from 'rxjs';

import { DateStringTransformations } from '../date/date-string.transformations';
import { AcbsFacilityLoanService } from './acbs-facility-loan.service';
import { AcbsResourceNotFoundException } from './exception/acbs-resource-not-found.exception';
import { AcbsException } from './exception/acbs.exception';

describe('AcbsFacilityLoanService', () => {
  const valueGenerator = new RandomValueGenerator();
  const dateStringTransformations = new DateStringTransformations();
  const idToken = valueGenerator.string();
  const baseUrl = valueGenerator.httpsUrl();
  const portfolioIdentifier = valueGenerator.string({ length: 2 });
  const facilityIdentifier = valueGenerator.facilityId();

  let httpService: HttpService;
  let service: AcbsFacilityLoanService;

  let httpServiceGet: jest.Mock;

  const expectedHttpServiceGetArgs = [
    `/Portfolio/${portfolioIdentifier}/Facility/${facilityIdentifier}/Loan`,
    {
      baseURL: baseUrl,
      headers: { Authorization: `Bearer ${idToken}` },
    },
  ];

  beforeEach(() => {
    httpService = new HttpService();

    httpServiceGet = jest.fn();
    httpService.get = httpServiceGet;

    service = new AcbsFacilityLoanService({ baseUrl }, httpService);
  });

  const { facilityLoansInAcbs } = new GetFacilityLoanGenerator(valueGenerator, dateStringTransformations).generate({
    numberToGenerate: 2,
    facilityIdentifier,
    portfolioIdentifier,
  });

  describe('getLoansForFacility', () => {
    it('returns the loans for the facility from ACBS if ACBS responds with the loans', async () => {
      when(httpServiceGet)
        .calledWith(...expectedHttpServiceGetArgs)
        .mockReturnValueOnce(
          of({
            data: facilityLoansInAcbs,
            status: 200,
            statusText: 'Ok',
            config: undefined,
            headers: undefined,
          }),
        );

      const loans = await service.getLoansForFacility(portfolioIdentifier, facilityIdentifier, idToken);

      expect(loans).toBe(facilityLoansInAcbs);
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

      const loans = await service.getLoansForFacility(portfolioIdentifier, facilityIdentifier, idToken);

      expect(loans).toStrictEqual([]);
    });

    it('throws an AcbsResourceNotFoundException if ACBS responds with a 400 response that is a string containing "Facility not found"', async () => {
        const axiosError = new AxiosError();
        axiosError.response = {
          data: 'Facility not found or user does not have access to it.',
          status: 400,
          statusText: 'Bad Request',
          headers: undefined,
          config: undefined,
        };
  
        when(httpServiceGet)
          .calledWith(...expectedHttpServiceGetArgs)
          .mockReturnValueOnce(throwError(() => axiosError));
  
        const getLoansPromise = service.getLoansForFacility(portfolioIdentifier, facilityIdentifier, idToken);
  
        await expect(getLoansPromise).rejects.toBeInstanceOf(AcbsResourceNotFoundException);
        await expect(getLoansPromise).rejects.toThrow(`Facility with identifier ${facilityIdentifier} was not found by ACBS.`);
        await expect(getLoansPromise).rejects.toHaveProperty('innerError', axiosError);
      });
  
      it('throws an AcbsException if ACBS responds with a 400 response that is a string that does NOT contain "The facility not found"', async () => {
        const axiosError = new AxiosError();
        axiosError.response = {
          data: 'some error string',
          status: 400,
          statusText: 'Bad Request',
          headers: undefined,
          config: undefined,
        };
  
        when(httpServiceGet)
          .calledWith(...expectedHttpServiceGetArgs)
          .mockReturnValueOnce(throwError(() => axiosError));
  
        const getLoansPromise = service.getLoansForFacility(portfolioIdentifier, facilityIdentifier, idToken);
  
        await expect(getLoansPromise).rejects.toBeInstanceOf(AcbsException);
        await expect(getLoansPromise).rejects.toThrow(`Failed to get the loans for the facility with identifier ${facilityIdentifier}.`);
        await expect(getLoansPromise).rejects.toHaveProperty('innerError', axiosError);
      });
  
      it('throws an AcbsException if ACBS responds with a 400 response that is NOT a string', async () => {
        const axiosError = new AxiosError();
        axiosError.response = {
          data: { errorMessage: valueGenerator.string() },
          status: 400,
          statusText: 'Bad Request',
          headers: undefined,
          config: undefined,
        };
  
        when(httpServiceGet)
          .calledWith(...expectedHttpServiceGetArgs)
          .mockReturnValueOnce(throwError(() => axiosError));
  
          const getLoansPromise = service.getLoansForFacility(portfolioIdentifier, facilityIdentifier, idToken);
  
        await expect(getLoansPromise).rejects.toBeInstanceOf(AcbsException);
        await expect(getLoansPromise).rejects.toThrow(`Failed to get the loans for the facility with identifier ${facilityIdentifier}.`);
        await expect(getLoansPromise).rejects.toHaveProperty('innerError', axiosError);
      });
    });
});
