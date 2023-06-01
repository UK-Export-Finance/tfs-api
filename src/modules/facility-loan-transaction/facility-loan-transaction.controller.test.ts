import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { GetFacilityLoanTransactionGenerator } from '@ukef-test/support/generator/get-facility-loan-transaction-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { when } from 'jest-when';

import { FacilityLoanTransactionController } from './facility-loan-transaction.controller';
import { FacilityLoanTransactionService } from './facility-loan-transaction.service';

jest.mock('./facility-loan-transaction.service');

describe('FacilityLoanTransactionController', () => {
  const valueGenerator = new RandomValueGenerator();
  const dateStringTransformations = new DateStringTransformations();
  const facilityIdentifier = valueGenerator.ukefId();
  const bundleIdentifier = valueGenerator.acbsBundleId();

  let facilityLoanTransactionService: FacilityLoanTransactionService;
  let controller: FacilityLoanTransactionController;

  let facilityLoanTransactionServiceGetLoanTransactionByBundleIdentifier: jest.Mock;

  beforeEach(() => {
    facilityLoanTransactionService = new FacilityLoanTransactionService(null, null, null);

    facilityLoanTransactionServiceGetLoanTransactionByBundleIdentifier = jest.fn();
    facilityLoanTransactionService.getLoanTransactionsByBundleIdentifier = facilityLoanTransactionServiceGetLoanTransactionByBundleIdentifier;

    controller = new FacilityLoanTransactionController(facilityLoanTransactionService);
  });

  describe('getLoanTransactionByBundleIdentifier', () => {
    const { apiFacilityLoanTransaction: expectedLoanTransaction } = new GetFacilityLoanTransactionGenerator(valueGenerator, dateStringTransformations).generate(
      {
        numberToGenerate: 1,
        facilityIdentifier,
      },
    );

    it('returns the loan transaction from the service', async () => {
      when(facilityLoanTransactionServiceGetLoanTransactionByBundleIdentifier).calledWith(bundleIdentifier).mockResolvedValueOnce(expectedLoanTransaction);

      const loanTransaction = await controller.getLoanTransactionByBundleIdentifier({ facilityIdentifier, bundleIdentifier });

      expect(loanTransaction).toStrictEqual(expectedLoanTransaction);
    });
  });
});
