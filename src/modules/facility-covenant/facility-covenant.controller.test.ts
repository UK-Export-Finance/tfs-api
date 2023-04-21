import { CreateFacilityCovenantGenerator } from '@ukef-test/support/generator/create-facility-covenant-generator';
import { GetFacilityCovenantGenerator } from '@ukef-test/support/generator/get-facility-covenant-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { when } from 'jest-when';

import { DateStringTransformations } from '../date/date-string.transformations';
import { FacilityService } from '../facility/facility.service';
import { CreateFacilityCovenantResponseDto } from './dto/create-facility-covenant-response.dto';
import { FacilityCovenantController } from './facility-covenant.controller';
import { FacilityCovenantService } from './facility-covenant.service';

describe('FacilityCovenantController', () => {
  const valueGenerator = new RandomValueGenerator();
  const dateStringTransformations = new DateStringTransformations();
  const facilityIdentifier = valueGenerator.facilityId();

  let facilityCovenantService: FacilityCovenantService;
  let facilityService: FacilityService;
  let controller: FacilityCovenantController;

  let facilityCovenantServiceCreateCovenantForFacility: jest.Mock;
  let facilityCovenantServiceGetCovenantsForFacility: jest.Mock;
  let facilityServiceGetFacilityByIdentifier: jest.Mock;

  beforeEach(() => {
    facilityCovenantService = new FacilityCovenantService(null, null, null);
    facilityService = new FacilityService(null, null, null);

    facilityCovenantServiceCreateCovenantForFacility = jest.fn();
    facilityCovenantServiceGetCovenantsForFacility = jest.fn();
    facilityServiceGetFacilityByIdentifier = jest.fn();
    facilityCovenantService.createCovenantForFacility = facilityCovenantServiceCreateCovenantForFacility;
    facilityCovenantService.getCovenantsForFacility = facilityCovenantServiceGetCovenantsForFacility;
    facilityService.getFacilityByIdentifier = facilityServiceGetFacilityByIdentifier;

    controller = new FacilityCovenantController(facilityCovenantService, facilityService);
  });

  describe('createCovenantForFacility', () => {
    const facilityTypeCode = valueGenerator.stringOfNumericCharacters();
    const limitKeyValue = valueGenerator.string();

    const { requestBodyToCreateFacilityCovenant } = new CreateFacilityCovenantGenerator(valueGenerator, dateStringTransformations).generate({
      numberToGenerate: 1,
      facilityIdentifier,
      facilityTypeCode,
      limitKeyValue,
    });

    it('creates a covenant for the facility with the service from the request body', async () => {
      when(facilityServiceGetFacilityByIdentifier).calledWith(facilityIdentifier).mockResolvedValueOnce({
        productTypeId: facilityTypeCode,
        obligorPartyIdentifier: limitKeyValue,
      });

      await controller.createCovenantForFacility({ facilityIdentifier }, requestBodyToCreateFacilityCovenant);

      expect(facilityCovenantServiceCreateCovenantForFacility).toHaveBeenCalledWith(
        facilityIdentifier,
        facilityTypeCode,
        limitKeyValue,
        requestBodyToCreateFacilityCovenant[0],
      );
    });

    it('returns the facility identifier if creating the covenant succeeds', async () => {
      when(facilityServiceGetFacilityByIdentifier).calledWith(facilityIdentifier).mockResolvedValueOnce({
        productTypeId: facilityTypeCode,
        obligorPartyIdentifier: limitKeyValue,
      });

      const response = await controller.createCovenantForFacility({ facilityIdentifier }, requestBodyToCreateFacilityCovenant);

      expect(response).toStrictEqual(new CreateFacilityCovenantResponseDto(facilityIdentifier));
    });
  });

  describe('getCovenantsForFacility', () => {
    const portfolioIdentifier = valueGenerator.string();

    const { facilityCovenantsFromApi: covenantsFromService } = new GetFacilityCovenantGenerator(valueGenerator, dateStringTransformations).generate({
      numberToGenerate: 2,
      facilityIdentifier,
      portfolioIdentifier,
    });

    it('returns the covenants from the service', async () => {
      when(facilityCovenantServiceGetCovenantsForFacility).calledWith(facilityIdentifier).mockResolvedValueOnce(covenantsFromService);

      const covenants = await controller.getCovenantsForFacility({ facilityIdentifier });

      expect(covenants).toStrictEqual(covenantsFromService);
    });
  });
});
