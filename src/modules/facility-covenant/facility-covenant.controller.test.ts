import { GetFacilityCovenantGenerator } from '@ukef-test/support/generator/get-facility-covenant-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { when } from 'jest-when';

import { DateStringTransformations } from '../date/date-string.transformations';
import { FacilityCovenantController } from './facility-covenant.controller';
import { FacilityCovenantService } from './facility-covenant.service';

describe('FacilityCovenantController', () => {
  const valueGenerator = new RandomValueGenerator();
  const portfolioIdentifier = valueGenerator.string();
  const facilityIdentifier = valueGenerator.facilityId();

  const { facilityCovenantsFromApi: covenantsFromService } = new GetFacilityCovenantGenerator(valueGenerator, new DateStringTransformations()).generate({
    numberToGenerate: 2,
    facilityIdentifier,
    portfolioIdentifier,
  });

  let getFacilityCovenantsService: jest.Mock;
  let controller: FacilityCovenantController;

  beforeEach(() => {
    const facilityCovenantService = new FacilityCovenantService(null, null, null);
    getFacilityCovenantsService = jest.fn();
    facilityCovenantService.getCovenantsForFacility = getFacilityCovenantsService;

    controller = new FacilityCovenantController(facilityCovenantService);
  });

  describe('getCovenantsForFacility', () => {
    it('returns the covenants from the service', async () => {
      when(getFacilityCovenantsService).calledWith(facilityIdentifier).mockResolvedValueOnce(covenantsFromService);

      const covenants = await controller.getCovenantsForFacility({ facilityIdentifier });

      expect(covenants).toStrictEqual(covenantsFromService);
    });
  });
});
