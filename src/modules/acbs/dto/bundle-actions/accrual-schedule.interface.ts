import { DateString } from '@ukef/helpers';

export interface AccrualSchedule {
  AccrualCategory: {
    AccrualCategoryCode: string;
  };
  YearBasis: {
    YearBasisCode: string;
  };
  SpreadRate: number;
  IndexRateChangeFrequency?: {
    IndexRateChangeFrequencyCode: string;
  };
}

export interface AccrualScheduleExtended extends AccrualSchedule {
  InvolvedParty: {
    PartyIdentifier: string;
  };
  ScheduleIdentifier: string;
  AccountSequence: string;
  LenderType: {
    LenderTypeCode: string;
  };
  BusinessDayCalendar?: {
    CalendarIdentifier: string;
  };
  EffectiveDate: DateString;
  RateCalculationMethod: {
    RateCalculationMethodCode: string;
  };
  BaseRate: number;
  ReserveRate: number;
  CostOfFundsRate: number;
  PercentageOfRate: number;
  PercentOfBaseBalance: number;
  IndexRateChangeTiming?: {
    IndexRateChangeTimingCode: string;
  };
  LoanRateIndex?: {
    LoanRateIndexCode: string;
  };
  IndexedRateIndicator?: boolean;
  LowBalancePercent: number;
  NextDueBusinessDayAdjustmentType?: {
    BusinessDayAdjustmentTypeCode: string;
  };
  NextRateSetDate?: DateString;
  RateNextEffectiveDate?: DateString;
  RateSetLeadDays?: number;
  CappedAccrualRate: number;
  SpreadToInvestorsIndicator: boolean;
  AccrualScheduleIBORDetails?: {
    IsDailyRFR: boolean;
    RFRCalculationMethod: {
      RFRCalculationMethodCode: number;
    };
    CompoundingDateType: {
      CompoundingDateTypeCode: string;
    };
    CalculationFeature: {
      CalculationFeatureCode: number;
    };
    NextRatePeriod: DateString;
    UseObservationShiftIndicator: boolean;
    RateSetLagDays: number;
    LagDaysType: {
      CompoundingDateTypeCode: string;
    };
    Calendar: {
      CalendarIdentifier: string;
    };
    NextRatePeriodBusinessDayAdjustment: {
      NextRatePeriodBusinessDayAdjustmentCode: string;
    };
    RatePeriodResetFrequency: {
      RatePeriodResetFrequencyCode: string;
    };
    FrequencyPeriod: number;
  };
}
