import { CreateFacilityLoanAmountAmendmentGenerator } from '@ukef-test/support/generator/create-facility-loan-amount-amendment.generator';
import { GetFacilityLoanGenerator } from '@ukef-test/support/generator/get-facility-loan-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { when } from 'jest-when';

import { DateStringTransformations } from '../date/date-string.transformations';
import { FacilityLoanController } from './facility-loan.controller';
import { FacilityLoanService } from './facility-loan.service';

describe('FacilityLoanController', () => {
  const valueGenerator = new RandomValueGenerator();
  const portfolioIdentifier = valueGenerator.portfolioId();
  const facilityIdentifier = valueGenerator.facilityId();

  let getFacilityLoansService: jest.Mock;
  let createAmountAmendmentForLoanService: jest.Mock;
  let controller: FacilityLoanController;

  beforeEach(() => {
    const facilityLoanService = new FacilityLoanService(null, null, null, null);
    getFacilityLoansService = jest.fn();
    facilityLoanService.getLoansForFacility = getFacilityLoansService;

    createAmountAmendmentForLoanService = jest.fn();
    facilityLoanService.createAmountAmendmentForLoan = createAmountAmendmentForLoanService;

    controller = new FacilityLoanController(facilityLoanService);
  });

  describe('getLoansForFacility', () => {
    const { facilityLoansFromApi: loansFromService } = new GetFacilityLoanGenerator(valueGenerator, new DateStringTransformations()).generate({
      numberToGenerate: 2,
      facilityIdentifier,
      portfolioIdentifier,
    });

    it('returns the loans from the service', async () => {
      when(getFacilityLoansService).calledWith(facilityIdentifier).mockResolvedValueOnce(loansFromService);

      const loans = await controller.getLoansForFacility({ facilityIdentifier });

      expect(loans).toStrictEqual(loansFromService);
    });
  });

  describe('createAmountAmendmentForLoan', () => {
    const loanIdentifier = valueGenerator.loanId();
    const { increaseAmountRequest: loanAmountAmendmentRequest } = new CreateFacilityLoanAmountAmendmentGenerator(
      valueGenerator,
      new DateStringTransformations(),
    ).generate({ numberToGenerate: 1, loanIdentifier });
    const expectedBundleIdentifier = valueGenerator.acbsBundleId();

    it('returns the bundleIdentifier from creating a loan amount amendment with the service', async () => {
      when(createAmountAmendmentForLoanService).calledWith(loanIdentifier, loanAmountAmendmentRequest[0]).mockResolvedValueOnce(expectedBundleIdentifier);

      const bundleIdentifierResponse = await controller.createAmountAmendmentForLoan({ loanIdentifier, facilityIdentifier }, loanAmountAmendmentRequest);

      expect(bundleIdentifierResponse).toStrictEqual({ bundleIdentifier: expectedBundleIdentifier });
    });
  });
});
