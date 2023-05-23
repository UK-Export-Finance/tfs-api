import { Injectable } from '@nestjs/common';
import { ENUMS, PROPERTIES } from '@ukef/constants';
import { AcbsPartyId, DateOnlyString, DateString, UkefId } from '@ukef/helpers';
import { AcbsFacilityFixedFeeService } from '@ukef/modules/acbs/acbs-facility-fixed-fee.service';
import { AcbsAuthenticationService } from '@ukef/modules/acbs-authentication/acbs-authentication.service';
import { CurrentDateProvider } from '@ukef/modules/date/current-date.provider';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';

import { CreateFacilityFixedFeeRequestItem } from './dto/create-facility-fixed-fee-request.dto';
import { CreateFacilityFixedFeeResponse } from './dto/create-facility-fixed-fee-response.dto';
import { GetFacilityFixedFeeResponse } from './dto/get-facility-fixed-fee-response.dto';

@Injectable()
export class FacilityFixedFeeService {
  constructor(
    private readonly acbsAuthenticationService: AcbsAuthenticationService,
    private readonly acbsFacilityFixedFeeService: AcbsFacilityFixedFeeService,
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
  ): Promise<CreateFacilityFixedFeeResponse> {
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

  private calculateEffectiveDateForCreation(effectiveDate: DateOnlyString): DateString {
    const effectiveDateTime = this.currentDateProvider.getEarliestDateFromTodayAnd(
      new Date(this.dateStringTransformations.addTimeToDateOnlyString(effectiveDate)),
    );
    return this.dateStringTransformations.getDateStringFromDate(effectiveDateTime);
  }
}
