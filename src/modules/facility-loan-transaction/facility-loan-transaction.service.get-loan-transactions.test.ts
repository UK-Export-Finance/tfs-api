import { BadRequestException } from '@nestjs/common';
import { PROPERTIES } from '@ukef/constants';
import { AcbsAuthenticationService } from '@ukef/modules/acbs-authentication/acbs-authentication.service';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { getMockAcbsAuthenticationService } from '@ukef-test/support/abcs-authentication.service.mock';
import { GetFacilityLoanTransactionGenerator } from '@ukef-test/support/generator/get-facility-loan-transaction-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { when } from 'jest-when';

import { AcbsFacilityLoanTransactionService } from '../acbs/acbs-facility-loan-transaction.service';
import { GetFacilityLoanTransactionResponseDto } from './dto/get-loan-transaction-response.dto';
import { FacilityLoanTransactionService } from './facility-loan-transaction.service';

describe('FacilityLoanTransactionService', () => {
  const portfolioIdentifier = PROPERTIES.GLOBAL.portfolioIdentifier;
  const valueGenerator = new RandomValueGenerator();
  const idToken = valueGenerator.string();
  const facilityIdentifier = valueGenerator.facilityId();

  const { facilityLoanTransactionsFromApi: expectedFacilityLoanTransactions, facilityLoanTransactionsInAcbs } = new GetFacilityLoanTransactionGenerator(
    valueGenerator,
    new DateStringTransformations(),
  ).generate({ numberToGenerate: 2, facilityIdentifier, portfolioIdentifier });

  let acbsAuthenticationService: AcbsAuthenticationService;
  let service: FacilityLoanTransactionService;

  let getFacilityLoanTransactionsAcbsService: jest.Mock;

  beforeEach(() => {
    const mockAcbsAuthenticationService = getMockAcbsAuthenticationService();
    acbsAuthenticationService = mockAcbsAuthenticationService.service;
    const acbsAuthenticationServiceGetIdToken = mockAcbsAuthenticationService.getIdToken;
    when(acbsAuthenticationServiceGetIdToken).calledWith().mockResolvedValueOnce(idToken);

    const acbsService = new AcbsFacilityLoanTransactionService(null, null);
    getFacilityLoanTransactionsAcbsService = jest.fn();
    acbsService.getLoanTransactionsForFacility = getFacilityLoanTransactionsAcbsService;

    service = new FacilityLoanTransactionService(acbsAuthenticationService, acbsService, new DateStringTransformations());
  });

  describe('getLoanTransactionsForFacility', () => {
    it('returns a transformation of the loan transactions from ACBS', async () => {
      when(getFacilityLoanTransactionsAcbsService)
        .calledWith(portfolioIdentifier, facilityIdentifier, idToken)
        .mockResolvedValueOnce(facilityLoanTransactionsInAcbs);

      const loanTransactions = await service.getLoanTransactionsForFacility(facilityIdentifier);

      expect(loanTransactions).toStrictEqual(expectedFacilityLoanTransactions);
    });

    it('returns a transformation of the loan transactions from ACBS when one of them has a null deal customer usage rate', async () => {
      const facilityLoanTransactionInAcbsWithNullDealCustomerUsageRate = JSON.parse(JSON.stringify(facilityLoanTransactionsInAcbs[0]));
      facilityLoanTransactionInAcbsWithNullDealCustomerUsageRate.BundleMessageList[0].DealCustomerUsageRate = null;
      const facilityLoanTransactionsInAcbsWithNullValue = [facilityLoanTransactionInAcbsWithNullDealCustomerUsageRate, facilityLoanTransactionsInAcbs[1]];
      const expectedFacilityLoanTransactionsWithNullValue: GetFacilityLoanTransactionResponseDto = [
        {
          ...expectedFacilityLoanTransactions[0],
          dealCustomerUsageRate: null,
        },
        expectedFacilityLoanTransactions[1],
      ];

      when(getFacilityLoanTransactionsAcbsService)
        .calledWith(portfolioIdentifier, facilityIdentifier, idToken)
        .mockResolvedValueOnce(facilityLoanTransactionsInAcbsWithNullValue);

      const loanTransactions = await service.getLoanTransactionsForFacility(facilityIdentifier);

      expect(loanTransactions).toStrictEqual(expectedFacilityLoanTransactionsWithNullValue);
    });

    it('returns a transformation of the loan transactions from ACBS when one of them has a null operation type code', async () => {
      const facilityLoanTransactionInAcbsWithNullOperationTypeCode = JSON.parse(JSON.stringify(facilityLoanTransactionsInAcbs[0]));
      facilityLoanTransactionInAcbsWithNullOperationTypeCode.BundleMessageList[0].DealCustomerUsageOperationType.OperationTypeCode = null;
      const facilityLoanTransactionsInAcbsWithNullValue = [facilityLoanTransactionInAcbsWithNullOperationTypeCode, facilityLoanTransactionsInAcbs[1]];
      const expectedFacilityLoanTransactionsWithNullValue: GetFacilityLoanTransactionResponseDto = [
        {
          ...expectedFacilityLoanTransactions[0],
          dealCustomerUsageOperationType: null,
        },
        expectedFacilityLoanTransactions[1],
      ];

      when(getFacilityLoanTransactionsAcbsService)
        .calledWith(portfolioIdentifier, facilityIdentifier, idToken)
        .mockResolvedValueOnce(facilityLoanTransactionsInAcbsWithNullValue);

      const loanTransactions = await service.getLoanTransactionsForFacility(facilityIdentifier);

      expect(loanTransactions).toStrictEqual(expectedFacilityLoanTransactionsWithNullValue);
    });

    it('returns a transformation of the loan transactions from ACBS when one of them has an empty operation type code', async () => {
      const facilityLoanTransactionInAcbsWithEmptyOperationTypeCode = JSON.parse(JSON.stringify(facilityLoanTransactionsInAcbs[0]));
      facilityLoanTransactionInAcbsWithEmptyOperationTypeCode.BundleMessageList[0].DealCustomerUsageOperationType.OperationTypeCode = '';
      const facilityLoanTransactionsInAcbsWithEmptyValue = [facilityLoanTransactionInAcbsWithEmptyOperationTypeCode, facilityLoanTransactionsInAcbs[1]];
      const expectedFacilityLoanTransactionsWithNullValue: GetFacilityLoanTransactionResponseDto = [
        {
          ...expectedFacilityLoanTransactions[0],
          dealCustomerUsageOperationType: null,
        },
        expectedFacilityLoanTransactions[1],
      ];

      when(getFacilityLoanTransactionsAcbsService)
        .calledWith(portfolioIdentifier, facilityIdentifier, idToken)
        .mockResolvedValueOnce(facilityLoanTransactionsInAcbsWithEmptyValue);

      const loanTransactions = await service.getLoanTransactionsForFacility(facilityIdentifier);

      expect(loanTransactions).toStrictEqual(expectedFacilityLoanTransactionsWithNullValue);
    });

    it(`returns a transformation of the loan transactions from ACBS when one of them has more than one accrual with the category code 'PAC01'`, async () => {
      const facilityLoanTransactionInAcbsWithMoreThanOnePacAccrual = JSON.parse(JSON.stringify(facilityLoanTransactionsInAcbs[0]));
      facilityLoanTransactionInAcbsWithMoreThanOnePacAccrual.BundleMessageList[0].AccrualScheduleList.splice(1, 0, {
        AccrualCategory: {
          AccrualCategoryCode: PROPERTIES.FACILITY_LOAN_TRANSACTION.DEFAULT.bundleMessageList.accrualScheduleList.accrualCategory.accrualCategoryCode.pac,
        },
        SpreadRate: 0,
        YearBasis: {
          YearBasisCode: '',
        },
        IndexRateChangeFrequency: {
          IndexRateChangeFrequencyCode: '',
        },
      });
      const facilityLoanTransactionsInAcbsWithAdditionalAccrual = [facilityLoanTransactionInAcbsWithMoreThanOnePacAccrual, facilityLoanTransactionsInAcbs[1]];
      const expectedFacilityLoanTransactionsWithAdditionalAccrual: GetFacilityLoanTransactionResponseDto = [
        {
          ...expectedFacilityLoanTransactions[0],
          spreadRate: 0,
          indexRateChangeFrequency: '',
        },
        expectedFacilityLoanTransactions[1],
      ];

      when(getFacilityLoanTransactionsAcbsService)
        .calledWith(portfolioIdentifier, facilityIdentifier, idToken)
        .mockResolvedValueOnce(facilityLoanTransactionsInAcbsWithAdditionalAccrual);

      const loanTransactions = await service.getLoanTransactionsForFacility(facilityIdentifier);

      expect(loanTransactions).toStrictEqual(expectedFacilityLoanTransactionsWithAdditionalAccrual);
    });

    it(`returns a transformation of the loan transactions from ACBS when one of them has more than one accrual with the category code 'CTL01'`, async () => {
      const facilityLoanTransactionInAcbsWithMoreThanOneCtlAccrual = JSON.parse(JSON.stringify(facilityLoanTransactionsInAcbs[0]));
      facilityLoanTransactionInAcbsWithMoreThanOneCtlAccrual.BundleMessageList[0].AccrualScheduleList.splice(1, 0, {
        AccrualCategory: {
          AccrualCategoryCode: PROPERTIES.FACILITY_LOAN_TRANSACTION.DEFAULT.bundleMessageList.accrualScheduleList.accrualCategory.accrualCategoryCode.ctl,
        },
        SpreadRate: 0,
        YearBasis: {
          YearBasisCode: '',
        },
        IndexRateChangeFrequency: {
          IndexRateChangeFrequencyCode: '',
        },
      });
      const facilityLoanTransactionsInAcbsWithAdditionalAccrual = [facilityLoanTransactionInAcbsWithMoreThanOneCtlAccrual, facilityLoanTransactionsInAcbs[1]];
      const expectedFacilityLoanTransactionsWithAdditionalAccrual: GetFacilityLoanTransactionResponseDto = [
        {
          ...expectedFacilityLoanTransactions[0],
          spreadRateCTL: 0,
        },
        expectedFacilityLoanTransactions[1],
      ];

      when(getFacilityLoanTransactionsAcbsService)
        .calledWith(portfolioIdentifier, facilityIdentifier, idToken)
        .mockResolvedValueOnce(facilityLoanTransactionsInAcbsWithAdditionalAccrual);

      const loanTransactions = await service.getLoanTransactionsForFacility(facilityIdentifier);

      expect(loanTransactions).toStrictEqual(expectedFacilityLoanTransactionsWithAdditionalAccrual);
    });

    it('returns an empty array if ACBS returns an empty array', async () => {
      when(getFacilityLoanTransactionsAcbsService).calledWith(portfolioIdentifier, facilityIdentifier, idToken).mockResolvedValueOnce([]);

      const loanTransactions = await service.getLoanTransactionsForFacility(facilityIdentifier);

      expect(loanTransactions).toStrictEqual([]);
    });

    it('throws a BadRequestException if the 0th element of the bundle message list is NOT a new loan request', async () => {
      const invalidFacilityLoanTransactionInAcbs = JSON.parse(JSON.stringify(facilityLoanTransactionsInAcbs[0]));
      invalidFacilityLoanTransactionInAcbs.BundleMessageList.unshift({
        $type: 'AccrualScheduleAmountTransaction',
      });
      const facilityLoanTransactionsInAcbsWithInvalidElement = [invalidFacilityLoanTransactionInAcbs, facilityLoanTransactionsInAcbs[1]];

      when(getFacilityLoanTransactionsAcbsService)
        .calledWith(portfolioIdentifier, facilityIdentifier, idToken)
        .mockResolvedValueOnce(facilityLoanTransactionsInAcbsWithInvalidElement);

      const responsePromise = service.getLoanTransactionsForFacility(facilityIdentifier);

      await expect(responsePromise).rejects.toBeInstanceOf(BadRequestException);
      await expect(responsePromise).rejects.toThrow('Bad request');
      await expect(responsePromise).rejects.toHaveProperty('response.error', 'The provided bundleIdentifier does not correspond to a loan transaction.');
    });
  });
});
