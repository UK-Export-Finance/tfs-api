import { ENUMS } from '@ukef/constants';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { FacilityService } from '@ukef/modules/facility/facility.service';
import { FacilityFixedFeeController } from '@ukef/modules/facility-fixed-fee/facility-fixed-fee.controller';
import { FacilityFixedFeeService } from '@ukef/modules/facility-fixed-fee/facility-fixed-fee.service';
import { CreateFacilityFixedFeeGenerator } from '@ukef-test/support/generator/create-facility-fixed-fee-generator';
import { CreateFacilityFixedFeesAmountAmendmentGenerator } from '@ukef-test/support/generator/create-facility-fixed-fees-amount-amendment.generator';
import { GetFacilityFixedFeeGenerator } from '@ukef-test/support/generator/get-facility-fixed-fee-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { when } from 'jest-when';

describe('FacilityFixedFeeController', () => {
  const valueGenerator = new RandomValueGenerator();
  const portfolioIdentifier = valueGenerator.portfolioId();
  const facilityIdentifier = valueGenerator.facilityId();
  const errorString = valueGenerator.string();

  const { apiFacilityFixedFees: serviceFixedFees } = new GetFacilityFixedFeeGenerator(valueGenerator, new DateStringTransformations()).generate({
    numberToGenerate: 2,
    facilityIdentifier,
    portfolioIdentifier,
  });

  let getFacilityFixedFeesService: jest.Mock;
  let createFacilityFixedFeesService: jest.Mock;
  let createAmountAmendmentForFixedFeesService: jest.Mock;
  let getFacilityByIdentifierFacilityService: jest.Mock;

  let controller: FacilityFixedFeeController;

  beforeEach(() => {
    const facilityFixedFeeService = new FacilityFixedFeeService(null, null, null, null, null);
    getFacilityFixedFeesService = jest.fn();
    createFacilityFixedFeesService = jest.fn();
    createAmountAmendmentForFixedFeesService = jest.fn();
    facilityFixedFeeService.getFixedFeesForFacility = getFacilityFixedFeesService;
    facilityFixedFeeService.createFixedFeeForFacility = createFacilityFixedFeesService;
    facilityFixedFeeService.createAmountAmendmentForFixedFees = createAmountAmendmentForFixedFeesService;

    const facilityService = new FacilityService(null, null, null, null, null);
    getFacilityByIdentifierFacilityService = jest.fn();
    facilityService.getFacilityByIdentifier = getFacilityByIdentifierFacilityService;

    controller = new FacilityFixedFeeController(facilityFixedFeeService, facilityService);
  });

  describe('getFixedFeesForFacility', () => {
    it('returns the fixed fees from the service', async () => {
      when(getFacilityFixedFeesService).calledWith(facilityIdentifier).mockResolvedValueOnce(serviceFixedFees);

      const fixedFees = await controller.getFixedFeesForFacility({ facilityIdentifier });

      expect(fixedFees).toStrictEqual(serviceFixedFees);
    });
  });

  describe('createFixedFeeForFacility', () => {
    const facilityTypeCode = valueGenerator.enumValue(ENUMS.FACILITY_TYPE_IDS);
    const borrowerPartyIdentifier = valueGenerator.acbsPartyId();

    const { requestBodyToCreateFacilityFixedFee } = new CreateFacilityFixedFeeGenerator(valueGenerator, new DateStringTransformations()).generate({
      numberToGenerate: 1,
      facilityTypeCode,
      borrowerPartyIdentifier,
    });

    it('creates a fixed fee for the facility with the service from the request body', async () => {
      when(getFacilityByIdentifierFacilityService).calledWith(facilityIdentifier).mockResolvedValueOnce({
        productTypeId: facilityTypeCode,
        obligorPartyIdentifier: borrowerPartyIdentifier,
        facilityOverallStatus: ENUMS.FACILITY_STATUSES.ACTIVE,
        facilityStageCode: ENUMS.FACILITY_STAGES.ISSUED,
      });

      await controller.createFixedFeeForFacility({ facilityIdentifier }, requestBodyToCreateFacilityFixedFee);

      expect(createFacilityFixedFeesService).toHaveBeenCalledWith(
        facilityIdentifier,
        borrowerPartyIdentifier,
        facilityTypeCode,
        requestBodyToCreateFacilityFixedFee[0],
        ENUMS.FACILITY_STATUSES.ACTIVE,
        ENUMS.FACILITY_STAGES.ISSUED,
      );
    });

    it('returns the facility identifier if creating the fixed fee succeeds', async () => {
      when(getFacilityByIdentifierFacilityService).calledWith(facilityIdentifier).mockResolvedValueOnce({
        productTypeId: facilityTypeCode,
        obligorPartyIdentifier: borrowerPartyIdentifier,
        facilityOverallStatus: ENUMS.FACILITY_STATUSES.ACTIVE,
        facilityStageCode: ENUMS.FACILITY_STAGES.ISSUED,
      });

      const response = await controller.createFixedFeeForFacility({ facilityIdentifier }, requestBodyToCreateFacilityFixedFee);

      expect(response).toEqual({ facilityIdentifier });
    });
  });

  describe('createAmountAmendmentForFixedFees', () => {
    const facilityIdentifier = valueGenerator.facilityId();
    const { increaseAmountRequest } = new CreateFacilityFixedFeesAmountAmendmentGenerator(valueGenerator, new DateStringTransformations()).generate({
      numberToGenerate: 3,
      facilityIdentifier,
    });
    const expectedBundleIdentifier = valueGenerator.acbsBundleId();

    it('returns the bundleIdentifier and warningErrors from creating a loan amount amendment with the service', async () => {
      when(createAmountAmendmentForFixedFeesService)
        .calledWith(facilityIdentifier, increaseAmountRequest)
        .mockResolvedValueOnce({ bundleIdentifier: expectedBundleIdentifier, warningErrors: errorString });

      const bundleIdentifierResponse = await controller.createAmountAmendmentForFixedFees({ facilityIdentifier }, increaseAmountRequest);

      expect(bundleIdentifierResponse).toStrictEqual({ bundleIdentifier: expectedBundleIdentifier, warningErrors: errorString });
    });

    it(`returns undefined warningErrors if warningErrors is undefined on the service response`, async () => {
      when(createAmountAmendmentForFixedFeesService)
        .calledWith(facilityIdentifier, increaseAmountRequest)
        .mockResolvedValueOnce({ bundleIdentifier: expectedBundleIdentifier, warningErrors: undefined });

      const bundleIdentifierResponse = await controller.createAmountAmendmentForFixedFees({ facilityIdentifier }, increaseAmountRequest);

      expect(bundleIdentifierResponse).toStrictEqual({ bundleIdentifier: expectedBundleIdentifier, warningErrors: undefined });
    });
  });
});
