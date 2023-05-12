import { Injectable } from '@nestjs/common';
import { ENUMS, PROPERTIES } from '@ukef/constants';
import { AcbsFacilityLoanService } from '@ukef/modules/acbs/acbs-facility-loan.service';
import { AcbsAuthenticationService } from '@ukef/modules/acbs-authentication/acbs-authentication.service';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';

import { AcbsBundleInformationService } from '../acbs/acbs-bundleInformation.service';
import { CreateFacilityLoanResponseDto } from './dto/create-facility-loan-response.dto';
import { GetFacilityLoanResponseDto } from './dto/get-facility-loan-response.dto';
import { FacilityLoanToCreate } from './facility-loan-to-create.interface';
import { DateString, UkefId } from '@ukef/helpers';
import { CurrentDateProvider } from '../date/current-date.provider';

@Injectable()
export class FacilityLoanService {
  constructor(
    private readonly acbsAuthenticationService: AcbsAuthenticationService,
    private readonly acbsFacilityLoanService: AcbsFacilityLoanService,
    private readonly acbsBundleInformationService: AcbsBundleInformationService,
    private readonly dateStringTransformations: DateStringTransformations,
    private readonly currentDateProvider: CurrentDateProvider,
  ) { }

  async getLoansForFacility(facilityIdentifier: string): Promise<GetFacilityLoanResponseDto> {
    const { portfolioIdentifier } = PROPERTIES.GLOBAL;
    const idToken = await this.acbsAuthenticationService.getIdToken();
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

  async createLoanForFacility(
    facilityIdentifier: UkefId,
    newFacilityLoan: FacilityLoanToCreate,
  ): Promise<CreateFacilityLoanResponseDto> {
    const idToken = await this.acbsAuthenticationService.getIdToken();
    const defaultValues = PROPERTIES.FACILITY_LOAN.DEFAULT;

    const bundleMessage = {
      ...this.getBaseMessage(defaultValues, facilityIdentifier, newFacilityLoan),
      ...this.getDealCustomerUsageRate(newFacilityLoan),
      ...this.getDealCustomerUsageOperationType(newFacilityLoan),
      ...this.getFieldsThatDependOnGbp(defaultValues, newFacilityLoan),
    };

    const bundleInformationToCreateInAcbs = {
      PortfolioIdentifier: PROPERTIES.GLOBAL.portfolioIdentifier,
      InitiatingUserName: defaultValues.initiatingUserName,
      ServicingUserAccountIdentifier: defaultValues.servicingUserAccountIdentifier,
      UseAPIUserIndicator: defaultValues.useAPIUserIndicator,
      InitialBundleStatusCode: defaultValues.initialBundleStatusCode,
      PostingDate: this.dateStringTransformations.addTimeToDateOnlyString(newFacilityLoan.postingDate),
      BundleMessageList: [bundleMessage],
    };

    const response = await this.acbsBundleInformationService.createBundleInformation(bundleInformationToCreateInAcbs, idToken);
    return { bundleIdentifier: response.BundleIdentifier };
  }

  //add types to these functions
  private getBaseMessage(defaultValues, facilityIdentifier, newFacilityLoan) {
    //use enum here and change this to use if(){}
    const loanInstrumentCode = newFacilityLoan.productTypeGroup === 'GM'
      ? '280'
      : newFacilityLoan.productTypeGroup === 'BS'
        ? '250'
        : '260';
    const issueDateString = this.getIssueDateToCreate(newFacilityLoan);

    return {
      $type: defaultValues.messageType,
      FacilityIdentifier: facilityIdentifier,
      BorrowerPartyIdentifier: newFacilityLoan.borrowerPartyIdentifier,
      SectionIdentifier: defaultValues.sectionIdentifier,
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
        UserAcbsIdentifier: defaultValues.servicingUser.userAcbsIdentifier,
        UserName: defaultValues.servicingUser.userName,
      },
      AdministrativeUser: {
        UserAcbsIdentifier: defaultValues.administrativeUser.userAcbsIdentifier,
        UserName: defaultValues.administrativeUser.userName,
      },
      ServicingUnit: {
        ServicingUnitIdentifier: defaultValues.servicingUnit.servicingUnitIdentifier,
      },
      ServicingUnitSection: {
        ServicingUnitSectionIdentifier: defaultValues.servicingUnitSection.servicingUnitSectionIdentifier,
      },
      ClosureType: {
        ClosureTypeCode: defaultValues.closureType.closureTypeCode,
      },
      AgentPartyIdentifier: defaultValues.agentPartyIdentifier,
      AgentAddressIdentifier: defaultValues.agentAddressIdentifier,
      InterestRateType: {
        InterestRateTypeCode: defaultValues.interestRateType.interestRateTypeCode,
      },
      BookingType: {
        LoanBookingTypeCode: defaultValues.bookingType.loanBookingTypeCode,
      },
      LoanReviewFrequencyType: {
        LoanReviewFrequencyTypeCode: defaultValues.loanReviewFrequencyType.loanReviewFrequencyTypeCode,
      },
      CurrentRiskOfficerIdentifier: defaultValues.currentRiskOfficerIdentifier,
      ProductGroup: {
        ProductGroupCode: newFacilityLoan.productTypeGroup,
      },
      ProductType: {
        ProductTypeCode: newFacilityLoan.productTypeId,
      },
      LoanAdvanceType: {
        LoanAdvanceTypeCode: defaultValues.loanAdvanceType.loanAdvanceTypeCode,
      },
      GeneralLedgerUnit: {
        GeneralLedgerUnitIdentifier: defaultValues.generalLedgerUnit.generalLedgerUnitIdentifier,
      },
      CashEventList: [
        {
          PaymentInstructionCode: defaultValues.cashEventList.paymentInstructionCode,
          CashOffsetTypeCode: defaultValues.cashEventList.cashOffsetTypeCode,
          Currency: {
            CurrencyCode: newFacilityLoan.currency,
          },
          SettlementCurrencyCode: defaultValues.cashEventList.settlementCurrencyCode,
          OriginatingGeneralLedgerUnit: defaultValues.cashEventList.originatingGeneralLedgerUnit,
          DDAAccount: defaultValues.cashEventList.dDAAccount,
          CashDetailAmount: newFacilityLoan.amount,
          CashReferenceIdentifier: defaultValues.cashEventList.cashReferenceIdentifier,
        },
      ],
      SecuredType: {
        LoanSecuredTypeCode: defaultValues.securedType.loanSecuredTypeCode,
      },
    };
  }

  private getDealCustomerUsageRate(newFacilityLoan) {
    return newFacilityLoan.dealCustomerUsageRate
      ? { DealCustomerUsageRate: newFacilityLoan.dealCustomerUsageRate, }
      : {}
  }

  private getDealCustomerUsageOperationType(newFacilityLoan) {
    return newFacilityLoan.dealCustomerUsageOperationType
      ? {
        DealCustomerUsageOperationType: {
          OperationTypeCode: newFacilityLoan.dealCustomerUsageOperationType,
        },
      }
      : {}
  }

  private getFieldsThatDependOnGbp(defaultValues, newFacilityLoan) {
    const isNotGbp = newFacilityLoan.currency !== 'GBP';
    return isNotGbp
      ? {
        FinancialRateGroup: defaultValues.financialRateGroup,
        CustomerUsageRateGroup: defaultValues.customerUsageRateGroup,
        FinancialFrequency: {
          UsageFrequencyTypeCode: defaultValues.financialFrequency.usageFrequencyTypeCode,
        },
        CustomerUsageFrequency: {
          UsageFrequencyTypeCode: defaultValues.customerUsageFrequency.usageFrequencyTypeCode,
        },
        FinancialBusinessDayAdjustment: {
          BusinessDayAdjustmentTypeCode: defaultValues.financialBusinessDayAdjustment.businessDayAdjustmentTypeCode,
        },
        CustomerUsageBusinessDayAdjustment: {
          BusinessDayAdjustmentTypeCode: defaultValues.customerUsageBusinessDayAdjustment.businessDayAdjustmentTypeCode,
        },
        FinancialCalendar: {
          CalendarIdentifier: defaultValues.financialCalendar.calendarIdentifier,
        },
        CustomerUsageCalendar: {
          CalendarIdentifier: defaultValues.customerUsageCalendar.calendarIdentifier,
        },
        FinancialNextValuationDate: this.dateStringTransformations.addTimeToDateOnlyString(newFacilityLoan.expiryDate),
        CustomerUsageNextValuationDate: this.dateStringTransformations.addTimeToDateOnlyString(newFacilityLoan.expiryDate),
        FinancialLockMTMRateIndicator: defaultValues.financialLockMTMRateIndicator,
        CustomerUsageLockMTMRateIndicator: defaultValues.customerUsageLockMTMRateIndicator,
      }
      : {}
  }

  private getIssueDateToCreate(facilityLoanToCreate: FacilityLoanToCreate): DateString {
    const issueDateTime = this.currentDateProvider.getEarliestDateFromTodayAnd(
      new Date(this.dateStringTransformations.addTimeToDateOnlyString(facilityLoanToCreate.issueDate)),
    );
    return this.dateStringTransformations.getDateStringFromDate(issueDateTime);
  }
}
