import { GetFacilityGuaranteesGenerator } from '@ukef-test/support/generator/get-facility-guarantees.generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { when } from 'jest-when';

import { DateStringTransformations } from '../date/date-string.transformations';
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

  let facilityGuaranteeServiceGetGuaranteesForFacility: jest.Mock;
  let controller: FacilityGuaranteeController;

  beforeEach(() => {
    const facilityGuaranteeService = new FacilityGuaranteeService(null, null, null);
    facilityGuaranteeServiceGetGuaranteesForFacility = jest.fn();
    facilityGuaranteeService.getGuaranteesForFacility = facilityGuaranteeServiceGetGuaranteesForFacility;

    controller = new FacilityGuaranteeController(facilityGuaranteeService);
  });

  describe('getGuaranteesForFacility', () => {
    it('returns the guarantees from the service', async () => {
      when(facilityGuaranteeServiceGetGuaranteesForFacility).calledWith(facilityIdentifier).mockResolvedValueOnce(guaranteesFromService);

      const guarantees = await controller.getGuaranteesForFacility({ facilityIdentifier });

      expect(guarantees).toStrictEqual(guaranteesFromService);
    });

    it('does NOT return unexpected keys returned from the service', async () => {
      const guaranteesWithAnUnexpectedKey = guaranteesFromService.map((guarantee) => ({
        ...guarantee,
        unexpectedKey: valueGenerator.string(),
      }));
      when(facilityGuaranteeServiceGetGuaranteesForFacility).calledWith(facilityIdentifier).mockResolvedValueOnce(guaranteesWithAnUnexpectedKey);

      const guarantees = await controller.getGuaranteesForFacility({ facilityIdentifier });

      expect(guarantees).toStrictEqual(guaranteesFromService);
    });
  });
});
