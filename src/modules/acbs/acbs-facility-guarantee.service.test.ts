import { HttpService } from '@nestjs/axios';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { AxiosError } from 'axios';
import { when } from 'jest-when';
import { of, throwError } from 'rxjs';

import { AcbsFacilityGuaranteeService } from './acbs-facility-guarantee.service';
import { AcbsGetFacilityGuaranteeDto, AcbsGetFacilityGuaranteesResponseDto } from './dto/acbs-get-facility-guarantees-response.dto';
import { AcbsException } from './exception/acbs.exception';
import { AcbsResourceNotFoundException } from './exception/acbs-resource-not-found.exception';

describe('AcbsFacilityGuaranteeService', () => {
  const valueGenerator = new RandomValueGenerator();
  const idToken = valueGenerator.string();
  const baseUrl = valueGenerator.httpsUrl();
  const portfolioIdentifier = valueGenerator.string({ length: 2 });
  const facilityIdentifier = valueGenerator.facilityId();

  let httpService: HttpService;
  let service: AcbsFacilityGuaranteeService;

  let httpServiceGet: jest.Mock;

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

    service = new AcbsFacilityGuaranteeService({ baseUrl }, httpService);
  });

  const generateFacilityGuarantee = (): AcbsGetFacilityGuaranteeDto => ({
    EffectiveDate: valueGenerator.dateTimeString(),
    GuarantorParty: {
      PartyIdentifier: valueGenerator.stringOfNumericCharacters({ length: 8 }),
    },
    LimitKey: valueGenerator.string(),
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
});
