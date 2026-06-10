import { Injectable } from '@nestjs/common';
import { ENUMS, PROPERTIES } from '@ukef/constants';
import { CALENDAR_IDENTIFIERS } from '@ukef/constants/calendar-identifiers.constant';
import { SUPPORTED_CURRENCIES } from '@ukef/constants/currencies.constant';
import { RepaymentSchedule } from '@ukef/modules/acbs/dto/bundle-actions/repayment-schedule.interface';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';

import { CreateFacilityLoanRequestItem } from './dto/create-facility-loan-request.dto';

@Injectable()
export class RepaymentScheduleBuilder {
  constructor(private readonly dateStringTransformations: DateStringTransformations) {}

  getRepaymentSchedules(facilityLoan: CreateFacilityLoanRequestItem): RepaymentSchedule[] {
    if (facilityLoan.productTypeGroup === ENUMS.PRODUCT_TYPE_GROUPS.EWCS) {
      return [this.getRepaymentInt(facilityLoan), this.getRepaymentPac(facilityLoan)];
    } else if (facilityLoan.productTypeGroup === ENUMS.PRODUCT_TYPE_GROUPS.GEF) {
      return [this.getRepaymentPac(facilityLoan)];
    }
    return [this.getRepaymentPacBss(facilityLoan)];
  }

  private getRepaymentInt(facilityLoan: CreateFacilityLoanRequestItem): RepaymentSchedule {
    return {
      ...this.getBaseRepaymentSchedule(facilityLoan),
      PrimaryScheduleIndicator: PROPERTIES.REPAYMENT.DEFAULT.primaryScheduleIndicator,
      BillingScheduleType: {
        BillingScheduleTypeCode: PROPERTIES.REPAYMENT.INT.billingScheduleType.billingScheduleTypeCode,
      },
      BillingSequenceNumber: PROPERTIES.REPAYMENT.INT.billingSequenceNumber,
    };
  }

  private getRepaymentPac(facilityLoan: CreateFacilityLoanRequestItem): RepaymentSchedule {
    const primaryScheduleIndicator =
      facilityLoan.productTypeGroup === ENUMS.PRODUCT_TYPE_GROUPS.EWCS
        ? PROPERTIES.REPAYMENT.PAC.primaryScheduleIndicator
        : PROPERTIES.REPAYMENT.DEFAULT.primaryScheduleIndicator;
    return {
      ...this.getBaseRepaymentSchedule(facilityLoan),
      PrimaryScheduleIndicator: primaryScheduleIndicator,
      BillingScheduleType: {
        BillingScheduleTypeCode: PROPERTIES.REPAYMENT.PAC.billingScheduleType.billingScheduleTypeCode,
      },
      BalanceCategory: {
        BalanceCategoryCode: PROPERTIES.REPAYMENT.PAC.balanceCategory.balanceCategoryCode,
      },
      BillingSequenceNumber: PROPERTIES.REPAYMENT.PAC.billingSequenceNumber,
      PercentageOfBalance: PROPERTIES.REPAYMENT.PAC.percentageOfBalance,
      ...(facilityLoan.productTypeGroup === ENUMS.PRODUCT_TYPE_GROUPS.EWCS && {
        NumberOfBillsToPrint: PROPERTIES.REPAYMENT.PAC.numberOfBillsToPrint,
      }),
    };
  }

  private getRepaymentPacBss(facilityLoan: CreateFacilityLoanRequestItem): RepaymentSchedule {
    return {
      ...this.getBaseRepaymentSchedule(facilityLoan),
      PrimaryScheduleIndicator: PROPERTIES.REPAYMENT.DEFAULT.primaryScheduleIndicator,
      BillingScheduleType: {
        BillingScheduleTypeCode: PROPERTIES.REPAYMENT.PAC_BSS.billingScheduleType.billingScheduleTypeCode,
      },
      BillingSequenceNumber: PROPERTIES.REPAYMENT.PAC_BSS.billingSequenceNumber,
      PercentageOfBalance: PROPERTIES.REPAYMENT.PAC_BSS.percentageOfBalance,
      PaymentAmount: facilityLoan.amount,
    };
  }

  private getBaseRepaymentSchedule(facilityLoan: CreateFacilityLoanRequestItem) {
    const calendarIdentifier = this.getCalendarIdentifier(facilityLoan);
    return {
      InvolvedParty: {
        PartyIdentifier: PROPERTIES.REPAYMENT.DEFAULT.involvedParty.partyIdentifier,
      },
      LenderType: {
        LenderTypeCode: PROPERTIES.REPAYMENT.DEFAULT.lenderType.lenderTypeCode,
      },
      AccountSequence: PROPERTIES.REPAYMENT.DEFAULT.accountSequence,
      BillingCalendar: {
        CalendarIdentifier: calendarIdentifier,
      },
      LoanBillingFrequencyType: {
        LoanBillingFrequencyTypeCode: facilityLoan.loanBillingFrequencyType,
      },
      NextDueDate: this.dateStringTransformations.addTimeToDateOnlyString(facilityLoan.nextDueDate),
      BillingDueCycleDay: this.dateStringTransformations.getDayFromDateOnlyString(facilityLoan.nextDueDate),
      NextAccrueToDate: this.dateStringTransformations.addTimeToDateOnlyString(facilityLoan.nextDueDate),
      BillingAccrueToCycleDay: this.dateStringTransformations.getDayFromDateOnlyString(facilityLoan.nextDueDate),
      LeadDays: PROPERTIES.REPAYMENT.DEFAULT.leadDays,
      NextDueBusinessDayAdjustmentType: {
        LoanSystemBusinessDayAdjustmentTypeCode: PROPERTIES.REPAYMENT.DEFAULT.nextDueBusinessDayAdjustmentType.loanSystemBusinessDayAdjustmentTypeCode,
      },
      NextAccrueBusinessDayAdjustmentType: {
        LoanSystemBusinessDayAdjustmentTypeCode: PROPERTIES.REPAYMENT.DEFAULT.nextAccrueBusinessDayAdjustmentType.loanSystemBusinessDayAdjustmentTypeCode,
      },
      BillingPeriod: PROPERTIES.REPAYMENT.DEFAULT.billingPeriod,
      CollectionInstructionMethod: {
        CollectionInstructionMethodCode: PROPERTIES.REPAYMENT.DEFAULT.collectionInstructionMethod.collectionInstructionMethodCode,
      },
      BillFormatType: {
        BillFormatTypeCode: PROPERTIES.REPAYMENT.DEFAULT.billFormatType.billFormatTypeCode,
      },
      MailingInstructionType: {
        MailingInstructionTypeCode: PROPERTIES.REPAYMENT.DEFAULT.mailingInstructionType.mailingInstructionTypeCode,
      },
      SpreadToInvestorsIndicator: PROPERTIES.REPAYMENT.DEFAULT.spreadToInvestorsIndicator,
      BalloonPaymentAmount: PROPERTIES.REPAYMENT.DEFAULT.balloonPaymentAmount,
      LoanPrePaymentType: {
        LoanPrePaymentTypeCode: PROPERTIES.REPAYMENT.DEFAULT.loanPrePaymentType.loanPrePaymentTypeCode,
      },
    };
  }

  private getCalendarIdentifier(facilityLoan: CreateFacilityLoanRequestItem): string {
    switch (facilityLoan.currency) {
      case SUPPORTED_CURRENCIES.EUR:
        return CALENDAR_IDENTIFIERS.EU;
      case SUPPORTED_CURRENCIES.USD:
        return CALENDAR_IDENTIFIERS.US;
      default:
        return CALENDAR_IDENTIFIERS.UK;
    }
  }
}
