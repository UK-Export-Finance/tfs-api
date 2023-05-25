import { BadRequestException } from '@nestjs/common';
import { PROPERTIES } from '@ukef/constants';
import { AcbsBundleInformationService } from '@ukef/modules/acbs/acbs-bundle-information.service';
import { AcbsAuthenticationService } from '@ukef/modules/acbs-authentication/acbs-authentication.service';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { getMockAcbsAuthenticationService } from '@ukef-test/support/abcs-authentication.service.mock';
import { GetFacilityLoanTransactionGenerator } from '@ukef-test/support/generator/get-facility-loan-transaction-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { when } from 'jest-when';

import { GetFacilityLoanTransactionResponseDto } from './dto/get-facility-loan-transaction-response.dto';
import { FacilityLoanTransactionService } from './facility-loan-transaction.service';

describe('FacilityLoanTransactionService', () => {
  const valueGenerator = new RandomValueGenerator();
  const idToken = valueGenerator.string();
  const facilityIdentifier = valueGenerator.facilityId();
  const bundleIdentifier = valueGenerator.acbsBundleId();

  const { acbsFacilityLoanTransaction, apiFacilityLoanTransaction: expectedLoanTransaction } = new GetFacilityLoanTransactionGenerator(
    valueGenerator,
    new DateStringTransformations(),
  ).generate({ numberToGenerate: 1, facilityIdentifier });

  let acbsAuthenticationService: AcbsAuthenticationService;
  let service: FacilityLoanTransactionService;

  let getBundleInformationAcbsService: jest.Mock;

  beforeEach(() => {
    const mockAcbsAuthenticationService = getMockAcbsAuthenticationService();
    acbsAuthenticationService = mockAcbsAuthenticationService.service;
    const acbsAuthenticationServiceGetIdToken = mockAcbsAuthenticationService.getIdToken;
    when(acbsAuthenticationServiceGetIdToken).calledWith().mockResolvedValueOnce(idToken);

    const acbsService = new AcbsBundleInformationService(null, null);
    getBundleInformationAcbsService = jest.fn();
    acbsService.getBundleInformationByIdentifier = getBundleInformationAcbsService;

    service = new FacilityLoanTransactionService(acbsAuthenticationService, acbsService, new DateStringTransformations());
  });

  describe('getLoanTransactionByBundleIdentifier', () => {
    it('returns a transformation of the loan transaction from ACBS', async () => {
      when(getBundleInformationAcbsService).calledWith(bundleIdentifier, 'Loan transaction', idToken).mockResolvedValueOnce(acbsFacilityLoanTransaction);

      const loanTransaction = await service.getLoanTransactionsByBundleIdentifier(bundleIdentifier);

      expect(loanTransaction).toStrictEqual(expectedLoanTransaction);
    });

    it('returns a transformation of the loan transaction from ACBS when it has a null deal customer usage rate', async () => {
      const loanTransactionInAcbsWithNullDealCustomerUsageRate = JSON.parse(JSON.stringify(acbsFacilityLoanTransaction));
      loanTransactionInAcbsWithNullDealCustomerUsageRate.BundleMessageList[0].DealCustomerUsageRate = null;
      const expectedLoanTransactionWithNullValue: GetFacilityLoanTransactionResponseDto = {
        ...expectedLoanTransaction,
        dealCustomerUsageRate: null,
      };

      when(getBundleInformationAcbsService)
        .calledWith(bundleIdentifier, 'Loan transaction', idToken)
        .mockResolvedValueOnce(loanTransactionInAcbsWithNullDealCustomerUsageRate);

      const loanTransactions = await service.getLoanTransactionsByBundleIdentifier(bundleIdentifier);

      expect(loanTransactions).toStrictEqual(expectedLoanTransactionWithNullValue);
    });

    it('returns a transformation of the loan transaction from ACBS when it has a null operation type code', async () => {
      const loanTransactionInAcbsWithNullOperationTypeCode = JSON.parse(JSON.stringify(acbsFacilityLoanTransaction));
      loanTransactionInAcbsWithNullOperationTypeCode.BundleMessageList[0].DealCustomerUsageOperationType.OperationTypeCode = null;
      const expectedFacilityLoanTransactionsWithNullValue: GetFacilityLoanTransactionResponseDto = {
        ...expectedLoanTransaction,
        dealCustomerUsageOperationType: null,
      };

      when(getBundleInformationAcbsService)
        .calledWith(bundleIdentifier, 'Loan transaction', idToken)
        .mockResolvedValueOnce(loanTransactionInAcbsWithNullOperationTypeCode);

      const loanTransactions = await service.getLoanTransactionsByBundleIdentifier(bundleIdentifier);

      expect(loanTransactions).toStrictEqual(expectedFacilityLoanTransactionsWithNullValue);
    });

    it('returns a transformation of the loan transaction from ACBS when it has an empty operation type code', async () => {
      const loanTransactionInAcbsWithEmptyOperationTypeCode = JSON.parse(JSON.stringify(acbsFacilityLoanTransaction));
      loanTransactionInAcbsWithEmptyOperationTypeCode.BundleMessageList[0].DealCustomerUsageOperationType.OperationTypeCode = '';
      const expectedFacilityLoanTransactionsWithNullValue: GetFacilityLoanTransactionResponseDto = {
        ...expectedLoanTransaction,
        dealCustomerUsageOperationType: null,
      };

      when(getBundleInformationAcbsService)
        .calledWith(bundleIdentifier, 'Loan transaction', idToken)
        .mockResolvedValueOnce(loanTransactionInAcbsWithEmptyOperationTypeCode);

      const loanTransactions = await service.getLoanTransactionsByBundleIdentifier(bundleIdentifier);

      expect(loanTransactions).toStrictEqual(expectedFacilityLoanTransactionsWithNullValue);
    });

    it(`returns a transformation of the loan transaction from ACBS when it has more than one accrual with the category code 'PAC01'`, async () => {
      const loanTransactionInAcbsWithMoreThanOnePacAccrual = JSON.parse(JSON.stringify(acbsFacilityLoanTransaction));
      loanTransactionInAcbsWithMoreThanOnePacAccrual.BundleMessageList[0].AccrualScheduleList.splice(1, 0, {
        AccrualCategory: {
          AccrualCategoryCode: PROPERTIES.FACILITY_LOAN.DEFAULT.accrualScheduleList.accrualCategory.accrualCategoryCode.pac,
        },
        SpreadRate: 0,
        YearBasis: {
          YearBasisCode: '',
        },
        IndexRateChangeFrequency: {
          IndexRateChangeFrequencyCode: '',
        },
      });
      const expectedFacilityLoanTransactionsWithAdditionalAccrual: GetFacilityLoanTransactionResponseDto = {
        ...expectedLoanTransaction,
        spreadRate: 0,
        indexRateChangeFrequency: '',
      };

      when(getBundleInformationAcbsService)
        .calledWith(bundleIdentifier, 'Loan transaction', idToken)
        .mockResolvedValueOnce(loanTransactionInAcbsWithMoreThanOnePacAccrual);

      const loanTransactions = await service.getLoanTransactionsByBundleIdentifier(bundleIdentifier);

      expect(loanTransactions).toStrictEqual(expectedFacilityLoanTransactionsWithAdditionalAccrual);
    });

    it(`returns a transformation of the loan transaction from ACBS when it has more than one accrual with the category code 'CTL01'`, async () => {
      const loanTransactionInAcbsWithMoreThanOneCtlAccrual = JSON.parse(JSON.stringify(acbsFacilityLoanTransaction));
      loanTransactionInAcbsWithMoreThanOneCtlAccrual.BundleMessageList[0].AccrualScheduleList.splice(1, 0, {
        AccrualCategory: {
          AccrualCategoryCode: PROPERTIES.FACILITY_LOAN.DEFAULT.accrualScheduleList.accrualCategory.accrualCategoryCode.ctl,
        },
        SpreadRate: 0,
        YearBasis: {
          YearBasisCode: '',
        },
        IndexRateChangeFrequency: {
          IndexRateChangeFrequencyCode: '',
        },
      });
      const expectedFacilityLoanTransactionsWithAdditionalAccrual: GetFacilityLoanTransactionResponseDto = {
        ...expectedLoanTransaction,
        spreadRateCTL: 0,
      };

      when(getBundleInformationAcbsService)
        .calledWith(bundleIdentifier, 'Loan transaction', idToken)
        .mockResolvedValueOnce(loanTransactionInAcbsWithMoreThanOneCtlAccrual);

      const loanTransactions = await service.getLoanTransactionsByBundleIdentifier(bundleIdentifier);

      expect(loanTransactions).toStrictEqual(expectedFacilityLoanTransactionsWithAdditionalAccrual);
    });

    it('throws a BadRequestException if the 0th element of the bundle message list is NOT a new loan request', async () => {
      const invalidLoanTransactionInAcbs = JSON.parse(JSON.stringify(acbsFacilityLoanTransaction));
      invalidLoanTransactionInAcbs.BundleMessageList.unshift({
        $type: 'AccrualScheduleAmountTransaction',
      });

      when(getBundleInformationAcbsService).calledWith(bundleIdentifier, 'Loan transaction', idToken).mockResolvedValueOnce(invalidLoanTransactionInAcbs);

      const responsePromise = service.getLoanTransactionsByBundleIdentifier(bundleIdentifier);

      await expect(responsePromise).rejects.toBeInstanceOf(BadRequestException);
      await expect(responsePromise).rejects.toThrow('Bad request');
      await expect(responsePromise).rejects.toHaveProperty('response.error', 'The provided bundleIdentifier does not correspond to a loan transaction.');
    });
  });
});
