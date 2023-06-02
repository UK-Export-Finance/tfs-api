import { HttpService } from '@nestjs/axios';
import { GetFacilityInvestorGenerator } from '@ukef-test/support/generator/get-facility-investor-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { AxiosError } from 'axios';
import { when } from 'jest-when';
import { of, throwError } from 'rxjs';

import { AcbsFacilityPartyService } from './acbs-facility-party.service';
import { AcbsException } from './exception/acbs.exception';
import { AcbsResourceNotFoundException } from './exception/acbs-resource-not-found.exception';

describe('AcbsFacilityPartyService', () => {
  const valueGenerator = new RandomValueGenerator();
  const idToken = valueGenerator.string();
  const baseUrl = valueGenerator.httpsUrl();
  const portfolioIdentifier = valueGenerator.portfolioId();
  const facilityIdentifier = valueGenerator.ukefId();

  const { facilityInvestorsInAcbs } = new GetFacilityInvestorGenerator(valueGenerator).generate({
    numberToGenerate: 2,
    facilityIdentifier,
    portfolioIdentifier,
  });

  let httpService: HttpService;
  let service: AcbsFacilityPartyService;

  let httpServiceGet: jest.Mock;

  const expectedHttpServiceGetArgs = [
    `/Portfolio/${portfolioIdentifier}/Facility/${facilityIdentifier}/FacilityParty`,
    {
      baseURL: baseUrl,
      headers: { Authorization: `Bearer ${idToken}` },
    },
  ];

  beforeEach(() => {
    httpService = new HttpService();

    httpServiceGet = jest.fn();
    httpService.get = httpServiceGet;

    service = new AcbsFacilityPartyService({ baseUrl }, httpService);
  });

  describe('getFacilityPartiesForFacility', () => {
    it('returns the facility party from ACBS if ACBS responds with the facility party', async () => {
      when(httpServiceGet)
        .calledWith(...expectedHttpServiceGetArgs)
        .mockReturnValueOnce(
          of({
            data: facilityInvestorsInAcbs,
            status: 200,
            statusText: 'Ok',
            config: undefined,
            headers: undefined,
          }),
        );

      const facilityParty = await service.getFacilityPartiesForFacility(portfolioIdentifier, facilityIdentifier, idToken);

      expect(facilityParty).toBe(facilityInvestorsInAcbs);
    });

    it('throws an AcbsException if the request to ACBS fails', async () => {
      const getFacilityPartyByFacilityIdentifierError = new AxiosError();
      when(httpServiceGet)
        .calledWith(...expectedHttpServiceGetArgs)
        .mockReturnValueOnce(throwError(() => getFacilityPartyByFacilityIdentifierError));

      const getPromise = service.getFacilityPartiesForFacility(portfolioIdentifier, facilityIdentifier, idToken);

      await expect(getPromise).rejects.toBeInstanceOf(AcbsException);
      await expect(getPromise).rejects.toThrow(`Failed to get a party for facility ${facilityIdentifier} in ACBS.`);
      await expect(getPromise).rejects.toHaveProperty('innerError', getFacilityPartyByFacilityIdentifierError);
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

      const getPromise = service.getFacilityPartiesForFacility(portfolioIdentifier, facilityIdentifier, idToken);

      await expect(getPromise).rejects.toBeInstanceOf(AcbsResourceNotFoundException);
      await expect(getPromise).rejects.toThrow(`Facility with identifier ${facilityIdentifier} was not found by ACBS.`);
    });
  });
});
