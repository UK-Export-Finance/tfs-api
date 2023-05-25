import { BadRequestException, Injectable } from '@nestjs/common';
import { PROPERTIES } from '@ukef/constants';
import { AcbsBundleInformationService } from '@ukef/modules/acbs/acbs-bundle-information.service';
import { AccrualSchedule } from '@ukef/modules/acbs/dto/bundle-actions/accrual-schedule.interface';
import { isNewLoanRequest } from '@ukef/modules/acbs/dto/bundle-actions/bundle-action.type';
import { NewLoanRequest } from '@ukef/modules/acbs/dto/bundle-actions/new-loan-request.bundle-action';
import { AcbsAuthenticationService } from '@ukef/modules/acbs-authentication/acbs-authentication.service';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { GetFacilityLoanTransactionResponseDto } from '@ukef/modules/facility-loan-transaction/dto/get-facility-loan-transaction-response.dto';

import { AcbsGetBundleInformationResponseDto } from '../acbs/dto/acbs-get-bundle-information-response.dto';

@Injectable()
export class FacilityLoanTransactionService {
  constructor(
    private readonly acbsAuthenticationService: AcbsAuthenticationService,
    private readonly acbsBundleInformationService: AcbsBundleInformationService,
    private readonly dateStringTransformations: DateStringTransformations,
  ) {}

  async getLoanTransactionsByBundleIdentifier(bundleIdentifier: string): Promise<GetFacilityLoanTransactionResponseDto> {
    const idToken = await this.acbsAuthenticationService.getIdToken();
    const loanTransaction = await this.acbsBundleInformationService.getBundleInformationByIdentifier(bundleIdentifier, 'Loan transaction', idToken);
    const [loan] = loanTransaction.BundleMessageList;

    if (!isNewLoanRequest(loan)) {
      throw new BadRequestException('Bad request', 'The provided bundleIdentifier does not correspond to a loan transaction.');
    }
    return this.mapLoanTransaction(loanTransaction, loan);
  }

  private mapLoanTransaction(loanTransaction: AcbsGetBundleInformationResponseDto, loan: NewLoanRequest): GetFacilityLoanTransactionResponseDto {
    const accrualScheduleList = loan.AccrualScheduleList;
    const pacAccrual = this.findFirstAccrualMatchingCategoryCode(
      PROPERTIES.FACILITY_LOAN.DEFAULT.accrualScheduleList.accrualCategory.accrualCategoryCode.pac,
      accrualScheduleList,
    );
    const ctlAccrual = this.findFirstAccrualMatchingCategoryCode(
      PROPERTIES.FACILITY_LOAN.DEFAULT.accrualScheduleList.accrualCategory.accrualCategoryCode.ctl,
      accrualScheduleList,
    );
    const [firstAccrual] = accrualScheduleList;
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
  }

  private findFirstAccrualMatchingCategoryCode(categoryCode: string, accrualScheduleList: AccrualSchedule[]): AccrualSchedule {
    return accrualScheduleList.find((accrual) => accrual.AccrualCategory.AccrualCategoryCode === categoryCode);
  }
}
