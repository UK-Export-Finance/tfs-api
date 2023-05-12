import { BadRequestException } from '@nestjs/common';
import { PROPERTIES } from '@ukef/constants';
import { AcbsBundleInformationService } from '@ukef/modules/acbs/acbs-bundle-information.service';
import { AcbsAuthenticationService } from '@ukef/modules/acbs-authentication/acbs-authentication.service';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { getMockAcbsAuthenticationService } from '@ukef-test/support/abcs-authentication.service.mock';
import { GetFacilityLoanTransactionGenerator } from '@ukef-test/support/generator/get-facility-loan-transaction-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { when } from 'jest-when';

import { GetFacilityLoanTransactionResponseItem } from './dto/get-loan-transaction-response.dto';
import { FacilityLoanTransactionService } from './facility-loan-transaction.service';

describe('FacilityLoanTransactionService', () => {
  const { portfolioIdentifier } = PROPERTIES.GLOBAL;
  const valueGenerator = new RandomValueGenerator();
  const idToken = valueGenerator.string();
  const facilityIdentifier = valueGenerator.facilityId();
  const bundleIdentifier = valueGenerator.acbsBundleId();

  const { facilityLoanTransactionsFromApi: expectedFacilityLoanTransactions, facilityLoanTransactionsInAcbs } = new GetFacilityLoanTransactionGenerator(
    valueGenerator,
    new DateStringTransformations(),
  ).generate({ numberToGenerate: 1, facilityIdentifier, portfolioIdentifier });
  const [loanTransactionInAcbs] = facilityLoanTransactionsInAcbs;
  const [expectedLoanTransaction] = expectedFacilityLoanTransactions;

  let acbsAuthenticationService: AcbsAuthenticationService;
  let service: FacilityLoanTransactionService;

  let getFacilityLoanTransactionAcbsService: jest.Mock;

  beforeEach(() => {
    const mockAcbsAuthenticationService = getMockAcbsAuthenticationService();
    acbsAuthenticationService = mockAcbsAuthenticationService.service;
    const acbsAuthenticationServiceGetIdToken = mockAcbsAuthenticationService.getIdToken;
    when(acbsAuthenticationServiceGetIdToken).calledWith().mockResolvedValueOnce(idToken);

    const acbsService = new AcbsBundleInformationService(null, null);
    getFacilityLoanTransactionAcbsService = jest.fn();
    acbsService.getLoanTransactionByBundleIdentifier = getFacilityLoanTransactionAcbsService;

    service = new FacilityLoanTransactionService(acbsAuthenticationService, acbsService, new DateStringTransformations());
  });

  describe('getLoanTransactionByBundleIdentifier', () => {
    it('returns a transformation of the loan transaction from ACBS', async () => {
      when(getFacilityLoanTransactionAcbsService).calledWith(bundleIdentifier, idToken).mockResolvedValueOnce(loanTransactionInAcbs);

      const loanTransaction = await service.getLoanTransactionsByBundleIdentifier(bundleIdentifier);

      expect(loanTransaction).toStrictEqual(expectedLoanTransaction);
    });

    it('returns a transformation of the loan transaction from ACBS when it has a null deal customer usage rate', async () => {
      const loanTransactionInAcbsWithNullDealCustomerUsageRate = JSON.parse(JSON.stringify(loanTransactionInAcbs));
      loanTransactionInAcbsWithNullDealCustomerUsageRate.BundleMessageList[0].DealCustomerUsageRate = null;
      const expectedLoanTransactionWithNullValue: GetFacilityLoanTransactionResponseItem = {
        ...expectedLoanTransaction,
        dealCustomerUsageRate: null,
      };

      when(getFacilityLoanTransactionAcbsService)
        .calledWith(bundleIdentifier, idToken)
        .mockResolvedValueOnce(loanTransactionInAcbsWithNullDealCustomerUsageRate);

      const loanTransactions = await service.getLoanTransactionsByBundleIdentifier(bundleIdentifier);

      expect(loanTransactions).toStrictEqual(expectedLoanTransactionWithNullValue);
    });

    it('returns a transformation of the loan transaction from ACBS when it has a null operation type code', async () => {
      const loanTransactionInAcbsWithNullOperationTypeCode = JSON.parse(JSON.stringify(loanTransactionInAcbs));
      loanTransactionInAcbsWithNullOperationTypeCode.BundleMessageList[0].DealCustomerUsageOperationType.OperationTypeCode = null;
      const expectedFacilityLoanTransactionsWithNullValue: GetFacilityLoanTransactionResponseItem = {
        ...expectedLoanTransaction,
        dealCustomerUsageOperationType: null,
      };

      when(getFacilityLoanTransactionAcbsService).calledWith(bundleIdentifier, idToken).mockResolvedValueOnce(loanTransactionInAcbsWithNullOperationTypeCode);

      const loanTransactions = await service.getLoanTransactionsByBundleIdentifier(bundleIdentifier);

      expect(loanTransactions).toStrictEqual(expectedFacilityLoanTransactionsWithNullValue);
    });

    it('returns a transformation of the loan transaction from ACBS when it has an empty operation type code', async () => {
      const loanTransactionInAcbsWithEmptyOperationTypeCode = JSON.parse(JSON.stringify(loanTransactionInAcbs));
      loanTransactionInAcbsWithEmptyOperationTypeCode.BundleMessageList[0].DealCustomerUsageOperationType.OperationTypeCode = '';
      const expectedFacilityLoanTransactionsWithNullValue: GetFacilityLoanTransactionResponseItem = {
        ...expectedLoanTransaction,
        dealCustomerUsageOperationType: null,
      };

      when(getFacilityLoanTransactionAcbsService).calledWith(bundleIdentifier, idToken).mockResolvedValueOnce(loanTransactionInAcbsWithEmptyOperationTypeCode);

      const loanTransactions = await service.getLoanTransactionsByBundleIdentifier(bundleIdentifier);

      expect(loanTransactions).toStrictEqual(expectedFacilityLoanTransactionsWithNullValue);
    });

    it(`returns a transformation of the loan transaction from ACBS when it has more than one accrual with the category code 'PAC01'`, async () => {
      const loanTransactionInAcbsWithMoreThanOnePacAccrual = JSON.parse(JSON.stringify(loanTransactionInAcbs));
      loanTransactionInAcbsWithMoreThanOnePacAccrual.BundleMessageList[0].AccrualScheduleList.splice(1, 0, {
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
      const expectedFacilityLoanTransactionsWithAdditionalAccrual: GetFacilityLoanTransactionResponseItem = {
        ...expectedLoanTransaction,
        spreadRate: 0,
        indexRateChangeFrequency: '',
      };

      when(getFacilityLoanTransactionAcbsService).calledWith(bundleIdentifier, idToken).mockResolvedValueOnce(loanTransactionInAcbsWithMoreThanOnePacAccrual);

      const loanTransactions = await service.getLoanTransactionsByBundleIdentifier(bundleIdentifier);

      expect(loanTransactions).toStrictEqual(expectedFacilityLoanTransactionsWithAdditionalAccrual);
    });

    it(`returns a transformation of the loan transaction from ACBS when it has more than one accrual with the category code 'CTL01'`, async () => {
      const loanTransactionInAcbsWithMoreThanOneCtlAccrual = JSON.parse(JSON.stringify(loanTransactionInAcbs));
      loanTransactionInAcbsWithMoreThanOneCtlAccrual.BundleMessageList[0].AccrualScheduleList.splice(1, 0, {
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
      const expectedFacilityLoanTransactionsWithAdditionalAccrual: GetFacilityLoanTransactionResponseItem = {
        ...expectedLoanTransaction,
        spreadRateCTL: 0,
      };

      when(getFacilityLoanTransactionAcbsService).calledWith(bundleIdentifier, idToken).mockResolvedValueOnce(loanTransactionInAcbsWithMoreThanOneCtlAccrual);

      const loanTransactions = await service.getLoanTransactionsByBundleIdentifier(bundleIdentifier);

      expect(loanTransactions).toStrictEqual(expectedFacilityLoanTransactionsWithAdditionalAccrual);
    });

    it('throws a BadRequestException if the 0th element of the bundle message list is NOT a new loan request', async () => {
      const invalidloanTransactionInAcbs = JSON.parse(JSON.stringify(loanTransactionInAcbs));
      invalidloanTransactionInAcbs.BundleMessageList.unshift({
        $type: 'AccrualScheduleAmountTransaction',
      });

      when(getFacilityLoanTransactionAcbsService).calledWith(bundleIdentifier, idToken).mockResolvedValueOnce(invalidloanTransactionInAcbs);

      const responsePromise = service.getLoanTransactionsByBundleIdentifier(bundleIdentifier);

      await expect(responsePromise).rejects.toBeInstanceOf(BadRequestException);
      await expect(responsePromise).rejects.toThrow('Bad request');
      await expect(responsePromise).rejects.toHaveProperty('response.error', 'The provided bundleIdentifier does not correspond to a loan transaction.');
    });
  });
});
