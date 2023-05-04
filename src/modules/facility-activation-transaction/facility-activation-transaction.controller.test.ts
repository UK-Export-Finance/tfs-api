import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { FacilityService } from '@ukef/modules/facility/facility.service';
import { CreateFacilityActivationTransactionGenerator } from '@ukef-test/support/generator/create-facility-activation-transaction-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { when } from 'jest-when';

import { FacilityActivationTransactionController } from './facility-activation-transaction.controller';
import { FacilityActivationTransactionService } from './facility-activation-transaction.service';

describe('FacilityActivationTransactionController', () => {
  const valueGenerator = new RandomValueGenerator();
  const dateStringTransformations = new DateStringTransformations();
  const facilityIdentifier = valueGenerator.facilityId();
  const bundleIdentifier = valueGenerator.acbsBundleId();
  const borrowerPartyIdentifier = valueGenerator.acbsPartyId();
  const effectiveDate = valueGenerator.dateOnlyString();
  //const effectiveDateOnly = dateStringTransformations.removeTime(effectiveDate);
  const obligorPartyIdentifier = valueGenerator.acbsPartyId();

  let facilityActivationTransactionService: FacilityActivationTransactionService;
  let facilityService: FacilityService;
  let controller: FacilityActivationTransactionController;

  let facilityActivationTransactionServiceCreateActivationTransactionForFacility: jest.Mock;
  let facilityServiceGetFacilityByIdentifier: jest.Mock;

  beforeEach(() => {
    facilityActivationTransactionService = new FacilityActivationTransactionService(null, null, null);
    facilityService = new FacilityService(null, null, null, null);

    facilityActivationTransactionServiceCreateActivationTransactionForFacility = jest.fn(() => ({
      bundleIdentifier: bundleIdentifier,
    }));
    facilityServiceGetFacilityByIdentifier = jest.fn();
    facilityActivationTransactionService.createActivationTransactionForFacility = facilityActivationTransactionServiceCreateActivationTransactionForFacility;
    facilityService.getFacilityByIdentifier = facilityServiceGetFacilityByIdentifier;

    controller = new FacilityActivationTransactionController(facilityActivationTransactionService, facilityService);
  });

  describe('createActivationTransactionForFacility', () => {
    const { requestBodyToCreateFacilityActivationTransaction, createFacilityActivationTransactionResponseFromService } =
      new CreateFacilityActivationTransactionGenerator(valueGenerator, dateStringTransformations).generate({
        numberToGenerate: 1,
        facilityIdentifier,
        bundleIdentifier,
        borrowerPartyIdentifier,
        effectiveDate,
      });

    it('creates a activation-transaction for the facility with the service from the request body', async () => {
      when(facilityServiceGetFacilityByIdentifier).calledWith(facilityIdentifier).mockResolvedValueOnce({
        obligorPartyIdentifier,
        effectiveDate,
      });

      await controller.createActivationTransactionForFacility({ facilityIdentifier }, requestBodyToCreateFacilityActivationTransaction);

      expect(facilityActivationTransactionServiceCreateActivationTransactionForFacility).toHaveBeenCalledWith(
        facilityIdentifier,
        obligorPartyIdentifier,
        effectiveDate,
        requestBodyToCreateFacilityActivationTransaction[0],
      );
    });

    it('returns the bundle identifier if creating the activation-transaction succeeds', async () => {
      when(facilityServiceGetFacilityByIdentifier).calledWith(facilityIdentifier).mockResolvedValueOnce({
        obligorPartyIdentifier,
        effectiveDate,
      });

      const response = await controller.createActivationTransactionForFacility({ facilityIdentifier }, requestBodyToCreateFacilityActivationTransaction);

      expect(response).toStrictEqual(createFacilityActivationTransactionResponseFromService);
    });
  });
});
