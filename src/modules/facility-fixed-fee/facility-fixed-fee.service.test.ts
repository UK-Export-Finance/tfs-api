import { BadRequestException } from '@nestjs/common';
import { ENUMS, PROPERTIES } from '@ukef/constants';
import { AcbsFacilityFixedFeeService } from '@ukef/modules/acbs/acbs-facility-fixed-fee.service';
import { AcbsCreateFacilityFixedFeeRequestDto } from '@ukef/modules/acbs/dto/acbs-create-facility-fixed-fee-request.dto';
import { AcbsAuthenticationService } from '@ukef/modules/acbs-authentication/acbs-authentication.service';
import { CurrentDateProvider } from '@ukef/modules/date/current-date.provider';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { getMockAcbsAuthenticationService } from '@ukef-test/support/abcs-authentication.service.mock';
import { CreateFacilityFixedFeeGenerator } from '@ukef-test/support/generator/create-facility-fixed-fee-generator';
import { CreateFacilityFixedFeesAmountAmendmentGenerator } from '@ukef-test/support/generator/create-facility-fixed-fees-amount-amendment.generator';
import { GetFacilityFixedFeeGenerator } from '@ukef-test/support/generator/get-facility-fixed-fee-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { when } from 'jest-when';

import { AcbsBundleInformationService } from '../acbs/acbs-bundle-information.service';
import { AcbsCreateBundleInformationRequestDto } from '../acbs/dto/acbs-create-bundle-information-request.dto';
import { AcbsCreateBundleInformationResponseHeadersDto } from '../acbs/dto/acbs-create-bundle-information-response.dto';
import { FacilityFeeAmountTransaction } from '../acbs/dto/bundle-actions/facility-fee-amount-transaction.bundle-action';
import { FacilityFixedFeeService } from './facility-fixed-fee.service';

describe('FacilityFixedFeeService', () => {
  const { portfolioIdentifier } = PROPERTIES.GLOBAL;
  const valueGenerator = new RandomValueGenerator();
  const idToken = valueGenerator.string();
  const facilityIdentifier = valueGenerator.facilityId();
  const dateStringTransformations = new DateStringTransformations();
  const errorString = valueGenerator.string();

  const { apiFacilityFixedFees: expectedFacilityFixedFees, acbsFacilityFixedFees } = new GetFacilityFixedFeeGenerator(
    valueGenerator,
    dateStringTransformations,
  ).generate({ numberToGenerate: 2, facilityIdentifier, portfolioIdentifier });

  let acbsAuthenticationService: AcbsAuthenticationService;
  let service: FacilityFixedFeeService;

  let getFacilityFixedFeesAcbsService: jest.Mock;
  let createFacilityFixedFeesAcbsService: jest.Mock;
  let createBundleInformation: jest.Mock;

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
    const acbsBundleInformationService = new AcbsBundleInformationService(null, null);
    createBundleInformation = jest.fn();
    acbsBundleInformationService.createBundleInformation = createBundleInformation;

    service = new FacilityFixedFeeService(
      acbsAuthenticationService,
      acbsService,
      acbsBundleInformationService,
      dateStringTransformations,
      new CurrentDateProvider(),
    );
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
      dateStringTransformations,
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

  describe('createAmountAmendmentForFixedFees', () => {
    const facilityIdentifier = valueGenerator.facilityId();
    const createdBundleIdentifier = valueGenerator.acbsBundleId();
    const acbsBundleCreatedResponse: AcbsCreateBundleInformationResponseHeadersDto = { BundleIdentifier: createdBundleIdentifier, WarningErrors: undefined };
    const { facilityFeeTransactionType } = PROPERTIES.FACILITY_FEE_AMOUNT_TRANSACTION.DEFAULT.bundleMessageList;

    const { increaseAmountRequest, decreaseAmountRequest, acbsFixedFeesAmendmentForIncrease, acbsFixedFeesAmendmentForDecrease } =
      new CreateFacilityFixedFeesAmountAmendmentGenerator(valueGenerator, dateStringTransformations).generate({ numberToGenerate: 3, facilityIdentifier });

    describe('when creating a fixed fees amendment bundle in ACBS that increases the amount', () => {
      describe('with no header error', () => {
        beforeEach(() => {
          when(createBundleInformation).calledWith(acbsFixedFeesAmendmentForIncrease, idToken).mockResolvedValueOnce(acbsBundleCreatedResponse);
        });

        it('returns the BundleIdentifier from creating the fixed fees amendment bundle', async () => {
          const response = await service.createAmountAmendmentForFixedFees(facilityIdentifier, increaseAmountRequest);

          expect(response.bundleIdentifier).toBe(createdBundleIdentifier);
        });

        it('uses the increase FacilityFeeTransactionType when creating the fixed fees amendment bundle', async () => {
          await service.createAmountAmendmentForFixedFees(facilityIdentifier, increaseAmountRequest);

          const createdBundleInAcbs = getBundleCreatedInAcbs();

          expect(createdBundleInAcbs.BundleMessageList[0].FacilityFeeTransactionType.TypeCode).toBe(facilityFeeTransactionType.increaseTypeCode);
        });

        it('sets the amountAmendment as the TransactionAmount when creating the fixed fees amendment bundle', async () => {
          await service.createAmountAmendmentForFixedFees(facilityIdentifier, increaseAmountRequest);

          const createdBundleInAcbs = getBundleCreatedInAcbs();

          expect(createdBundleInAcbs.BundleMessageList[0].TransactionAmount).toBe(increaseAmountRequest[0].amountAmendment);
        });
      });

      it('returns the WarningErrors from creating the fixed fees amendment bundle', async () => {
        when(createBundleInformation)
          .calledWith(acbsFixedFeesAmendmentForIncrease, idToken)
          .mockResolvedValueOnce({ ...acbsBundleCreatedResponse, WarningErrors: errorString });
        const response = await service.createAmountAmendmentForFixedFees(facilityIdentifier, increaseAmountRequest);

        expect(response.warningErrors).toBe(errorString);
      });
    });

    describe('when creating a fixed fees amendment bundle in ACBS that decreases the amount', () => {
      describe('with no header error', () => {
        beforeEach(() => {
          when(createBundleInformation).calledWith(acbsFixedFeesAmendmentForDecrease, idToken).mockResolvedValueOnce(acbsBundleCreatedResponse);
        });

        it('returns the BundleIdentifier from creating the fixed fees amendment bundle', async () => {
          const response = await service.createAmountAmendmentForFixedFees(facilityIdentifier, decreaseAmountRequest);

          expect(response.bundleIdentifier).toBe(createdBundleIdentifier);
        });

        it('uses the decrease FacilityFeeTransactionType when creating the fixed fees amendment bundle', async () => {
          await service.createAmountAmendmentForFixedFees(facilityIdentifier, decreaseAmountRequest);

          const createdBundleInAcbs = getBundleCreatedInAcbs();

          expect(createdBundleInAcbs.BundleMessageList[0].FacilityFeeTransactionType.TypeCode).toBe(facilityFeeTransactionType.decreaseTypeCode);
        });

        it('sets the absolute value of the amountAmendment as the TransactionAmount when creating the fixed fees amendment bundle', async () => {
          await service.createAmountAmendmentForFixedFees(facilityIdentifier, decreaseAmountRequest);

          const createdBundleInAcbs = getBundleCreatedInAcbs();

          expect(createdBundleInAcbs.BundleMessageList[0].TransactionAmount).toBe(Math.abs(decreaseAmountRequest[0].amountAmendment));
        });
      });

      it('returns the WarningErrors from creating the fixed fees amendment bundle', async () => {
        when(createBundleInformation)
          .calledWith(acbsFixedFeesAmendmentForDecrease, idToken)
          .mockResolvedValueOnce({ ...acbsBundleCreatedResponse, WarningErrors: errorString });
        const response = await service.createAmountAmendmentForFixedFees(facilityIdentifier, decreaseAmountRequest);

        expect(response.warningErrors).toBe(errorString);
      });
    });

    const getBundleCreatedInAcbs = (): AcbsCreateBundleInformationRequestDto<FacilityFeeAmountTransaction> =>
      createBundleInformation.mock.calls[0][0] as AcbsCreateBundleInformationRequestDto<FacilityFeeAmountTransaction>;
  });

  const getFixedFeeAcbsPayload = (): AcbsCreateFacilityFixedFeeRequestDto => createFacilityFixedFeesAcbsService.mock.calls[0][2];
});
