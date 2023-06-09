import { Injectable } from '@nestjs/common';
import { ENUMS, PROPERTIES } from '@ukef/constants';
import { CURRENCIES } from '@ukef/constants/currencies.constant';
import { AcbsBundleId, UkefId } from '@ukef/helpers';
import { AcbsBundleInformationService } from '@ukef/modules/acbs/acbs-bundle-information.service';
import { AcbsFacilityLoanService } from '@ukef/modules/acbs/acbs-facility-loan.service';
import { AcbsCreateBundleInformationRequestDto } from '@ukef/modules/acbs/dto/acbs-create-bundle-information-request.dto';
import { LoanAdvanceTransaction } from '@ukef/modules/acbs/dto/bundle-actions/loan-advance-transaction.bundle-action';
import { NewLoanRequest } from '@ukef/modules/acbs/dto/bundle-actions/new-loan-request.bundle-action';
import { AcbsAuthenticationService } from '@ukef/modules/acbs-authentication/acbs-authentication.service';
import { CurrentDateProvider } from '@ukef/modules/date/current-date.provider';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { AccrualScheduleBuilder } from '@ukef/modules/facility-loan/accrual-schedule.builder';

import { AcbsLoanService } from '../acbs/acbs-loan-service';
import { AcbsUpdateLoanRequest } from '../acbs/dto/acbs-update-loan-request.dto';
import { CreateFacilityLoanRequestItem } from './dto/create-facility-loan-request.dto';
import { CreateFacilityLoanResponse } from './dto/create-facility-loan-response.dto';
import { CreateLoanAmountAmendmentRequestItem } from './dto/create-loan-amount-amendment-request.dto';
import { GetFacilityLoanResponseDto } from './dto/get-facility-loan-response.dto';
import { UpdateLoanExpiryDateRequest } from './dto/update-loan-expiry-date-request.dto';
import { RepaymentScheduleBuilder } from './repayment-schedule.builder';

@Injectable()
export class FacilityLoanService {
  constructor(
    private readonly acbsAuthenticationService: AcbsAuthenticationService,
    private readonly acbsFacilityLoanService: AcbsFacilityLoanService,
    private readonly acbsBundleInformationService: AcbsBundleInformationService,
    private readonly dateStringTransformations: DateStringTransformations,
    private readonly currentDateProvider: CurrentDateProvider,
    private readonly repaymentScheduleBuilder: RepaymentScheduleBuilder,
    private readonly acbsLoanService: AcbsLoanService,
    private readonly accrualScheduleBuilder: AccrualScheduleBuilder,
  ) {}

  async getLoansForFacility(facilityIdentifier: string): Promise<GetFacilityLoanResponseDto> {
    const { portfolioIdentifier } = PROPERTIES.GLOBAL;
    const idToken = await this.getIdToken();
    const loansInAcbs = await this.acbsFacilityLoanService.getLoansForFacility(portfolioIdentifier, facilityIdentifier, idToken);
    return loansInAcbs.map((loan) => {
      return {
        portfolioIdentifier: loan.PortfolioIdentifier,
        loanIdentifier: loan.LoanIdentifier,
        facilityIdentifier: loan.ParentFacilityIdentifier,
        borrowerPartyIdentifier: loan.PrimaryParty.PartyIdentifier,
        productTypeId: loan.ProductType.ProductTypeCode,
        productTypeGroup: loan.ProductGroup.ProductGroupCode,
        currency: loan.Currency.CurrencyCode,
        issueDate: this.dateStringTransformations.removeTime(loan.EffectiveDate),
        expiryDate: this.dateStringTransformations.removeTime(loan.MaturityDate),
        principalBalance: loan.PrincipalBalance,
        interestBalance: loan.InterestBalance,
        feeBalance: loan.FeeBalance,
        otherBalance: loan.OtherBalance,
        discountedPrincipal: loan.DiscountedPrincipal,
      };
    });
  }

  async createLoanForFacility(facilityIdentifier: UkefId, newFacilityLoan: CreateFacilityLoanRequestItem): Promise<CreateFacilityLoanResponse> {
    const idToken = await this.getIdToken();

    const bundleMessage: NewLoanRequest = {
      ...this.getBaseMessage(facilityIdentifier, newFacilityLoan),
      ...this.getFieldsThatDependOnGbp(newFacilityLoan),
      ...(newFacilityLoan.dealCustomerUsageRate && { DealCustomerUsageRate: newFacilityLoan.dealCustomerUsageRate }),
      ...(newFacilityLoan.dealCustomerUsageOperationType && {
        DealCustomerUsageOperationType: {
          OperationTypeCode: newFacilityLoan.dealCustomerUsageOperationType,
        },
      }),
    };

    const bundleInformationToCreateInAcbs: AcbsCreateBundleInformationRequestDto<NewLoanRequest> = {
      PortfolioIdentifier: PROPERTIES.GLOBAL.portfolioIdentifier,
      InitiatingUserName: PROPERTIES.FACILITY_LOAN.DEFAULT.initiatingUserName,
      ServicingUserAccountIdentifier: PROPERTIES.FACILITY_LOAN.DEFAULT.servicingUserAccountIdentifier,
      UseAPIUserIndicator: PROPERTIES.FACILITY_LOAN.DEFAULT.useAPIUserIndicator,
      InitialBundleStatusCode: PROPERTIES.FACILITY_LOAN.DEFAULT.initialBundleStatusCode,
      PostingDate: this.dateStringTransformations.addTimeToDateOnlyString(newFacilityLoan.postingDate),
      BundleMessageList: [bundleMessage],
    };

    const response = await this.acbsBundleInformationService.createBundleInformation(bundleInformationToCreateInAcbs, idToken);
    return { bundleIdentifier: response.BundleIdentifier };
  }

  async createAmountAmendmentForLoan(loanIdentifier: string, loanAmountAmendment: CreateLoanAmountAmendmentRequestItem): Promise<AcbsBundleId> {
    const idToken = await this.getIdToken();
    const loanAmountAmendmentBundle = this.buildLoanAmountAmendmentBundle(loanIdentifier, loanAmountAmendment);
    const { BundleIdentifier } = await this.acbsBundleInformationService.createBundleInformation(loanAmountAmendmentBundle, idToken);
    return BundleIdentifier;
  }

  async updateLoanExpiryDate(loanIdentifier: string, updateLoanExpiryDateRequest: UpdateLoanExpiryDateRequest): Promise<void> {
    const { portfolioIdentifier } = PROPERTIES.GLOBAL;
    const { expiryDate } = updateLoanExpiryDateRequest;

    const newExpiryDate = this.dateStringTransformations.addTimeToDateOnlyString(expiryDate);
    const idToken = await this.getIdToken();
    const loanInAcbs = await this.acbsLoanService.getLoanByIdentifier(portfolioIdentifier, loanIdentifier, idToken);
    const acbsUpdateLoanExpiryDateRequest: AcbsUpdateLoanRequest = {
      ...loanInAcbs,
      MaturityDate: newExpiryDate,
      RateMaturityDate: newExpiryDate,
      ...(loanInAcbs.FinancialNextValuationDate && { FinancialNextValuationDate: newExpiryDate }),
      ...(loanInAcbs.CustomerUsageNextValuationDate && { CustomerUsageNextValuationDate: newExpiryDate }),
    };
    await this.acbsLoanService.updateLoanByIdentifier(portfolioIdentifier, acbsUpdateLoanExpiryDateRequest, idToken);
  }

  private getIdToken(): Promise<string> {
    return this.acbsAuthenticationService.getIdToken();
  }

  private getBaseMessage(facilityIdentifier: UkefId, newFacilityLoan: CreateFacilityLoanRequestItem) {
    const loanInstrumentCode =
      newFacilityLoan.productTypeId === ENUMS.PRODUCT_TYPE_IDS.GEF_CONTINGENT ? ENUMS.PRODUCT_TYPE_IDS.GEF_CASH : newFacilityLoan.productTypeId;
    const issueDateString = this.dateStringTransformations.getEarliestDateFromTodayAndDateAsString(newFacilityLoan.issueDate, this.currentDateProvider);
    const repaymentSchedules = this.repaymentScheduleBuilder.getRepaymentSchedules(newFacilityLoan);
    const accrualSchedules = this.accrualScheduleBuilder.getAccrualSchedules(newFacilityLoan);

    return {
      $type: PROPERTIES.FACILITY_LOAN.DEFAULT.messageType,
      FacilityIdentifier: facilityIdentifier,
      BorrowerPartyIdentifier: newFacilityLoan.borrowerPartyIdentifier,
      SectionIdentifier: PROPERTIES.FACILITY_LOAN.DEFAULT.sectionIdentifier,
      LoanInstrumentCode: loanInstrumentCode,
      Currency: {
        CurrencyCode: newFacilityLoan.currency,
      },
      LoanAmount: newFacilityLoan.amount,
      EffectiveDate: issueDateString,
      RateSettingDate: issueDateString,
      RateMaturityDate: this.dateStringTransformations.addTimeToDateOnlyString(newFacilityLoan.expiryDate),
      MaturityDate: this.dateStringTransformations.addTimeToDateOnlyString(newFacilityLoan.expiryDate),
      ServicingUser: {
        UserAcbsIdentifier: PROPERTIES.FACILITY_LOAN.DEFAULT.servicingUser.userAcbsIdentifier,
        UserName: PROPERTIES.FACILITY_LOAN.DEFAULT.servicingUser.userName,
      },
      AdministrativeUser: {
        UserAcbsIdentifier: PROPERTIES.FACILITY_LOAN.DEFAULT.administrativeUser.userAcbsIdentifier,
        UserName: PROPERTIES.FACILITY_LOAN.DEFAULT.administrativeUser.userName,
      },
      ServicingUnit: {
        ServicingUnitIdentifier: PROPERTIES.FACILITY_LOAN.DEFAULT.servicingUnit.servicingUnitIdentifier,
      },
      ServicingUnitSection: {
        ServicingUnitSectionIdentifier: PROPERTIES.FACILITY_LOAN.DEFAULT.servicingUnitSection.servicingUnitSectionIdentifier,
      },
      ClosureType: {
        ClosureTypeCode: PROPERTIES.FACILITY_LOAN.DEFAULT.closureType.closureTypeCode,
      },
      AgentPartyIdentifier: PROPERTIES.FACILITY_LOAN.DEFAULT.agentPartyIdentifier,
      AgentAddressIdentifier: PROPERTIES.FACILITY_LOAN.DEFAULT.agentAddressIdentifier,
      InterestRateType: {
        InterestRateTypeCode: PROPERTIES.FACILITY_LOAN.DEFAULT.interestRateType.interestRateTypeCode,
      },
      BookingType: {
        LoanBookingTypeCode: PROPERTIES.FACILITY_LOAN.DEFAULT.bookingType.loanBookingTypeCode,
      },
      LoanReviewFrequencyType: {
        LoanReviewFrequencyTypeCode: PROPERTIES.FACILITY_LOAN.DEFAULT.loanReviewFrequencyType.loanReviewFrequencyTypeCode,
      },
      CurrentRiskOfficerIdentifier: PROPERTIES.FACILITY_LOAN.DEFAULT.currentRiskOfficerIdentifier,
      ProductGroup: {
        ProductGroupCode: newFacilityLoan.productTypeGroup,
      },
      ProductType: {
        ProductTypeCode: newFacilityLoan.productTypeId,
      },
      LoanAdvanceType: {
        LoanAdvanceTypeCode: PROPERTIES.FACILITY_LOAN.DEFAULT.loanAdvanceType.loanAdvanceTypeCode,
      },
      GeneralLedgerUnit: {
        GeneralLedgerUnitIdentifier: PROPERTIES.FACILITY_LOAN.DEFAULT.generalLedgerUnit.generalLedgerUnitIdentifier,
      },
      CashEventList: [
        {
          PaymentInstructionCode: PROPERTIES.FACILITY_LOAN.DEFAULT.cashEventList.paymentInstructionCode,
          CashOffsetTypeCode: PROPERTIES.FACILITY_LOAN.DEFAULT.cashEventList.cashOffsetTypeCode,
          Currency: {
            CurrencyCode: newFacilityLoan.currency,
          },
          SettlementCurrencyCode: PROPERTIES.FACILITY_LOAN.DEFAULT.cashEventList.settlementCurrencyCode,
          OriginatingGeneralLedgerUnit: PROPERTIES.FACILITY_LOAN.DEFAULT.cashEventList.originatingGeneralLedgerUnit,
          DDAAccount: PROPERTIES.FACILITY_LOAN.DEFAULT.cashEventList.dDAAccount,
          CashDetailAmount: newFacilityLoan.amount,
          CashReferenceIdentifier: PROPERTIES.FACILITY_LOAN.DEFAULT.cashEventList.cashReferenceIdentifier,
        },
      ],
      SecuredType: {
        LoanSecuredTypeCode: PROPERTIES.FACILITY_LOAN.DEFAULT.securedType.loanSecuredTypeCode,
      },
      AccrualScheduleList: accrualSchedules,
      RepaymentScheduleList: repaymentSchedules,
    };
  }

  private getFieldsThatDependOnGbp(newFacilityLoan: CreateFacilityLoanRequestItem) {
    const isNotGbp = newFacilityLoan.currency !== CURRENCIES.GBP;
    return isNotGbp
      ? {
          FinancialRateGroup: PROPERTIES.FACILITY_LOAN.DEFAULT.financialRateGroup,
          CustomerUsageRateGroup: PROPERTIES.FACILITY_LOAN.DEFAULT.customerUsageRateGroup,
          FinancialFrequency: {
            UsageFrequencyTypeCode: PROPERTIES.FACILITY_LOAN.DEFAULT.financialFrequency.usageFrequencyTypeCode,
          },
          CustomerUsageFrequency: {
            UsageFrequencyTypeCode: PROPERTIES.FACILITY_LOAN.DEFAULT.customerUsageFrequency.usageFrequencyTypeCode,
          },
          FinancialBusinessDayAdjustment: {
            BusinessDayAdjustmentTypeCode: PROPERTIES.FACILITY_LOAN.DEFAULT.financialBusinessDayAdjustment.businessDayAdjustmentTypeCode,
          },
          CustomerUsageBusinessDayAdjustment: {
            BusinessDayAdjustmentTypeCode: PROPERTIES.FACILITY_LOAN.DEFAULT.customerUsageBusinessDayAdjustment.businessDayAdjustmentTypeCode,
          },
          FinancialCalendar: {
            CalendarIdentifier: PROPERTIES.FACILITY_LOAN.DEFAULT.financialCalendar.calendarIdentifier,
          },
          CustomerUsageCalendar: {
            CalendarIdentifier: PROPERTIES.FACILITY_LOAN.DEFAULT.customerUsageCalendar.calendarIdentifier,
          },
          FinancialNextValuationDate: this.dateStringTransformations.addTimeToDateOnlyString(newFacilityLoan.expiryDate),
          CustomerUsageNextValuationDate: this.dateStringTransformations.addTimeToDateOnlyString(newFacilityLoan.expiryDate),
          FinancialLockMTMRateIndicator: PROPERTIES.FACILITY_LOAN.DEFAULT.financialLockMTMRateIndicator,
          CustomerUsageLockMTMRateIndicator: PROPERTIES.FACILITY_LOAN.DEFAULT.customerUsageLockMTMRateIndicator,
        }
      : {};
  }

  private buildLoanAmountAmendmentBundle(
    loanIdentifier: string,
    loanAmountAmendment: CreateLoanAmountAmendmentRequestItem,
  ): AcbsCreateBundleInformationRequestDto<LoanAdvanceTransaction> {
    const { portfolioIdentifier } = PROPERTIES.GLOBAL;
    const { bundleMessageList: messageListDefaultValues, ...defaultValues } = PROPERTIES.LOAN_AMOUNT_AMENDMENT.DEFAULT;
    const { increase: increaseTransactionTypeCode, decrease: decreaseTransactionTypeCode } = messageListDefaultValues.transactionTypeCode;

    const isIncrease = loanAmountAmendment.amountAmendment > 0;
    const transactionTypeCode = isIncrease ? increaseTransactionTypeCode : decreaseTransactionTypeCode;
    const loanAdvanceAmount = Math.abs(loanAmountAmendment.amountAmendment);
    const effectiveDate = this.dateStringTransformations.addTimeToDateOnlyString(loanAmountAmendment.effectiveDate);

    return {
      PortfolioIdentifier: portfolioIdentifier,
      InitialBundleStatusCode: defaultValues.initialBundleStatusCode,
      InitiatingUserName: defaultValues.initiatingUserName,
      UseAPIUserIndicator: defaultValues.useAPIUserIndicator,
      BundleMessageList: [
        {
          $type: messageListDefaultValues.type,
          EffectiveDate: effectiveDate,
          LoanIdentifier: loanIdentifier,
          TransactionTypeCode: transactionTypeCode,
          IsDraftIndicator: messageListDefaultValues.isDraftIndicator,
          CashOffsetTypeCode: messageListDefaultValues.cashOffsetTypeCode,
          LoanAdvanceAmount: loanAdvanceAmount,
        },
      ],
    };
  }
}
