import { GetFacilityFixedFeeGenerator } from '@ukef-test/support/generator/get-facility-fixed-fee-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { when } from 'jest-when';

import { DateStringTransformations } from '../date/date-string.transformations';
import { FacilityFixedFeeController } from '../facility-fixed-fee/facility-fixed-fee.controller';
import { FacilityFixedFeeService } from '../facility-fixed-fee/facility-fixed-fee.service';

describe('FacilityFixedFeeController', () => {
  const valueGenerator = new RandomValueGenerator();
  const portfolioIdentifier = valueGenerator.string();
  const facilityIdentifier = valueGenerator.facilityId();

  const { apiFacilityFixedFees: serviceFixedFees } = new GetFacilityFixedFeeGenerator(valueGenerator, new DateStringTransformations()).generate({
    numberToGenerate: 2,
    facilityIdentifier,
    portfolioIdentifier,
  });

  let getFacilityFixedFeesService: jest.Mock;
  let controller: FacilityFixedFeeController;

  beforeEach(() => {
    const facilityFixedFeeService = new FacilityFixedFeeService(null, null, null);
    getFacilityFixedFeesService = jest.fn();
    facilityFixedFeeService.getFixedFeesForFacility = getFacilityFixedFeesService;

    controller = new FacilityFixedFeeController(facilityFixedFeeService);
  });

  describe('getFixedFeesForFacility', () => {
    it('returns the fixed fees from the service', async () => {
      when(getFacilityFixedFeesService).calledWith(facilityIdentifier).mockResolvedValueOnce(serviceFixedFees);

      const fixedFees = await controller.getFixedFeesForFacility({ facilityIdentifier });

      expect(fixedFees).toStrictEqual(serviceFixedFees);
    });
  });
});
