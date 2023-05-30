import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';

import { CreateOrUpdateFacilityGuaranteeResponse } from './dto/create-facility-guarantee-response.dto';
import { UpdateFacilityGuaranteesRequestDto } from './dto/update-facility-guarantees-request.dto';
import { FacilityGuaranteeController } from './facility-guarantee.controller';
import { FacilityGuaranteeService } from './facility-guarantee.service';

describe('FacilityGuaranteeController', () => {
  const valueGenerator = new RandomValueGenerator();
  const facilityIdentifier = valueGenerator.facilityId();

  let updateFacilityGuaranteesService: jest.Mock;
  let controller: FacilityGuaranteeController;

  beforeEach(() => {
    const facilityGuaranteeService = new FacilityGuaranteeService(null, null, null, null);
    updateFacilityGuaranteesService = jest.fn();
    facilityGuaranteeService.updateGuaranteesForFacility = updateFacilityGuaranteesService;

    controller = new FacilityGuaranteeController(facilityGuaranteeService);
  });

  describe('updateGuaranteesForFacility', () => {
    const expirationDate = valueGenerator.dateOnlyString();
    const guaranteedLimit = valueGenerator.nonnegativeFloat();
    const updateGuaranteesRequest: UpdateFacilityGuaranteesRequestDto = { expirationDate, guaranteedLimit };

    it('updates the guarantees for the facility with the service using the fields supplied in the request body', async () => {
      await controller.updateGuaranteesForFacility({ facilityIdentifier }, updateGuaranteesRequest);

      expect(updateFacilityGuaranteesService).toHaveBeenCalledWith(facilityIdentifier, updateGuaranteesRequest);
    });

    it('returns the facility identifier if updating the guarantees succeeds', async () => {
      const response = await controller.updateGuaranteesForFacility({ facilityIdentifier }, updateGuaranteesRequest);

      expect(response).toStrictEqual(new CreateOrUpdateFacilityGuaranteeResponse(facilityIdentifier));
    });
  });
});
