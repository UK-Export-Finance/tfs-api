import { BadRequestException, Injectable } from '@nestjs/common';
import { PROPERTIES } from '@ukef/constants';
import { AcbsAuthenticationService } from '@ukef/modules/acbs-authentication/acbs-authentication.service';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';

import { AcbsBundleInformationService } from '../acbs/acbs-bundle-information.service';
import { isNewLoanRequest } from '../acbs/dto/bundle-actions/bundle-action.type';
import { GetFacilityLoanTransactionResponseItem } from './dto/get-loan-transaction-response.dto';

@Injectable()
export class FacilityLoanTransactionService {
  constructor(
    private readonly acbsAuthenticationService: AcbsAuthenticationService,
    private readonly acbsBundleInformationService: AcbsBundleInformationService,
    private readonly dateStringTransformations: DateStringTransformations,
  ) {}

  async getLoanTransactionsByBundleIdentifier(bundleIdentifier: string): Promise<GetFacilityLoanTransactionResponseItem> {
    const idToken = await this.acbsAuthenticationService.getIdToken();
    const loanTransaction = await this.acbsBundleInformationService.getLoanTransactionByBundleIdentifier(bundleIdentifier, idToken);
    const [loan] = loanTransaction.BundleMessageList;
    if (isNewLoanRequest(loan)) {
      const pacAccrual = loan.AccrualScheduleList.find(
        (accrual) =>
          accrual.AccrualCategory.AccrualCategoryCode ===
          PROPERTIES.FACILITY_LOAN_TRANSACTION.DEFAULT.bundleMessageList.accrualScheduleList.accrualCategory.accrualCategoryCode.pac,
      );
      const ctlAccrual = loan.AccrualScheduleList.find(
        (accrual) =>
          accrual.AccrualCategory.AccrualCategoryCode ===
          PROPERTIES.FACILITY_LOAN_TRANSACTION.DEFAULT.bundleMessageList.accrualScheduleList.accrualCategory.accrualCategoryCode.ctl,
      );
      const [firstAccrual] = loan.AccrualScheduleList;
      const [firstRepayment] = loan.RepaymentScheduleList;
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
        dealCustomerUsageRate: loan.DealCustomerUsageRate ?? null,
        dealCustomerUsageOperationType: loan.DealCustomerUsageOperationType?.OperationTypeCode ? loan.DealCustomerUsageOperationType.OperationTypeCode : null,
        amount: loan.LoanAmount,
        issueDate: this.dateStringTransformations.removeTime(loan.EffectiveDate),
        expiryDate: this.dateStringTransformations.removeTime(loan.MaturityDate),
        spreadRate: pacAccrual.SpreadRate,
        spreadRateCTL: ctlAccrual?.SpreadRate,
        yearBasis: firstAccrual.YearBasis.YearBasisCode,
        nextDueDate: this.dateStringTransformations.removeTime(firstRepayment.NextDueDate),
        indexRateChangeFrequency: pacAccrual.IndexRateChangeFrequency.IndexRateChangeFrequencyCode,
        loanBillingFrequencyType: firstRepayment.LoanBillingFrequencyType.LoanBillingFrequencyTypeCode,
      };
    } else {
      throw new BadRequestException('Bad request', 'The provided bundleIdentifier does not correspond to a loan transaction.');
    }
  }
}
