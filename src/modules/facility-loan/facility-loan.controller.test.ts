import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { CreateFacilityLoanAmountAmendmentGenerator } from '@ukef-test/support/generator/create-facility-loan-amount-amendment.generator';
import { CreateFacilityLoanGenerator } from '@ukef-test/support/generator/create-facility-loan-generator';
import { GetFacilityLoanGenerator } from '@ukef-test/support/generator/get-facility-loan-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { UpdateLoanGenerator } from '@ukef-test/support/generator/update-loan-generator';
import { Response } from 'express';
import { when } from 'jest-when';

import { FacilityLoanController } from './facility-loan.controller';
import { FacilityLoanService } from './facility-loan.service';

describe('FacilityLoanController', () => {
  const valueGenerator = new RandomValueGenerator();
  const dateStringTransformations = new DateStringTransformations();
  const portfolioIdentifier = valueGenerator.portfolioId();
  const facilityIdentifier = valueGenerator.facilityId();
  const bundleIdentifier = valueGenerator.acbsBundleId();
  const loanIdentifier = valueGenerator.loanId();

  let facilityLoanServiceGetLoansForFacility: jest.Mock;
  let facilityLoanServiceCreateLoanForFacility: jest.Mock;
  let createAmountAmendmentForLoanService: jest.Mock;
  let facilityLoanServiceUpdateLoanExpiryDate: jest.Mock;

  let controller: FacilityLoanController;

  beforeEach(() => {
    const facilityLoanService = new FacilityLoanService(null, null, null, null, null, null, null, null);
    facilityLoanServiceGetLoansForFacility = jest.fn();
    facilityLoanService.getLoansForFacility = facilityLoanServiceGetLoansForFacility;

    facilityLoanServiceCreateLoanForFacility = jest.fn(() => ({
      bundleIdentifier: bundleIdentifier,
    }));
    facilityLoanService.createLoanForFacility = facilityLoanServiceCreateLoanForFacility;

    createAmountAmendmentForLoanService = jest.fn();
    facilityLoanService.createAmountAmendmentForLoan = createAmountAmendmentForLoanService;

    facilityLoanServiceUpdateLoanExpiryDate = jest.fn();
    facilityLoanService.updateLoanExpiryDate = facilityLoanServiceUpdateLoanExpiryDate;

    controller = new FacilityLoanController(facilityLoanService);
  });

  describe('getLoansForFacility', () => {
    const { facilityLoansFromApi: loansFromService } = new GetFacilityLoanGenerator(valueGenerator, new DateStringTransformations()).generate({
      numberToGenerate: 2,
      facilityIdentifier,
      portfolioIdentifier,
    });

    it('returns the loans from the service', async () => {
      when(facilityLoanServiceGetLoansForFacility).calledWith(facilityIdentifier).mockResolvedValueOnce(loansFromService);

      const loans = await controller.getLoansForFacility({ facilityIdentifier });

      expect(loans).toStrictEqual(loansFromService);
    });
  });

  describe('createLoanForFacility', () => {
    const { requestBodyToCreateFacilityLoanGbp, createFacilityLoanResponseFromService } = new CreateFacilityLoanGenerator(
      valueGenerator,
      dateStringTransformations,
    ).generate({
      numberToGenerate: 1,
      facilityIdentifier,
      bundleIdentifier,
    });
    const res: Response = {
      header: jest.fn().mockReturnThis(),
    } as any;

    it('creates a loan for the facility with the service from the request body', async () => {
      when(facilityLoanServiceCreateLoanForFacility)
        .calledWith(facilityIdentifier, requestBodyToCreateFacilityLoanGbp[0])
        .mockResolvedValueOnce({ BundleIdentifier: bundleIdentifier, WarningErrors: '' });
      await controller.createLoanForFacility({ facilityIdentifier }, requestBodyToCreateFacilityLoanGbp, res);

      expect(facilityLoanServiceCreateLoanForFacility).toHaveBeenCalledWith(facilityIdentifier, requestBodyToCreateFacilityLoanGbp[0]);
    });

    it('returns the bundle identifier if creating the loan succeeds', async () => {
      when(facilityLoanServiceCreateLoanForFacility)
        .calledWith(facilityIdentifier, requestBodyToCreateFacilityLoanGbp[0])
        .mockResolvedValueOnce({ BundleIdentifier: bundleIdentifier, WarningErrors: '' });
      const response = await controller.createLoanForFacility({ facilityIdentifier }, requestBodyToCreateFacilityLoanGbp, res);

      expect(response).toStrictEqual(createFacilityLoanResponseFromService);
    });

    it(`sets 'processing-warning' header if WarningErrors exists on the service response`, async () => {
      when(facilityLoanServiceCreateLoanForFacility)
        .calledWith(facilityIdentifier, requestBodyToCreateFacilityLoanGbp[0])
        .mockResolvedValueOnce({ BundleIdentifier: bundleIdentifier, WarningErrors: 'error' });

      await controller.createLoanForFacility({ facilityIdentifier }, requestBodyToCreateFacilityLoanGbp, res);

      expect(res.header).toHaveBeenCalledTimes(1);
      expect(res.header).toHaveBeenCalledWith('processing-warning', 'error');
    });
  });

  describe('createAmountAmendmentForLoan', () => {
    const loanIdentifier = valueGenerator.loanId();
    const { increaseAmountRequest: loanAmountAmendmentRequest } = new CreateFacilityLoanAmountAmendmentGenerator(
      valueGenerator,
      new DateStringTransformations(),
    ).generate({ numberToGenerate: 1, loanIdentifier });
    const res: Response = {
      header: jest.fn().mockReturnThis(),
    } as any;
    const expectedBundleIdentifier = valueGenerator.acbsBundleId();

    it('returns the bundleIdentifier from creating a loan amount amendment with the service', async () => {
      when(createAmountAmendmentForLoanService)
        .calledWith(loanIdentifier, loanAmountAmendmentRequest[0])
        .mockResolvedValueOnce({ BundleIdentifier: expectedBundleIdentifier, WarningErrors: '' });

      const bundleIdentifierResponse = await controller.createAmountAmendmentForLoan({ loanIdentifier, facilityIdentifier }, loanAmountAmendmentRequest, res);

      expect(bundleIdentifierResponse).toStrictEqual({ bundleIdentifier: expectedBundleIdentifier });
    });

    it(`sets 'processing-warning' header if WarningErrors exists on the service response`, async () => {
      when(createAmountAmendmentForLoanService)
        .calledWith(loanIdentifier, loanAmountAmendmentRequest[0])
        .mockResolvedValueOnce({ BundleIdentifier: expectedBundleIdentifier, WarningErrors: 'error' });

      await controller.createAmountAmendmentForLoan({ loanIdentifier, facilityIdentifier }, loanAmountAmendmentRequest, res);

      expect(res.header).toHaveBeenCalledTimes(1);
      expect(res.header).toHaveBeenCalledWith('processing-warning', 'error');
    });
  });

  describe('updateLoanExpiryDate', () => {
    const { updateLoanExpiryDateRequest } = new UpdateLoanGenerator(valueGenerator, new DateStringTransformations()).generate({
      numberToGenerate: 1,
      facilityIdentifier,
      portfolioIdentifier,
      loanIdentifier,
    });

    it('calls the facility loan updateLoanExpiryDate method with expected request', async () => {
      await controller.updateLoanExpiryDate({ loanIdentifier, facilityIdentifier }, updateLoanExpiryDateRequest);

      expect(facilityLoanServiceUpdateLoanExpiryDate).toHaveBeenCalledWith(loanIdentifier, updateLoanExpiryDateRequest);
    });

    it('calls the facility loan updateLoanExpiryDate method once', async () => {
      await controller.updateLoanExpiryDate({ loanIdentifier, facilityIdentifier }, updateLoanExpiryDateRequest);

      expect(facilityLoanServiceUpdateLoanExpiryDate).toHaveBeenCalledTimes(1);
    });

    it('returns the loan identifier of the loan if creating loan succeeds', async () => {
      const loanIdentifierResponse = await controller.updateLoanExpiryDate({ loanIdentifier, facilityIdentifier }, updateLoanExpiryDateRequest);

      expect(loanIdentifierResponse).toStrictEqual({ loanIdentifier });
    });
  });
});
