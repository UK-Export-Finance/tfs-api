import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { GetFacilityGuaranteeGenerator } from '@ukef-test/support/generator/get-facility-guarantee-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { when } from 'jest-when';

import { FacilityGuaranteeController } from './facility-guarantee.controller';
import { FacilityGuaranteeService } from './facility-guarantee.service';

describe('FacilityGuaranteeController', () => {
  const valueGenerator = new RandomValueGenerator();
  const portfolioIdentifier = valueGenerator.portfolioId();
  const facilityIdentifier = valueGenerator.facilityId();

  const { facilityGuarantees: guaranteesFromService } = new GetFacilityGuaranteeGenerator(valueGenerator, new DateStringTransformations()).generate({
    numberToGenerate: 2,
    facilityIdentifier,
    portfolioIdentifier,
  });

  let getFacilityGuaranteesService: jest.Mock;
  let controller: FacilityGuaranteeController;

  beforeEach(() => {
    const facilityGuaranteeService = new FacilityGuaranteeService(null, null, null, null);
    getFacilityGuaranteesService = jest.fn();
    facilityGuaranteeService.getGuaranteesForFacility = getFacilityGuaranteesService;

    controller = new FacilityGuaranteeController(facilityGuaranteeService);
  });

  describe('getGuaranteesForFacility', () => {
    it('returns the guarantees from the service', async () => {
      when(getFacilityGuaranteesService).calledWith(facilityIdentifier).mockResolvedValueOnce(guaranteesFromService);

      const guarantees = await controller.getGuaranteesForFacility({ facilityIdentifier });

      expect(guarantees).toStrictEqual(guaranteesFromService);
    });
  });
});
