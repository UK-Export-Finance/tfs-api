import { GetFacilityGuaranteesGenerator } from '@ukef-test/support/generator/get-facility-guarantees.generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { when } from 'jest-when';

import { DateStringTransformations } from '../date/date-string.transformations';
import { CreateFacilityGuaranteeRequestItem } from './dto/create-facility-guarantee-request.dto';
import { CreateFacilityGuaranteeResponse } from './dto/create-facility-guarantee-response.dto';
import { FacilityGuaranteeController } from './facility-guarantee.controller';
import { FacilityGuaranteeService } from './facility-guarantee.service';

describe('FacilityGuaranteeController', () => {
  const valueGenerator = new RandomValueGenerator();
  const portfolioIdentifier = valueGenerator.string();
  const facilityIdentifier = valueGenerator.facilityId();

  const { facilityGuarantees: guaranteesFromService } = new GetFacilityGuaranteesGenerator(valueGenerator, new DateStringTransformations()).generate({
    numberToGenerate: 2,
    facilityIdentifier,
    portfolioIdentifier,
  });

  let getFacilityGuaranteesService: jest.Mock;
  let facilityGuaranteeServiceCreateGuaranteeForFacility: jest.Mock;
  let controller: FacilityGuaranteeController;

  beforeEach(() => {
    const facilityGuaranteeService = new FacilityGuaranteeService(null, null, null, null);
    getFacilityGuaranteesService = jest.fn();
    facilityGuaranteeService.getGuaranteesForFacility = getFacilityGuaranteesService;

    facilityGuaranteeServiceCreateGuaranteeForFacility = jest.fn();
    facilityGuaranteeService.createGuaranteeForFacility = facilityGuaranteeServiceCreateGuaranteeForFacility;

    controller = new FacilityGuaranteeController(facilityGuaranteeService);
  });

  describe('getGuaranteesForFacility', () => {
    it('returns the guarantees from the service', async () => {
      when(getFacilityGuaranteesService).calledWith(facilityIdentifier).mockResolvedValueOnce(guaranteesFromService);

      const guarantees = await controller.getGuaranteesForFacility({ facilityIdentifier });

      expect(guarantees).toStrictEqual(guaranteesFromService);
    });

    it('does NOT return unexpected keys returned from the service', async () => {
      const guaranteesWithAnUnexpectedKey = guaranteesFromService.map((guarantee) => ({
        ...guarantee,
        unexpectedKey: valueGenerator.string(),
      }));
      when(getFacilityGuaranteesService).calledWith(facilityIdentifier).mockResolvedValueOnce(guaranteesWithAnUnexpectedKey);

      const guarantees = await controller.getGuaranteesForFacility({ facilityIdentifier });

      expect(guarantees).toStrictEqual(guaranteesFromService);
    });
  });

  describe('createGuaranteeForFacility', () => {
    const facilityIdentifier = valueGenerator.facilityId();
    const limitKey = valueGenerator.acbsPartyId();
    const guarantorParty = valueGenerator.acbsPartyId();
    const guaranteeTypeCode = valueGenerator.stringOfNumericCharacters({ maxLength: 3 });
    const effectiveDate = valueGenerator.dateOnlyString();
    const guaranteeExpiryDate = valueGenerator.dateOnlyString();
    const maximumLiability = valueGenerator.nonnegativeFloat();

    const newGuarantee = new CreateFacilityGuaranteeRequestItem(
      facilityIdentifier,
      effectiveDate,
      limitKey,
      guaranteeExpiryDate,
      maximumLiability,
      guarantorParty,
      guaranteeTypeCode,
    );

    it('creates a guarantee for the facility with the service from the request body', async () => {
      await controller.createGuaranteeForFacility({ facilityIdentifier }, [newGuarantee]);

      expect(facilityGuaranteeServiceCreateGuaranteeForFacility).toHaveBeenCalledWith(facilityIdentifier, newGuarantee);
    });

    it('returns the facility identifier if creating the guarantee succeeds', async () => {
      const response = await controller.createGuaranteeForFacility({ facilityIdentifier }, [newGuarantee]);

      expect(response).toStrictEqual(new CreateFacilityGuaranteeResponse(facilityIdentifier));
    });

    it('does NOT include unexpected keys from the request body', async () => {
      const newGuaranteePlusUnexpectedKeys = { ...newGuarantee, unexpectedKey: 'unexpected value' };

      await controller.createGuaranteeForFacility({ facilityIdentifier }, [newGuaranteePlusUnexpectedKeys]);

      expect(facilityGuaranteeServiceCreateGuaranteeForFacility).toHaveBeenCalledWith(facilityIdentifier, newGuarantee);
    });
  });
});
