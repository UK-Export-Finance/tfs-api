import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { FacilityService } from '@ukef/modules/facility/facility.service';
import { CreateOrUpdateFacilityCovenantsResponseDto } from '@ukef/modules/facility-covenant/dto/create-or-update-covenants-response.dto';
import { FacilityCovenantController } from '@ukef/modules/facility-covenant/facility-covenant.controller';
import { FacilityCovenantService } from '@ukef/modules/facility-covenant/facility-covenant.service';
import { CreateFacilityCovenantGenerator } from '@ukef-test/support/generator/create-facility-covenant-generator';
import { GetFacilityCovenantGenerator } from '@ukef-test/support/generator/get-facility-covenant-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { when } from 'jest-when';

describe('FacilityCovenantController', () => {
  const valueGenerator = new RandomValueGenerator();
  const dateStringTransformations = new DateStringTransformations();
  const facilityIdentifier = valueGenerator.facilityId();

  let facilityCovenantService: FacilityCovenantService;
  let facilityService: FacilityService;
  let controller: FacilityCovenantController;

  let facilityCovenantServiceCreateCovenantForFacility: jest.Mock;
  let facilityCovenantServiceGetCovenantsForFacility: jest.Mock;
  let facilityCovenantServiceUpdateCovenantForFacility: jest.Mock;
  let facilityServiceGetFacilityByIdentifier: jest.Mock;

  beforeEach(() => {
    facilityCovenantService = new FacilityCovenantService(null, null, null);
    facilityService = new FacilityService(null, null, null, null, null);

    facilityCovenantServiceCreateCovenantForFacility = jest.fn();
    facilityCovenantServiceGetCovenantsForFacility = jest.fn();
    facilityCovenantServiceUpdateCovenantForFacility = jest.fn();
    facilityServiceGetFacilityByIdentifier = jest.fn();
    facilityCovenantService.createCovenantForFacility = facilityCovenantServiceCreateCovenantForFacility;
    facilityCovenantService.getCovenantsForFacility = facilityCovenantServiceGetCovenantsForFacility;
    facilityCovenantService.updateCovenantsForFacility = facilityCovenantServiceUpdateCovenantForFacility;
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

      expect(response).toStrictEqual(new CreateOrUpdateFacilityCovenantsResponseDto(facilityIdentifier));
    });
  });

  describe('getCovenantsForFacility', () => {
    const portfolioIdentifier = valueGenerator.portfolioId();

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

  describe('updateCovenantsForFacility', () => {
    const expirationDate = valueGenerator.dateOnlyString();
    const targetAmount = valueGenerator.nonnegativeFloat();
    const updateCovenantRequest = { expirationDate, targetAmount };

    it('updates the covenants for the facility with the service using the fields supplied in the request body', async () => {
      await controller.updateCovenantsForFacility({ facilityIdentifier }, updateCovenantRequest);

      expect(facilityCovenantServiceUpdateCovenantForFacility).toHaveBeenCalledWith(facilityIdentifier, updateCovenantRequest);
    });

    it('returns the facility identifier if updating the covenants succeeds', async () => {
      const response = await controller.updateCovenantsForFacility({ facilityIdentifier }, updateCovenantRequest);

      expect(response).toStrictEqual(new CreateOrUpdateFacilityCovenantsResponseDto(facilityIdentifier));
    });
  });
});
