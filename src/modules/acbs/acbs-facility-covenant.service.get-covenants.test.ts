import { HttpService } from '@nestjs/axios';
import { GetFacilityCovenantGenerator } from '@ukef-test/support/generator/get-facility-covenant-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { AxiosError } from 'axios';
import { when } from 'jest-when';
import { of, throwError } from 'rxjs';

import { DateStringTransformations } from '../date/date-string.transformations';
import { AcbsFacilityCovenantService } from './acbs-facility-covenant.service';
import { AcbsException } from './exception/acbs.exception';

describe('AcbsFacilityCovenantService', () => {
  const valueGenerator = new RandomValueGenerator();
  const dateStringTransformations = new DateStringTransformations();
  const idToken = valueGenerator.string();
  const baseUrl = valueGenerator.httpsUrl();
  const portfolioIdentifier = valueGenerator.string({ length: 2 });
  const facilityIdentifier = valueGenerator.facilityId();

  let httpService: HttpService;
  let service: AcbsFacilityCovenantService;

  let httpServiceGet: jest.Mock;

  const expectedHttpServiceGetArgs = [
    `/Portfolio/${portfolioIdentifier}/Facility/${facilityIdentifier}/Covenant`,
    {
      baseURL: baseUrl,
      headers: { Authorization: `Bearer ${idToken}` },
    },
  ];

  beforeEach(() => {
    httpService = new HttpService();

    httpServiceGet = jest.fn();
    httpService.get = httpServiceGet;

    service = new AcbsFacilityCovenantService({ baseUrl }, httpService);
  });

  const { facilityCovenantsInAcbs } = new GetFacilityCovenantGenerator(valueGenerator, dateStringTransformations).generate({
    numberToGenerate: 2,
    facilityIdentifier,
    portfolioIdentifier,
  });

  describe('getCovenantsForFacility', () => {
    it('returns the covenants for the facility from ACBS if ACBS responds with the covenants', async () => {
      when(httpServiceGet)
        .calledWith(...expectedHttpServiceGetArgs)
        .mockReturnValueOnce(
          of({
            data: facilityCovenantsInAcbs,
            status: 200,
            statusText: 'Ok',
            config: undefined,
            headers: undefined,
          }),
        );

      const covenants = await service.getCovenantsForFacility(portfolioIdentifier, facilityIdentifier, idToken);

      expect(covenants).toBe(facilityCovenantsInAcbs);
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

      const guarantees = await service.getCovenantsForFacility(portfolioIdentifier, facilityIdentifier, idToken);

      expect(guarantees).toStrictEqual([]);
    });

    it('throws an AcbsException if the request to ACBS fails', async () => {
      const getCovenantsForFacilityError = new AxiosError();
      when(httpServiceGet)
        .calledWith(...expectedHttpServiceGetArgs)
        .mockReturnValueOnce(throwError(() => getCovenantsForFacilityError));

      const getCovenantsForFacilityPromise = service.getCovenantsForFacility(portfolioIdentifier, facilityIdentifier, idToken);

      await expect(getCovenantsForFacilityPromise).rejects.toBeInstanceOf(AcbsException);
      await expect(getCovenantsForFacilityPromise).rejects.toThrow(`Failed to get the covenants for the facility with identifier ${facilityIdentifier}.`);
      await expect(getCovenantsForFacilityPromise).rejects.toHaveProperty('innerError', getCovenantsForFacilityError);
    });
  });
});
