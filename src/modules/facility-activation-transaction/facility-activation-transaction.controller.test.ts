import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { FacilityService } from '@ukef/modules/facility/facility.service';
import { FacilityActivationTransactionController } from '@ukef/modules/facility-activation-transaction/facility-activation-transaction.controller';
import { FacilityActivationTransactionService } from '@ukef/modules/facility-activation-transaction/facility-activation-transaction.service';
import { CreateFacilityActivationTransactionGenerator } from '@ukef-test/support/generator/create-facility-activation-transaction-generator';
import { GetFacilityActivationTransactionGenerator } from '@ukef-test/support/generator/get-facility-activation-transaction-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { Response } from 'express';
import { when } from 'jest-when';

describe('FacilityActivationTransactionController', () => {
  const valueGenerator = new RandomValueGenerator();
  const dateStringTransformations = new DateStringTransformations();
  const facilityIdentifier = valueGenerator.facilityId();
  const bundleIdentifier = valueGenerator.acbsBundleId();
  const borrowerPartyIdentifier = valueGenerator.acbsPartyId();
  const effectiveDate = valueGenerator.dateOnlyString();
  const obligorPartyIdentifier = valueGenerator.acbsPartyId();

  let facilityActivationTransactionService: FacilityActivationTransactionService;
  let facilityService: FacilityService;
  let controller: FacilityActivationTransactionController;

  let facilityActivationTransactionServiceCreateActivationTransactionForFacility: jest.Mock;
  let facilityActivationTransactionServiceGetActivationTransactionByBundleIdentifier: jest.Mock;
  let facilityServiceGetFacilityByIdentifier: jest.Mock;

  beforeEach(() => {
    facilityActivationTransactionService = new FacilityActivationTransactionService(null, null, null);
    facilityService = new FacilityService(null, null, null, null, null);

    facilityActivationTransactionServiceCreateActivationTransactionForFacility = jest.fn(() => ({
      bundleIdentifier: bundleIdentifier,
    }));
    facilityActivationTransactionServiceGetActivationTransactionByBundleIdentifier = jest.fn();
    facilityServiceGetFacilityByIdentifier = jest.fn();
    facilityActivationTransactionService.createActivationTransactionForFacility = facilityActivationTransactionServiceCreateActivationTransactionForFacility;
    facilityActivationTransactionService.getActivationTransactionByBundleIdentifier =
      facilityActivationTransactionServiceGetActivationTransactionByBundleIdentifier;
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

    const res: Response = {
      header: jest.fn().mockReturnThis(),
    } as any;

    it('returns the bundle identifier if creating the activation-transaction succeeds', async () => {
      when(facilityServiceGetFacilityByIdentifier).calledWith(facilityIdentifier).mockResolvedValueOnce({
        obligorPartyIdentifier,
        effectiveDate,
      });
      when(facilityActivationTransactionServiceCreateActivationTransactionForFacility)
        .calledWith(facilityIdentifier, obligorPartyIdentifier, effectiveDate, requestBodyToCreateFacilityActivationTransaction[0])
        .mockResolvedValueOnce({ BundleIdentifier: bundleIdentifier, WarningErrors: '' });

      const response = await controller.createActivationTransactionForFacility({ facilityIdentifier }, requestBodyToCreateFacilityActivationTransaction, res);

      expect(response).toStrictEqual(createFacilityActivationTransactionResponseFromService);
    });

    it(`sets 'processing-warning' header if WarningErrors exists on the service response`, async () => {
      when(facilityServiceGetFacilityByIdentifier).calledWith(facilityIdentifier).mockResolvedValueOnce({
        obligorPartyIdentifier,
        effectiveDate,
      });
      when(facilityActivationTransactionServiceCreateActivationTransactionForFacility)
        .calledWith(facilityIdentifier, obligorPartyIdentifier, effectiveDate, requestBodyToCreateFacilityActivationTransaction[0])
        .mockResolvedValueOnce({ BundleIdentifier: bundleIdentifier, WarningErrors: 'error' });

      await controller.createActivationTransactionForFacility({ facilityIdentifier }, requestBodyToCreateFacilityActivationTransaction, res);

      expect(res.header).toHaveBeenCalledTimes(1);
      expect(res.header).toHaveBeenCalledWith('processing-warning', 'error');
    });
  });

  describe('getActivationTransactionByBundleIdentifier', () => {
    const { apiFacilityActivationTransaction: expectedActivationTransaction } = new GetFacilityActivationTransactionGenerator(
      valueGenerator,
      dateStringTransformations,
    ).generate({
      numberToGenerate: 1,
      facilityIdentifier,
    });

    it('returns the activation transaction from the service', async () => {
      when(facilityActivationTransactionServiceGetActivationTransactionByBundleIdentifier)
        .calledWith(bundleIdentifier)
        .mockResolvedValueOnce(expectedActivationTransaction);

      const activationTransaction = await controller.getActivationTransactionByBundleIdentifier({ facilityIdentifier, bundleIdentifier });

      expect(activationTransaction).toStrictEqual(expectedActivationTransaction);
    });
  });
});
