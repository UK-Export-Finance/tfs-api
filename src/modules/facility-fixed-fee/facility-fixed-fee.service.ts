import { BadRequestException, Injectable } from '@nestjs/common';
import { ENUMS, PROPERTIES } from '@ukef/constants';
import { AcbsPartyId, DateOnlyString, DateString, UkefId } from '@ukef/helpers';
import { AcbsBundleInformationService } from '@ukef/modules/acbs/acbs-bundle-information.service';
import { AcbsFacilityFixedFeeService } from '@ukef/modules/acbs/acbs-facility-fixed-fee.service';
import { FacilityFeeAmountTransaction } from '@ukef/modules/acbs/dto/bundle-actions/facility-fee-amount-transaction.bundle-action';
import { AcbsAuthenticationService } from '@ukef/modules/acbs-authentication/acbs-authentication.service';
import { CurrentDateProvider } from '@ukef/modules/date/current-date.provider';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';

import { AcbsCreateBundleInformationRequestDto } from '../acbs/dto/acbs-create-bundle-information-request.dto';
import { CreateFixedFeeAmountAmendmentRequest } from './dto/create-facility-fixed-fee-amount-amendment-request.dto';
import { CreateFixedFeeAmountAmendmentResponse } from './dto/create-facility-fixed-fee-amount-amendment-response.dto';
import { CreateFacilityFixedFeeRequestItem } from './dto/create-facility-fixed-fee-request.dto';
import { CreateFacilityFixedFeeResponse } from './dto/create-facility-fixed-fee-response.dto';
import { GetFacilityFixedFeeResponse } from './dto/get-facility-fixed-fee-response.dto';

@Injectable()
export class FacilityFixedFeeService {
  constructor(
    private readonly acbsAuthenticationService: AcbsAuthenticationService,
    private readonly acbsFacilityFixedFeeService: AcbsFacilityFixedFeeService,
    private readonly acbsBundleInformationService: AcbsBundleInformationService,
    private readonly dateStringTransformations: DateStringTransformations,
    private readonly currentDateProvider: CurrentDateProvider,
  ) {}

  async getFixedFeesForFacility(facilityIdentifier: string): Promise<GetFacilityFixedFeeResponse> {
    const { portfolioIdentifier } = PROPERTIES.GLOBAL;
    const idToken = await this.acbsAuthenticationService.getIdToken();
    const fixedFeesInAcbs = await this.acbsFacilityFixedFeeService.getFixedFeesForFacility(portfolioIdentifier, facilityIdentifier, idToken);

    return fixedFeesInAcbs.map((fixedFee) => {
      const effectiveDate = this.dateStringTransformations.removeTimeIfExists(fixedFee.EffectiveDate);
      const expirationDate = this.dateStringTransformations.removeTimeIfExists(fixedFee.ExpirationDate);
      const nextDueDate = this.dateStringTransformations.removeTimeIfExists(fixedFee.NextDueDate);
      const nextAccrueToDate = this.dateStringTransformations.removeTimeIfExists(fixedFee.NextAccrueToDate);

      return {
        facilityIdentifier,
        portfolioIdentifier,
        amount: fixedFee.FixedFeeAmount,
        currentPayoffAmount: fixedFee.CurrentPayoffAmount,
        effectiveDate,
        expirationDate,
        nextDueDate,
        nextAccrueToDate,
        period: fixedFee.SegmentIdentifier,
        description: fixedFee.Description,
        currency: fixedFee.Currency.CurrencyCode,
        lenderTypeCode: fixedFee.LenderType.LenderTypeCode,
        incomeClassCode: fixedFee.IncomeClass.IncomeClassCode,
      };
    });
  }

  async createFixedFeeForFacility(
    facilityIdentifier: UkefId,
    borrowerPartyIdentifier: AcbsPartyId,
    facilityTypeCode,
    newCreateFacilityFixedFee: CreateFacilityFixedFeeRequestItem,
    facilityOverallStatus,
    facilityStageCode,
  ): Promise<CreateFacilityFixedFeeResponse> {
    if (facilityStageCode !== ENUMS.FACILITY_STAGES.ISSUED) {
      throw new BadRequestException('Bad request', 'Facility needs to be issued before a fixed fee is created');
    }

    if (facilityOverallStatus !== ENUMS.FACILITY_STATUSES.ACTIVE) {
      throw new BadRequestException('Bad request', 'Facility needs to be activated before a fixed fee is created');
    }

    const { portfolioIdentifier } = PROPERTIES.GLOBAL;
    const idToken = await this.acbsAuthenticationService.getIdToken();

    const defaultValues = PROPERTIES.FACILITY_FIXED_FEE.DEFAULT;

    const fixedFeeToCreateInAcbs = {
      FixedFeeAmount: newCreateFacilityFixedFee.amount,
      FixedFeeChargeType: {
        FixedFeeChargeTypeCode: defaultValues.fixedFeeChargeType.fixedFeeChargeTypeCode,
      },
      FixedFeeEarningMethod: {
        FixedFeeEarningMethodCode: defaultValues.fixedFeeEarningMethod.fixedFeeEarningMethodCode,
      },
      SectionIdentifier: defaultValues.sectionIdentifier,
      LimitType: {
        LimitTypeCode: defaultValues.limitType.limitTypeCode,
      },
      LimitKey: borrowerPartyIdentifier,
      InvolvedParty: {
        PartyIdentifier:
          newCreateFacilityFixedFee.lenderTypeCode == ENUMS.LENDER_TYPE_CODES.ECGD
            ? (defaultValues.involvedParty.partyIdentifier as AcbsPartyId)
            : borrowerPartyIdentifier,
      },
      SegmentIdentifier: newCreateFacilityFixedFee.period,
      EffectiveDate: this.calculateEffectiveDateForCreation(newCreateFacilityFixedFee.effectiveDate),
      ExpirationDate: this.dateStringTransformations.addTimeToDateOnlyString(newCreateFacilityFixedFee.expirationDate),
      Currency: {
        CurrencyCode: newCreateFacilityFixedFee.currency,
      },
      NextDueDate: this.dateStringTransformations.addTimeToDateOnlyString(newCreateFacilityFixedFee.nextDueDate),
      LeadDays: defaultValues.leadDays,
      NextAccrueToDate: this.dateStringTransformations.addTimeToDateOnlyString(newCreateFacilityFixedFee.nextAccrueToDate),
      FeeMail: {
        FeeMailCode: '',
      },
      AccountingMethod: {
        AccountingMethodCode: defaultValues.accountingMethodCode,
      },
      FeeStartDateType: {
        FeeStartDateTypeCode: defaultValues.feeStartDateTypeCode,
      },
      BillingFrequencyType: {
        BillingFrequencyTypeCode: defaultValues.billingFrequencyTypeCode,
      },
      Description: defaultValues.description[`${facilityTypeCode}`],
      FeeStatus: {
        FeeStatusCode: defaultValues.feeStatusCode,
      },
      IncomeClass: {
        IncomeClassCode: newCreateFacilityFixedFee.incomeClassCode ?? defaultValues.incomeClassCode,
      },
      LenderType: {
        LenderTypeCode: newCreateFacilityFixedFee.lenderTypeCode,
      },
      BusinessDayAdjustmentType: {
        BusinessDayAdjustmentTypeCode: defaultValues.businessDayAdjustmentTypeCode,
      },
      AccrueToBusinessDayAdjustmentType: {
        BusinessDayAdjustmentTypeCode: defaultValues.accrueToBusinessDayAdjustmentTypeCode,
      },
      Calendar: {
        CalendarIdentifier: defaultValues.calendarIdentifier,
      },
      FinancialCurrentFXRate: defaultValues.financialCurrentFXRate,
      FinancialCurrentFXRateOperand: defaultValues.financialCurrentFXRateOperand,
      SpreadToInvestorsIndicator: newCreateFacilityFixedFee.spreadToInvestorsIndicator,
    };

    await this.acbsFacilityFixedFeeService.createFixedFeeForFacility(portfolioIdentifier, facilityIdentifier, fixedFeeToCreateInAcbs, idToken);
    return { facilityIdentifier };
  }

  async createAmountAmendmentForFixedFees(
    facilityIdentifier: UkefId,
    newFixedFeeAmountAmendmentRequest: CreateFixedFeeAmountAmendmentRequest,
  ): Promise<CreateFixedFeeAmountAmendmentResponse> {
    const idToken = await this.acbsAuthenticationService.getIdToken();

    const amountAmendmentMessages = this.buildAmountAmendmentMessages(facilityIdentifier, newFixedFeeAmountAmendmentRequest);

    const bundleInformationToCreateInAcbs: AcbsCreateBundleInformationRequestDto<FacilityFeeAmountTransaction> = {
      PortfolioIdentifier: PROPERTIES.GLOBAL.portfolioIdentifier,
      InitialBundleStatusCode: PROPERTIES.FACILITY_FEE_AMOUNT_TRANSACTION.DEFAULT.initialBundleStatusCode,
      InitiatingUserName: PROPERTIES.FACILITY_FEE_AMOUNT_TRANSACTION.DEFAULT.initiatingUserName,
      UseAPIUserIndicator: PROPERTIES.FACILITY_FEE_AMOUNT_TRANSACTION.DEFAULT.useAPIUserIndicator,
      BundleMessageList: amountAmendmentMessages,
    };

    const response = await this.acbsBundleInformationService.createBundleInformation(bundleInformationToCreateInAcbs, idToken);
    return { bundleIdentifier: response.BundleIdentifier };
  }

  private calculateEffectiveDateForCreation(effectiveDate: DateOnlyString): DateString {
    const effectiveDateTime = this.currentDateProvider.getEarliestDateFromTodayAnd(
      new Date(this.dateStringTransformations.addTimeToDateOnlyString(effectiveDate)),
    );
    return this.dateStringTransformations.getDateStringFromDate(effectiveDateTime);
  }

  private buildAmountAmendmentMessages(
    facilityIdentifier,
    newFixedFeeAmountAmendmentRequest: CreateFixedFeeAmountAmendmentRequest,
  ): FacilityFeeAmountTransaction[] {
    const defaultValues = PROPERTIES.FACILITY_FEE_AMOUNT_TRANSACTION.DEFAULT.bundleMessageList;
    return newFixedFeeAmountAmendmentRequest.map((item) => ({
      $type: defaultValues.type,
      AccountOwnerIdentifier: defaultValues.accountOwnerIdentifier,
      EffectiveDate: this.dateStringTransformations.addTimeToDateOnlyString(item.effectiveDate),
      FacilityIdentifier: facilityIdentifier,
      FacilityFeeTransactionType: {
        TypeCode:
          item.amountAmendment < 0 ? defaultValues.facilityFeeTransactionType.decreaseTypeCode : defaultValues.facilityFeeTransactionType.increaseTypeCode,
      },
      IsDraftIndicator: defaultValues.isDraftIndicator,
      LenderType: {
        LenderTypeCode: item.lenderTypeCode || defaultValues.lenderTypeCode,
      },
      LimitKeyValue: item.partyIdentifier,
      LimitType: {
        LimitTypeCode: defaultValues.limitType.limitTypeCode,
      },
      SectionIdentifier: defaultValues.sectionIdentifier,
      SegmentIdentifier: item.period,
      TransactionAmount: Math.abs(item.amountAmendment),
    }));
  }
}
