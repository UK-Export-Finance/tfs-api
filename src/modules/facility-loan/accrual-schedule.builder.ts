import { Injectable } from '@nestjs/common';
import { ENUMS, PROPERTIES } from '@ukef/constants';
import { CURRENCIES } from '@ukef/constants/currencies.constant';
import { LOAN_RATE_INDEX } from '@ukef/constants/loan-rate-index.constant';
import { DateString } from '@ukef/helpers';
import { AccrualSchedule } from '@ukef/modules/acbs/dto/bundle-actions/accrual-schedule.interface';
import { CurrentDateProvider } from '@ukef/modules/date/current-date.provider';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';

import { CreateFacilityLoanRequestItem } from './dto/create-facility-loan-request.dto';

@Injectable()
export class AccrualScheduleBuilder {
  constructor(private readonly dateStringTransformations: DateStringTransformations, private readonly currentDateProvider: CurrentDateProvider) { }

  getAccrualSchedules(facilityLoan: CreateFacilityLoanRequestItem): AccrualSchedule[] {
    if (facilityLoan.productTypeGroup === ENUMS.PRODUCT_TYPE_GROUPS.EWCS) {
      if (facilityLoan.currency === CURRENCIES.USD) {
        return [this.getAccrualPac(facilityLoan), this.getAccrualNonRfr(facilityLoan)];
      }
      return [this.getAccrualPac(facilityLoan), this.getAccrualRfr(facilityLoan)];
    }
    return [this.getAccrualPac(facilityLoan)];
  }

  private getAccrualPac(facilityLoan: CreateFacilityLoanRequestItem): AccrualSchedule {
    return {
      ...this.getBaseAccrualSchedule(facilityLoan),
      ScheduleIdentifier: PROPERTIES.ACCRUAL.PAC.scheduleIdentifier,
      AccrualCategory: {
        AccrualCategoryCode: PROPERTIES.ACCRUAL.PAC.accrualCategory.accrualCategoryCode,
      },
      RateCalculationMethod: {
        RateCalculationMethodCode: PROPERTIES.ACCRUAL.PAC.rateCalculationMethod.rateCalculationMethodCode,
      },
      SpreadRate: facilityLoan.spreadRate,
    };
  }

  private getAccrualNonRfr(facilityLoan: CreateFacilityLoanRequestItem): AccrualSchedule {
    const loanRateIndexCode = this.getLoanRateIndexCode(facilityLoan);
    return {
      ...this.getBaseAccrualSchedule(facilityLoan),
      ScheduleIdentifier: PROPERTIES.ACCRUAL.INT_NON_RFR.scheduleIdentifier,
      AccrualCategory: {
        AccrualCategoryCode: PROPERTIES.ACCRUAL.INT_NON_RFR.accrualCategory.accrualCategoryCode,
      },
      RateCalculationMethod: {
        RateCalculationMethodCode: PROPERTIES.ACCRUAL.INT_NON_RFR.rateCalculationMethod.rateCalculationMethodCode,
      },
      BusinessDayCalendar: {
        CalendarIdentifier: PROPERTIES.ACCRUAL.INT_NON_RFR.businessDayCalendar.calendarIdentifier,
      },
      SpreadRate: facilityLoan.spreadRateCtl,
      IndexRateChangeFrequency: {
        IndexRateChangeFrequencyCode: facilityLoan.indexRateChangeFrequency,
      },
      IndexRateChangeTiming: {
        IndexRateChangeTimingCode: PROPERTIES.ACCRUAL.INT_NON_RFR.indexRateChangeTiming.indexRateChangeTimingCode,
      },
      LoanRateIndex: {
        LoanRateIndexCode: loanRateIndexCode,
      },
      IndexedRateIndicator: PROPERTIES.ACCRUAL.INT_NON_RFR.indexedRateIndicator,
      NextDueBusinessDayAdjustmentType: {
        BusinessDayAdjustmentTypeCode: PROPERTIES.ACCRUAL.INT_NON_RFR.nextDueBusinessDayAdjustmentType.businessDayAdjustmentTypeCode,
      },
      NextRateSetDate: this.dateStringTransformations.addTimeToDateOnlyString(facilityLoan.nextDueDate),
      RateNextEffectiveDate: this.dateStringTransformations.addTimeToDateOnlyString(facilityLoan.nextDueDate),
      RateSetLeadDays: PROPERTIES.ACCRUAL.INT_NON_RFR.rateSetLeadDays,
    };
  }

  private getAccrualRfr(facilityLoan: CreateFacilityLoanRequestItem): AccrualSchedule {
    const loanRateIndexCode = this.getLoanRateIndexCode(facilityLoan);
    const issueDatePlusThreeMonths = this.getDatePlusThreeMonths(facilityLoan.issueDate);
    return {
      ...this.getBaseAccrualSchedule(facilityLoan),
      ScheduleIdentifier: PROPERTIES.ACCRUAL.INT_RFR.scheduleIdentifier,
      AccrualCategory: {
        AccrualCategoryCode: PROPERTIES.ACCRUAL.INT_RFR.accrualCategory.accrualCategoryCode,
      },
      RateCalculationMethod: {
        RateCalculationMethodCode: PROPERTIES.ACCRUAL.INT_RFR.rateCalculationMethod.rateCalculationMethodCode,
      },
      SpreadRate: facilityLoan.spreadRateCtl,
      IndexRateChangeTiming: {
        IndexRateChangeTimingCode: PROPERTIES.ACCRUAL.INT_RFR.indexRateChangeTiming.indexRateChangeTimingCode,
      },
      LoanRateIndex: {
        LoanRateIndexCode: loanRateIndexCode,
      },
      IndexedRateIndicator: PROPERTIES.ACCRUAL.INT_RFR.indexedRateIndicator,
      AccrualScheduleIBORDetails: {
        IsDailyRFR: PROPERTIES.ACCRUAL.INT_RFR.accrualScheduleIBORDetails.isDailyRFR,
        RFRCalculationMethod: {
          RFRCalculationMethodCode: PROPERTIES.ACCRUAL.INT_RFR.accrualScheduleIBORDetails.rFRCalculationMethod.rFRCalculationMethodCode,
        },
        CompoundingDateType: {
          CompoundingDateTypeCode: PROPERTIES.ACCRUAL.INT_RFR.accrualScheduleIBORDetails.compoundingDateType.compoundingDateTypeCode,
        },
        CalculationFeature: {
          CalculationFeatureCode: PROPERTIES.ACCRUAL.INT_RFR.accrualScheduleIBORDetails.calculationFeature.calculationFeatureCode,
        },
        NextRatePeriod: issueDatePlusThreeMonths,
        UseObservationShiftIndicator: facilityLoan.currency === CURRENCIES.EUR,
        RateSetLagDays: PROPERTIES.ACCRUAL.INT_RFR.accrualScheduleIBORDetails.rateSetLagDays,
        LagDaysType: {
          CompoundingDateTypeCode: PROPERTIES.ACCRUAL.INT_RFR.accrualScheduleIBORDetails.compoundingDateType.compoundingDateTypeCode,
        },
        Calendar: {
          CalendarIdentifier: PROPERTIES.ACCRUAL.INT_RFR.accrualScheduleIBORDetails.calendar.calendarIdentifier,
        },
        NextRatePeriodBusinessDayAdjustment: {
          NextRatePeriodBusinessDayAdjustmentCode: PROPERTIES.ACCRUAL.INT_RFR.accrualScheduleIBORDetails.nextRatePeriodBusinessDayAdjustment.nextRatePeriodBusinessDayAdjustmentCode,
        },
        RatePeriodResetFrequency: {
          RatePeriodResetFrequencyCode: PROPERTIES.ACCRUAL.INT_RFR.accrualScheduleIBORDetails.ratePeriodResetFrequency.ratePeriodResetFrequencyCode,
        },
        FrequencyPeriod: PROPERTIES.ACCRUAL.INT_RFR.accrualScheduleIBORDetails.frequencyPeriod,
      },
    };
  }

  private getBaseAccrualSchedule(facilityLoan: CreateFacilityLoanRequestItem) {
    const effectiveDate = this.dateStringTransformations.getEarliestDateFromTodayAndDateAsString(facilityLoan.issueDate, this.currentDateProvider);
    return {
      InvolvedParty: {
        PartyIdentifier: PROPERTIES.ACCRUAL.DEFAULT.involvedParty.partyIdentifier,
      },
      ScheduleIdentifier: PROPERTIES.ACCRUAL.PAC.scheduleIdentifier,
      AccountSequence: PROPERTIES.ACCRUAL.DEFAULT.accountSequence,
      LenderType: {
        LenderTypeCode: PROPERTIES.ACCRUAL.DEFAULT.lenderType.lenderTypeCode,
      },
      EffectiveDate: effectiveDate,
      YearBasis: {
        YearBasisCode: facilityLoan.yearBasis,
      },
      BaseRate: PROPERTIES.ACCRUAL.DEFAULT.baseRate,
      ReserveRate: PROPERTIES.ACCRUAL.DEFAULT.reserveRate,
      CostOfFundsRate: PROPERTIES.ACCRUAL.DEFAULT.costOfFundsRate,
      PercentageOfRate: PROPERTIES.ACCRUAL.DEFAULT.percentageOfRate,
      PercentOfBaseBalance: PROPERTIES.ACCRUAL.DEFAULT.percentOfBaseBalance,
      LowBalancePercent: PROPERTIES.ACCRUAL.DEFAULT.lowBalancePercent,
      CappedAccrualRate: PROPERTIES.ACCRUAL.DEFAULT.cappedAccrualRate,
      SpreadToInvestorsIndicator: PROPERTIES.ACCRUAL.DEFAULT.spreadToInvestorsIndicator,
    };
  }

  private getLoanRateIndexCode(facilityLoan: CreateFacilityLoanRequestItem): string {
    switch (facilityLoan.currency) {
      case CURRENCIES.EUR:
        return LOAN_RATE_INDEX.EUR;
      case CURRENCIES.USD:
        return LOAN_RATE_INDEX.USD;
      case CURRENCIES.JPY:
        return LOAN_RATE_INDEX.JPY;
      default:
        return LOAN_RATE_INDEX.OTHER;
    }
  }

  private getDatePlusThreeMonths(dateAsString: string): DateString {
    const dateTime = new Date(this.dateStringTransformations.addTimeToDateOnlyString(dateAsString));
    const datePlus3Months = new Date(dateTime.setMonth(dateTime.getMonth()+3));
    return this.dateStringTransformations.getDateStringFromDate(datePlus3Months);
  }
}
