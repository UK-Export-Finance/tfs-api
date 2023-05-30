import { ENUMS, PROPERTIES } from '@ukef/constants';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { CreateFacilityGenerator } from '@ukef-test/support/generator/create-facility-generator';
import { GetFacilityGenerator } from '@ukef-test/support/generator/get-facility-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { UpdateFacilityGenerator } from '@ukef-test/support/generator/update-facility-generator';
import { when } from 'jest-when';

import { UpdateFacilityByOperationQueryDto } from './dto/update-facility-by-operation-query.dto';
import { FacilityController } from './facility.controller';
import { FacilityService } from './facility.service';

jest.mock('./facility.service');

describe('FacilityController', () => {
  const valueGenerator = new RandomValueGenerator();
  const dateStringTransformations = new DateStringTransformations();
  const { portfolioIdentifier } = PROPERTIES.GLOBAL;
  const facilityIdentifier = valueGenerator.ukefId();

  let controller: FacilityController;

  const facilityService = new FacilityService(null, null, null, null);

  const facilityServiceGetFacilityByIdentifier = jest.fn();
  facilityService.getFacilityByIdentifier = facilityServiceGetFacilityByIdentifier;

  const facilityServiceCreateFacility = jest.fn();
  facilityService.createFacility = facilityServiceCreateFacility;

  const facilityServiceIssueFacilityByIdentifier = jest.fn();
  facilityService.issueFacilityByIdentifier = facilityServiceIssueFacilityByIdentifier;

  const facilityServiceAmendExpiryDateByIdentifier = jest.fn();
  facilityService.amendFacilityExpiryDateByIdentifier = facilityServiceAmendExpiryDateByIdentifier;

  beforeEach(() => {
    facilityServiceGetFacilityByIdentifier.mockReset();
    facilityServiceCreateFacility.mockReset();
    facilityServiceIssueFacilityByIdentifier.mockReset();
    facilityServiceAmendExpiryDateByIdentifier.mockReset();

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

  describe.each([
    { op: ENUMS.FACILITY_UPDATE_OPERATIONS.ISSUE, serviceMethod: facilityServiceIssueFacilityByIdentifier },
    { op: ENUMS.FACILITY_UPDATE_OPERATIONS.AMEND_EXPIRY_DATE, serviceMethod: facilityServiceAmendExpiryDateByIdentifier },
  ])('updateFacility $op', ({ op, serviceMethod }) => {
    const { updateFacilityRequest } = new UpdateFacilityGenerator(valueGenerator, dateStringTransformations).generate({
      numberToGenerate: 1,
      facilityIdentifier,
    });

    const query: UpdateFacilityByOperationQueryDto = { op };
    const updateFacilityByOperationParams = { facilityIdentifier };

    it(`calls if called with ${op} enum`, async () => {
      await controller.updateFacilityByOperation(query, updateFacilityByOperationParams, updateFacilityRequest);

      expect(serviceMethod).toHaveBeenCalledWith(facilityIdentifier, updateFacilityRequest);
    });

    it(`returns the facility identifier if updating the facility succeeds if called with ${op} enum`, async () => {
      const response = await controller.updateFacilityByOperation(query, updateFacilityByOperationParams, updateFacilityRequest);

      expect(response).toStrictEqual({ facilityIdentifier });
    });
  });
});
