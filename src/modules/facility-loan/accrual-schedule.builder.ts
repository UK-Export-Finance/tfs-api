import { Injectable } from '@nestjs/common';
import { ENUMS, PROPERTIES } from '@ukef/constants';
import { CALENDAR_IDENTIFIERS } from '@ukef/constants/calendar-identifiers.constant';
import { CURRENCIES } from '@ukef/constants/currencies.constant';
import { AccrualSchedule } from '@ukef/modules/acbs/dto/bundle-actions/accrual-schedule.interface';
import { CurrentDateProvider } from '@ukef/modules/date/current-date.provider';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';

import { CreateFacilityLoanRequestItem } from './dto/create-facility-loan-request.dto';

@Injectable()
export class AccrualScheduleBuilder {
  constructor(
    private readonly dateStringTransformations: DateStringTransformations,
    private readonly currentDateProvider: CurrentDateProvider,
  ) { }

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
    };
  }

  private getAccrualNonRfr(facilityLoan: CreateFacilityLoanRequestItem): AccrualSchedule {
    return {
      ...this.getBaseAccrualSchedule(facilityLoan),
      ScheduleIdentifier: PROPERTIES.ACCRUAL.INT_NON_RFR.scheduleIdentifier,
      AccrualCategory: {
        AccrualCategoryCode: PROPERTIES.ACCRUAL.INT_NON_RFR.accrualCategory.accrualCategoryCode,
      },
    };
  }

  private getAccrualRfr(facilityLoan: CreateFacilityLoanRequestItem): AccrualSchedule {
    return {
      ...this.getBaseAccrualSchedule(facilityLoan),
      ScheduleIdentifier: PROPERTIES.ACCRUAL.INT_RFR.scheduleIdentifier,
      AccrualCategory: {
        AccrualCategoryCode: PROPERTIES.ACCRUAL.INT_RFR.accrualCategory.accrualCategoryCode,
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
      // "rateCalculationMethod": {
      //   "rateCalculationMethodCode": Mule:: p("dcis.accrual_pac.default.rateCalculationMethod.rateCalculationMethodCode")
      // },
      // "yearBasis": {
      //   "yearBasisCode": loan.yearBasis
      // },
      // "baseRate": Mule:: p("dcis.accrual_pac.default.baseRate") as Number,
      // "reserveRate": Mule:: p("dcis.accrual_pac.default.reserveRate") as Number,
      // "spreadRate": loan.spreadRate,
      // "costOfFundsRate": Mule:: p("dcis.accrual_pac.default.costOfFundsRate") as Number,
      // "percentageOfRate": Mule:: p("dcis.accrual_pac.default.percentageOfRate") as Number,
      // "percentOfBaseBalance": Mule:: p("dcis.accrual_pac.default.percentOfBaseBalance") as Number,
      // "lowBalancePercent": Mule:: p("dcis.accrual_pac.default.lowBalancePercent") as Number,
      // "cappedAccrualRate": Mule:: p("dcis.accrual_pac.default.cappedAccrualRate") as Number,
      // "spreadToInvestorsIndicator": Mule:: p("dcis.accrual_pac.default.spreadToInvestorsIndicator") as Boolean,
    };
  }

  private getCalendarIdentifier(facilityLoan: CreateFacilityLoanRequestItem): string {
    switch (facilityLoan.currency) {
      case CURRENCIES.EUR:
        return CALENDAR_IDENTIFIERS.EU;
      case CURRENCIES.USD:
        return CALENDAR_IDENTIFIERS.US;
      default:
        return CALENDAR_IDENTIFIERS.UK;
    }
  }
}
