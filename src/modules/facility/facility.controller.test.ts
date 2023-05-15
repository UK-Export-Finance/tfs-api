import { PROPERTIES } from '@ukef/constants';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { CreateFacilityGenerator } from '@ukef-test/support/generator/create-facility-generator';
import { GetFacilityGenerator } from '@ukef-test/support/generator/get-facility-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { when } from 'jest-when';

import { FacilityController } from './facility.controller';
import { FacilityService } from './facility.service';

jest.mock('./facility.service');

describe('FacilityController', () => {
  const valueGenerator = new RandomValueGenerator();
  const dateStringTransformations = new DateStringTransformations();
  const { portfolioIdentifier } = PROPERTIES.GLOBAL;
  const facilityIdentifier = valueGenerator.ukefId();

  let facilityService: FacilityService;
  let controller: FacilityController;

  let facilityServiceGetFacilityByIdentifier: jest.Mock;
  let facilityServiceCreateFacility: jest.Mock;

  beforeEach(() => {
    facilityService = new FacilityService(null, null, null, null);

    facilityServiceGetFacilityByIdentifier = jest.fn();
    facilityService.getFacilityByIdentifier = facilityServiceGetFacilityByIdentifier;

    facilityServiceCreateFacility = jest.fn();
    facilityService.createFacility = facilityServiceCreateFacility;

    controller = new FacilityController(facilityService);
  });

  describe('getFacilityByIdentifier', () => {
    const { facilitiesFromApi } = new GetFacilityGenerator(valueGenerator, dateStringTransformations).generate({
      numberToGenerate: 1,
      portfolioIdentifier,
      facilityIdentifier,
    });
    const facilityFromService = facilitiesFromApi[0];
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
});
