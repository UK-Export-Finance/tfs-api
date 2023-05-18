import { CreateFacilityLoanGenerator } from '@ukef-test/support/generator/create-facility-loan-generator';
import { GetFacilityLoanGenerator } from '@ukef-test/support/generator/get-facility-loan-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { when } from 'jest-when';

import { DateStringTransformations } from '../date/date-string.transformations';
import { FacilityLoanController } from './facility-loan.controller';
import { FacilityLoanService } from './facility-loan.service';

describe('FacilityLoanController', () => {
  const valueGenerator = new RandomValueGenerator();
  const dateStringTransformations = new DateStringTransformations();
  const portfolioIdentifier = valueGenerator.string();
  const facilityIdentifier = valueGenerator.facilityId();
  const bundleIdentifier = valueGenerator.acbsBundleId();

  const { facilityLoansFromApi: loansFromService } = new GetFacilityLoanGenerator(valueGenerator, new DateStringTransformations()).generate({
    numberToGenerate: 2,
    facilityIdentifier,
    portfolioIdentifier,
  });

  let facilityLoanServiceGetLoansForFacility: jest.Mock;
  let facilityLoanServiceCreateLoanForFacility: jest.Mock;
  let controller: FacilityLoanController;

  beforeEach(() => {
    const facilityLoanService = new FacilityLoanService(null, null, null, null, null);
    facilityLoanServiceGetLoansForFacility = jest.fn();
    facilityLoanService.getLoansForFacility = facilityLoanServiceGetLoansForFacility;

    facilityLoanServiceCreateLoanForFacility = jest.fn(() => ({
      bundleIdentifier: bundleIdentifier,
    }));
    facilityLoanService.createLoanForFacility = facilityLoanServiceCreateLoanForFacility;

    controller = new FacilityLoanController(facilityLoanService);
  });

  describe('getLoansForFacility', () => {
    it('returns the loans from the service', async () => {
      when(facilityLoanServiceGetLoansForFacility).calledWith(facilityIdentifier).mockResolvedValueOnce(loansFromService);

      const loans = await controller.getLoansForFacility({ facilityIdentifier });

      expect(loans).toStrictEqual(loansFromService);
    });
  });

  describe('createLoanForFacility', () => {
    const { requestBodyToCreateFacilityLoan, createFacilityLoanResponseFromService } =
      new CreateFacilityLoanGenerator(valueGenerator, dateStringTransformations).generate({
        numberToGenerate: 1,
        facilityIdentifier,
        bundleIdentifier,
      });

    it('creates a loan for the facility with the service from the request body', async () => {
      await controller.createLoanForFacility({ facilityIdentifier }, requestBodyToCreateFacilityLoan);

      expect(facilityLoanServiceCreateLoanForFacility).toHaveBeenCalledWith(
        facilityIdentifier,
        requestBodyToCreateFacilityLoan[0],
      );
    });

    it('returns the bundle identifier if creating the loan succeeds', async () => {
      const response = await controller.createLoanForFacility({ facilityIdentifier }, requestBodyToCreateFacilityLoan);

      expect(response).toStrictEqual(createFacilityLoanResponseFromService);
    });
  });
});
