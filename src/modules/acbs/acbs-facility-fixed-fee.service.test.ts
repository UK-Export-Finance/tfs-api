import { HttpService } from '@nestjs/axios';
import { GetFacilityFixedFeeGenerator } from '@ukef-test/support/generator/get-facility-fixed-fee-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { AxiosError } from 'axios';
import { when } from 'jest-when';
import { of, throwError } from 'rxjs';

import { DateStringTransformations } from '../date/date-string.transformations';
import { AcbsFacilityFixedFeeService } from './acbs-facility-fixed-fee.service';
import { AcbsException } from './exception/acbs.exception';

describe('AcbsFacilityFixedFeeService', () => {
  const valueGenerator = new RandomValueGenerator();
  const idToken = valueGenerator.string();
  const baseUrl = valueGenerator.httpsUrl();
  const portfolioIdentifier = valueGenerator.string({ length: 2 });
  const facilityIdentifier = valueGenerator.facilityId();

  let httpService: HttpService;
  let service: AcbsFacilityFixedFeeService;

  let httpServiceGet: jest.Mock;

  const expectedHttpServiceGetArgs = [
    `/Portfolio/${portfolioIdentifier}/Facility/${facilityIdentifier}/Fee`,
    {
      baseURL: baseUrl,
      headers: { Authorization: `Bearer ${idToken}` },
    },
  ];

  beforeEach(() => {
    httpService = new HttpService();

    httpServiceGet = jest.fn();
    httpService.get = httpServiceGet;

    service = new AcbsFacilityFixedFeeService({ baseUrl }, httpService);
  });

  const { acbsFacilityFixedFees: facilityFixedFeesInAcbs } = new GetFacilityFixedFeeGenerator(valueGenerator, new DateStringTransformations()).generate({
    numberToGenerate: 2,
    facilityIdentifier,
    portfolioIdentifier,
  });

  describe('getFixedFeesForFacility', () => {
    it('returns the fixed fees for the facility from ACBS if ACBS responds with the fixed fees', async () => {
      when(httpServiceGet)
        .calledWith(...expectedHttpServiceGetArgs)
        .mockReturnValueOnce(
          of({
            data: facilityFixedFeesInAcbs,
            status: 200,
            statusText: 'Ok',
            config: undefined,
            headers: undefined,
          }),
        );

      const fixedFees = await service.getFixedFeesForFacility(portfolioIdentifier, facilityIdentifier, idToken);

      expect(fixedFees).toBe(facilityFixedFeesInAcbs);
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

      const fixedFees = await service.getFixedFeesForFacility(portfolioIdentifier, facilityIdentifier, idToken);

      expect(fixedFees).toStrictEqual([]);
    });

    it('throws an AcbsException if the request to ACBS fails', async () => {
      const getFixedFeesForFacilityError = new AxiosError();
      when(httpServiceGet)
        .calledWith(...expectedHttpServiceGetArgs)
        .mockReturnValueOnce(throwError(() => getFixedFeesForFacilityError));

      const getFixedFeesForFacilityPromise = service.getFixedFeesForFacility(portfolioIdentifier, facilityIdentifier, idToken);

      await expect(getFixedFeesForFacilityPromise).rejects.toBeInstanceOf(AcbsException);
      await expect(getFixedFeesForFacilityPromise).rejects.toThrow(`Failed to get the fixed fees for the facility with identifier ${facilityIdentifier}.`);
      await expect(getFixedFeesForFacilityPromise).rejects.toHaveProperty('innerError', getFixedFeesForFacilityError);
    });
  });
});
