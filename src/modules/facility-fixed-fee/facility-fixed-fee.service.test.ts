import { BadRequestException } from '@nestjs/common';
import { ENUMS, PROPERTIES } from '@ukef/constants';
import { AcbsFacilityFixedFeeService } from '@ukef/modules/acbs/acbs-facility-fixed-fee.service';
import { AcbsCreateFacilityFixedFeeRequestDto } from '@ukef/modules/acbs/dto/acbs-create-facility-fixed-fee-request.dto';
import { AcbsAuthenticationService } from '@ukef/modules/acbs-authentication/acbs-authentication.service';
import { CurrentDateProvider } from '@ukef/modules/date/current-date.provider';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { getMockAcbsAuthenticationService } from '@ukef-test/support/abcs-authentication.service.mock';
import { CreateFacilityFixedFeeGenerator } from '@ukef-test/support/generator/create-facility-fixed-fee-generator';
import { GetFacilityFixedFeeGenerator } from '@ukef-test/support/generator/get-facility-fixed-fee-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { when } from 'jest-when';

import { FacilityFixedFeeService } from './facility-fixed-fee.service';

describe('FacilityFixedFeeService', () => {
  const { portfolioIdentifier } = PROPERTIES.GLOBAL;
  const valueGenerator = new RandomValueGenerator();
  const idToken = valueGenerator.string();
  const facilityIdentifier = valueGenerator.facilityId();

  const { apiFacilityFixedFees: expectedFacilityFixedFees, acbsFacilityFixedFees } = new GetFacilityFixedFeeGenerator(
    valueGenerator,
    new DateStringTransformations(),
  ).generate({ numberToGenerate: 2, facilityIdentifier, portfolioIdentifier });

  let acbsAuthenticationService: AcbsAuthenticationService;
  let service: FacilityFixedFeeService;

  let getFacilityFixedFeesAcbsService: jest.Mock;
  let createFacilityFixedFeesAcbsService: jest.Mock;

  beforeEach(() => {
    const mockAcbsAuthenticationService = getMockAcbsAuthenticationService();
    acbsAuthenticationService = mockAcbsAuthenticationService.service;
    const acbsAuthenticationServiceGetIdToken = mockAcbsAuthenticationService.getIdToken;
    when(acbsAuthenticationServiceGetIdToken).calledWith().mockResolvedValueOnce(idToken);

    const acbsService = new AcbsFacilityFixedFeeService(null, null);
    getFacilityFixedFeesAcbsService = jest.fn();
    acbsService.getFixedFeesForFacility = getFacilityFixedFeesAcbsService;
    createFacilityFixedFeesAcbsService = jest.fn();
    acbsService.createFixedFeeForFacility = createFacilityFixedFeesAcbsService;

    service = new FacilityFixedFeeService(acbsAuthenticationService, acbsService, new DateStringTransformations(), new CurrentDateProvider());
  });

  describe('getFixedFeesForFacility', () => {
    it('returns a transformation of the fixed fee from ACBS', async () => {
      when(getFacilityFixedFeesAcbsService).calledWith(portfolioIdentifier, facilityIdentifier, idToken).mockResolvedValueOnce(acbsFacilityFixedFees);

      const result = await service.getFixedFeesForFacility(facilityIdentifier);

      expect(result).toStrictEqual(expectedFacilityFixedFees);
    });

    it('returns an empty array if ACBS returns an empty array', async () => {
      when(getFacilityFixedFeesAcbsService).calledWith(portfolioIdentifier, facilityIdentifier, idToken).mockResolvedValueOnce([]);

      const result = await service.getFixedFeesForFacility(facilityIdentifier);

      expect(result).toStrictEqual([]);
    });
  });

  describe('createFixedFeeForFacility', () => {
    const facilityTypeCode = valueGenerator.enumValue(ENUMS.FACILITY_TYPE_IDS);
    const borrowerPartyIdentifier = valueGenerator.acbsPartyId();

    const { acbsRequestBodyToCreateFacilityFixedFee, requestBodyToCreateFacilityFixedFee } = new CreateFacilityFixedFeeGenerator(
      valueGenerator,
      new DateStringTransformations(),
    ).generate({
      numberToGenerate: 1,
      facilityTypeCode,
      borrowerPartyIdentifier,
    });

    const [newFixedFeeWithAllFields] = requestBodyToCreateFacilityFixedFee;

    it('creates a fixed fee in ACBS with a transformation of the requested new fixed fee', async () => {
      await service.createFixedFeeForFacility(
        facilityIdentifier,
        borrowerPartyIdentifier,
        facilityTypeCode,
        newFixedFeeWithAllFields,
        ENUMS.FACILITY_STATUSES.ACTIVE,
        ENUMS.FACILITY_STAGES.ISSUED,
      );

      expect(createFacilityFixedFeesAcbsService).toHaveBeenCalledWith(
        portfolioIdentifier,
        facilityIdentifier,
        acbsRequestBodyToCreateFacilityFixedFee,
        idToken,
      );
    });

    it(`sets the description to 'Bond Support Premium' if the facility is 'BSS'`, async () => {
      await service.createFixedFeeForFacility(
        facilityIdentifier,
        borrowerPartyIdentifier,
        ENUMS.FACILITY_TYPE_IDS.BSS,
        newFixedFeeWithAllFields,
        ENUMS.FACILITY_STATUSES.ACTIVE,
        ENUMS.FACILITY_STAGES.ISSUED,
      );

      const fixedFeeAcbsPayload = getFixedFeeAcbsPayload();

      expect(fixedFeeAcbsPayload.Description).toBe('Bond Support Premium');
    });

    it(`sets the description to 'EWCS Premium' if the facility is 'EWCS'`, async () => {
      await service.createFixedFeeForFacility(
        facilityIdentifier,
        borrowerPartyIdentifier,
        ENUMS.FACILITY_TYPE_IDS.EWCS,
        newFixedFeeWithAllFields,
        ENUMS.FACILITY_STATUSES.ACTIVE,
        ENUMS.FACILITY_STAGES.ISSUED,
      );

      const fixedFeeAcbsPayload = getFixedFeeAcbsPayload();

      expect(fixedFeeAcbsPayload.Description).toBe('EWCS Premium');
    });

    it(`sets the description to 'Financial Guarantee Fee' if the facility is 'GEF'`, async () => {
      await service.createFixedFeeForFacility(
        facilityIdentifier,
        borrowerPartyIdentifier,
        ENUMS.FACILITY_TYPE_IDS.GEF,
        newFixedFeeWithAllFields,
        ENUMS.FACILITY_STATUSES.ACTIVE,
        ENUMS.FACILITY_STAGES.ISSUED,
      );

      const fixedFeeAcbsPayload = getFixedFeeAcbsPayload();

      expect(fixedFeeAcbsPayload.Description).toBe('Financial Guarantee Fee');
    });

    it(`sets the InvolvedParty to ECGD default party id if lenderTypeCode is ECGD`, async () => {
      const newFixedFeeWithLenderTypeECGD = { ...newFixedFeeWithAllFields, lenderTypeCode: ENUMS.LENDER_TYPE_CODES.ECGD };

      await service.createFixedFeeForFacility(
        facilityIdentifier,
        borrowerPartyIdentifier,
        facilityTypeCode,
        newFixedFeeWithLenderTypeECGD,
        ENUMS.FACILITY_STATUSES.ACTIVE,
        ENUMS.FACILITY_STAGES.ISSUED,
      );

      const fixedFeeAcbsPayload = getFixedFeeAcbsPayload();

      expect(fixedFeeAcbsPayload.InvolvedParty.PartyIdentifier).toBe(PROPERTIES.FACILITY_FIXED_FEE.DEFAULT.involvedParty.partyIdentifier);
    });

    it(`sets the InvolvedParty to borrowerPartyIdentifier if lenderTypeCode is FIRST_LEVEL_OBLIGOR`, async () => {
      const newFixedFeeWithLenderTypeECGD = { ...newFixedFeeWithAllFields, lenderTypeCode: ENUMS.LENDER_TYPE_CODES.FIRST_LEVEL_OBLIGOR };

      await service.createFixedFeeForFacility(
        facilityIdentifier,
        borrowerPartyIdentifier,
        facilityTypeCode,
        newFixedFeeWithLenderTypeECGD,
        ENUMS.FACILITY_STATUSES.ACTIVE,
        ENUMS.FACILITY_STAGES.ISSUED,
      );

      const fixedFeeAcbsPayload = getFixedFeeAcbsPayload();

      expect(fixedFeeAcbsPayload.InvolvedParty.PartyIdentifier).toBe(borrowerPartyIdentifier);
    });

    it('returns activation error if the facility is not active', async () => {
      const responsePromise = service.createFixedFeeForFacility(
        facilityIdentifier,
        borrowerPartyIdentifier,
        facilityTypeCode,
        newFixedFeeWithAllFields,
        ENUMS.FACILITY_STATUSES.PENDING,
        ENUMS.FACILITY_STAGES.ISSUED,
      );

      await expect(responsePromise).rejects.toBeInstanceOf(BadRequestException);
      await expect(responsePromise).rejects.toThrow('Bad request');
      await expect(responsePromise).rejects.toHaveProperty('response.error', 'Facility needs to be activated before a fixed fee is created');
    });

    it('returns Facility not issued error if the facility is not active', async () => {
      const responsePromise = service.createFixedFeeForFacility(
        facilityIdentifier,
        borrowerPartyIdentifier,
        facilityTypeCode,
        newFixedFeeWithAllFields,
        ENUMS.FACILITY_STATUSES.ACTIVE,
        ENUMS.FACILITY_STAGES.UNISSUED,
      );

      await expect(responsePromise).rejects.toBeInstanceOf(BadRequestException);
      await expect(responsePromise).rejects.toThrow('Bad request');
      await expect(responsePromise).rejects.toHaveProperty('response.error', 'Facility needs to be issued before a fixed fee is created');
    });
  });

  const getFixedFeeAcbsPayload = (): AcbsCreateFacilityFixedFeeRequestDto => createFacilityFixedFeesAcbsService.mock.calls[0][2];
});
