import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';

import { CreateFacilityGuaranteeRequestItem } from './dto/create-facility-guarantee-request.dto';
import { CreateOrUpdateFacilityGuaranteeResponse } from './dto/create-facility-guarantee-response.dto';
import { FacilityGuaranteeController } from './facility-guarantee.controller';
import { FacilityGuaranteeService } from './facility-guarantee.service';

describe('FacilityGuaranteeController', () => {
  const valueGenerator = new RandomValueGenerator();

  let facilityGuaranteeServiceCreateGuaranteeForFacility: jest.Mock;
  let controller: FacilityGuaranteeController;

  beforeEach(() => {
    const facilityGuaranteeService = new FacilityGuaranteeService(null, null, null, null);
    facilityGuaranteeServiceCreateGuaranteeForFacility = jest.fn();
    facilityGuaranteeService.createGuaranteeForFacility = facilityGuaranteeServiceCreateGuaranteeForFacility;

    controller = new FacilityGuaranteeController(facilityGuaranteeService);
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

      expect(response).toStrictEqual(new CreateOrUpdateFacilityGuaranteeResponse(facilityIdentifier));
    });
  });
});
