import { ENUMS, PROPERTIES } from '@ukef/constants';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { UpdateFacilityByOperationQueryDto } from '@ukef/modules/facility/dto/update-facility-by-operation-query.dto';
import { FacilityController } from '@ukef/modules/facility/facility.controller';
import { withUpdateFacilityControllerGeneralTests } from '@ukef/modules/facility/facility.controller.update-facility.test-parts/update-facility-controller-general-tests';
import { FacilityService } from '@ukef/modules/facility/facility.service';
import { CreateFacilityGenerator } from '@ukef-test/support/generator/create-facility-generator';
import { GetFacilityGenerator } from '@ukef-test/support/generator/get-facility-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { UpdateFacilityGenerator } from '@ukef-test/support/generator/update-facility-generator';
import { when } from 'jest-when';

jest.mock('./facility.service');

describe('FacilityController', () => {
  const valueGenerator = new RandomValueGenerator();
  const dateStringTransformations = new DateStringTransformations();
  const { portfolioIdentifier } = PROPERTIES.GLOBAL;
  const facilityIdentifier = valueGenerator.ukefId();
  const errorString = valueGenerator.string();

  let controller: FacilityController;

  const facilityService = new FacilityService(null, null, null, null, null);

  const facilityServiceGetFacilityByIdentifier = jest.fn();
  facilityService.getFacilityByIdentifier = facilityServiceGetFacilityByIdentifier;

  const facilityServiceCreateFacility = jest.fn();
  facilityService.createFacility = facilityServiceCreateFacility;

  const facilityServiceIssueFacilityByIdentifier = jest.fn();
  facilityService.issueFacilityByIdentifier = facilityServiceIssueFacilityByIdentifier;

  const facilityServiceAmendFacilityExpiryDateByIdentifier = jest.fn();
  facilityService.amendFacilityExpiryDateByIdentifier = facilityServiceAmendFacilityExpiryDateByIdentifier;

  const facilityServiceAmendFacilityAmountByIdentifier = jest.fn();
  facilityService.amendFacilityAmountByIdentifier = facilityServiceAmendFacilityAmountByIdentifier;

  beforeEach(() => {
    jest.resetAllMocks();

    controller = new FacilityController(facilityService);
  });

  describe('getFacilityByIdentifier', () => {
    const { facilitiesFromApi } = new GetFacilityGenerator(valueGenerator, dateStringTransformations).generate({
      numberToGenerate: 1,
      portfolioIdentifier,
      facilityIdentifier,
    });
    const [facilityFromService] = facilitiesFromApi;
    const expectedFacility = facilityFromService;

    it('returns the facility from the service', async () => {
      when(facilityServiceGetFacilityByIdentifier).calledWith(facilityIdentifier).mockResolvedValueOnce(facilityFromService);

      const facility = await controller.getFacilityByIdentifier({ facilityIdentifier });

      expect(facility).toStrictEqual(expectedFacility);
    });

    it('does NOT return unexpected keys for the facility from the service', async () => {
      const facilityWithUnexpectedKey = {
        ...facilityFromService,
        unexpectedKey: valueGenerator.string(),
      };
      when(facilityServiceGetFacilityByIdentifier).calledWith(facilityIdentifier).mockResolvedValueOnce(facilityWithUnexpectedKey);

      const facility = await controller.getFacilityByIdentifier({ facilityIdentifier });

      expect(facility).toStrictEqual(expectedFacility);
    });
  });

  describe('createFacility', () => {
    const { createFacilityRequestItem: newFacility } = new CreateFacilityGenerator(valueGenerator, dateStringTransformations).generate({
      numberToGenerate: 1,
      facilityIdentifier,
    });

    it('creates a facility with the service', async () => {
      await controller.createFacility([newFacility]);

      expect(facilityServiceCreateFacility).toHaveBeenCalledWith(newFacility);
    });

    it('returns the facility identifier if creating the facility succeeds', async () => {
      const response = await controller.createFacility([newFacility]);

      expect(response).toStrictEqual({ facilityIdentifier });
    });
  });

  describe('updateFacility', () => {
    const { updateFacilityRequest } = new UpdateFacilityGenerator(valueGenerator, dateStringTransformations).generate({
      numberToGenerate: 1,
      facilityIdentifier,
    });

    const updateFacilityByOperationParams = { facilityIdentifier };
    const bundleIdentifier = valueGenerator.acbsBundleId();

    describe.each([
      { op: ENUMS.FACILITY_UPDATE_OPERATIONS.ISSUE, serviceMethod: facilityServiceIssueFacilityByIdentifier },
      { op: ENUMS.FACILITY_UPDATE_OPERATIONS.AMEND_EXPIRY_DATE, serviceMethod: facilityServiceAmendFacilityExpiryDateByIdentifier },
      { op: ENUMS.FACILITY_UPDATE_OPERATIONS.AMEND_AMOUNT, serviceMethod: facilityServiceAmendFacilityAmountByIdentifier },
    ])('$op', ({ op, serviceMethod }) => {
      const query: UpdateFacilityByOperationQueryDto = { op };

      const expectedResponse = op === ENUMS.FACILITY_UPDATE_OPERATIONS.AMEND_AMOUNT ? { bundleIdentifier, warningErrors: errorString } : { facilityIdentifier };

      withUpdateFacilityControllerGeneralTests({
        updateFacilityRequest,
        serviceMethod,
        facilityIdentifier,
        expectedResponse,
        getGivenUpdateRequestWouldOtherwiseSucceed: () => givenUpdateRequestWouldOtherwiseSucceed(),
        makeRequest: () => controller.updateFacilityByOperation(query, updateFacilityByOperationParams, updateFacilityRequest),
      });

      const givenUpdateRequestWouldOtherwiseSucceed = () => {
        if (op === ENUMS.FACILITY_UPDATE_OPERATIONS.AMEND_AMOUNT) {
          return when(serviceMethod)
            .calledWith(facilityIdentifier, updateFacilityRequest)
            .mockResolvedValueOnce({ bundleIdentifier: bundleIdentifier, warningErrors: errorString });
        }
        return () => {};
      };
    });

    describe('amendAmount', () => {
      it(`warningErrors is undefined if they're undefined on the service response`, async () => {
        when(facilityServiceAmendFacilityAmountByIdentifier)
          .calledWith(facilityIdentifier, updateFacilityRequest)
          .mockResolvedValueOnce({ bundleIdentifier: bundleIdentifier, warningErrors: undefined });

        const response = await controller.updateFacilityByOperation(
          { op: ENUMS.FACILITY_UPDATE_OPERATIONS.AMEND_AMOUNT },
          updateFacilityByOperationParams,
          updateFacilityRequest,
        );

        expect(response).toStrictEqual({ bundleIdentifier: bundleIdentifier, warningErrors: undefined });
      });
    });
  });
});
