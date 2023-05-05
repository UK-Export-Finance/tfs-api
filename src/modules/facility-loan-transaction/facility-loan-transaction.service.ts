import { Injectable } from '@nestjs/common';
import { PROPERTIES } from '@ukef/constants';
import { AcbsAuthenticationService } from '@ukef/modules/acbs-authentication/acbs-authentication.service';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';

import { AcbsFacilityLoanTransactionService } from '../acbs/acbs-facility-loan-transaction.service';
import { GetFacilityLoanTransactionResponseDto } from './dto/get-loan-transaction-response.dto';

@Injectable()
export class FacilityLoanTransactionService {
  constructor(
    private readonly acbsAuthenticationService: AcbsAuthenticationService,
    private readonly acbsFacilityLoanTransactionService: AcbsFacilityLoanTransactionService,
    private readonly dateStringTransformations: DateStringTransformations,
  ) {}

  async getLoanTransactionsForFacility(facilityIdentifier: string): Promise<GetFacilityLoanTransactionResponseDto> {
    const { portfolioIdentifier } = PROPERTIES.GLOBAL;
    const idToken = await this.acbsAuthenticationService.getIdToken();
    const loanTransactionsInAcbs = await this.acbsFacilityLoanTransactionService.getLoanTransactionsForFacility(
      portfolioIdentifier,
      facilityIdentifier,
      idToken,
    );
    return loanTransactionsInAcbs.map((loanTransaction) => {
      const loan = loanTransaction.BundleMessageList[0];
      if (loan.$type !== 'NewLoanRequest') {
        throw new Error('');
      }
      const pacAccrual = loan.AccrualScheduleList.find((accrual) => accrual.AccrualCategory.AccrualCategoryCode === 'PAC01');
      const ctlAccrual = loan.AccrualScheduleList.find((accrual) => accrual.AccrualCategory.AccrualCategoryCode === 'CTL01');
      const firstAccrual = loan.AccrualScheduleList[0];
      const firstRepayment = loan.RepaymentScheduleList[0];
      return {
        portfolioIdentifier: loanTransaction.PortfolioIdentifier,
        bundleStatusCode: loanTransaction.BundleStatus.BundleStatusCode,
        bundleStatusDesc: loanTransaction.BundleStatus.BundleStatusShortDescription,
        postingDate: this.dateStringTransformations.removeTime(loanTransaction.PostingDate),
        facilityIdentifier: loan.FacilityIdentifier,
        borrowerPartyIdentifier: loan.BorrowerPartyIdentifier,
        productTypeId: loan.ProductType.ProductTypeCode,
        productTypeGroup: loan.ProductGroup.ProductGroupCode,
        currency: loan.Currency.CurrencyCode,
        dealCustomerUsageRate: loan.DealCustomerUsageRate ? loan.DealCustomerUsageRate : null,
        dealCustomerUsageOperationType: loan.DealCustomerUsageOperationType?.OperationTypeCode ? loan.DealCustomerUsageOperationType.OperationTypeCode : null,
        amount: loan.LoanAmount,
        issueDate: this.dateStringTransformations.removeTime(loan.EffectiveDate),
        expiryDate: this.dateStringTransformations.removeTime(loan.MaturityDate),
        spreadRate: pacAccrual.SpreadRate,
        spreadRateCTL: ctlAccrual.SpreadRate,
        yearBasis: firstAccrual.YearBasis.YearBasisCode,
        nextDueDate: firstRepayment ? this.dateStringTransformations.removeTime(firstRepayment.NextDueDate) : null,
        indexRateChangeFrequency: pacAccrual.IndexRateChangeFrequency.IndexRateChangeFrequencyCode,
        loanBillingFrequencyType: firstRepayment.LoanBillingFrequencyType.LoanBillingFrequencyTypeCode,
      };
    });
  }
}
