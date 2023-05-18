import { ENUMS, PROPERTIES } from '@ukef/constants';
import { AcbsPartyId } from '@ukef/helpers';
import { AcbsCreateFacilityFixedFeeRequestDto } from '@ukef/modules/acbs/dto/acbs-create-facility-fixed-fee-request.dto';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { CreateFacilityFixedFeeRequest, CreateFacilityFixedFeeRequestItem } from '@ukef/modules/facility-fixed-fee/dto/create-facility-fixed-fee-request.dto';

import { TEST_CURRENCIES } from '../constants/test-currency.constant';
import { TEST_DATES } from '../constants/test-date.constant';
import { AbstractGenerator } from './abstract-generator';
import { RandomValueGenerator } from './random-value-generator';

export class CreateFacilityFixedFeeGenerator extends AbstractGenerator<CreateFacilityFixedFeeRequestItem, GenerateResult, GenerateOptions> {
  constructor(protected readonly valueGenerator: RandomValueGenerator, protected readonly dateStringTransformations: DateStringTransformations) {
    super(valueGenerator);
  }

  protected generateValues(): any {
    const lenderType = this.valueGenerator.enumValue(ENUMS.LENDER_TYPE_CODES);

    return {
      amount: this.valueGenerator.nonnegativeFloat({ fixed: 2 }),
      period: this.valueGenerator.string({ length: 2 }),
      lenderTypeCode: lenderType,
      effectiveDate: TEST_DATES.A_PAST_EFFECTIVE_DATE_ONLY,
      expirationDate: this.valueGenerator.dateOnlyString(),
      nextDueDate: this.valueGenerator.dateOnlyString(),
      nextAccrueToDate: this.valueGenerator.dateOnlyString(),
      currency: TEST_CURRENCIES.A_TEST_CURRENCY,
      spreadToInvestorsIndicator: this.valueGenerator.boolean(),
    };
  }

  protected transformRawValuesToGeneratedValues(values: any, { borrowerPartyIdentifier, facilityTypeCode }: GenerateOptions): GenerateResult {
    const firstFacilityFixedFee = values[0];

    const defaultValues = PROPERTIES.FACILITY_FIXED_FEE.DEFAULT;

    const acbsRequestBodyToCreateFacilityFixedFee: AcbsCreateFacilityFixedFeeRequestDto = {
      FixedFeeAmount: firstFacilityFixedFee.amount,
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
          firstFacilityFixedFee.lenderTypeCode == ENUMS.LENDER_TYPE_CODES.ECGD
            ? (defaultValues.involvedParty.partyIdentifier as AcbsPartyId)
            : borrowerPartyIdentifier,
      },
      SegmentIdentifier: firstFacilityFixedFee.period,
      EffectiveDate: this.dateStringTransformations.addTimeToDateOnlyString(firstFacilityFixedFee.effectiveDate),
      ExpirationDate: this.dateStringTransformations.addTimeToDateOnlyString(firstFacilityFixedFee.expirationDate),
      Currency: {
        CurrencyCode: firstFacilityFixedFee.currency,
      },
      NextDueDate: this.dateStringTransformations.addTimeToDateOnlyString(firstFacilityFixedFee.nextDueDate),
      LeadDays: defaultValues.leadDays,
      NextAccrueToDate: this.dateStringTransformations.addTimeToDateOnlyString(firstFacilityFixedFee.nextAccrueToDate),
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
        IncomeClassCode: firstFacilityFixedFee.incomeClassCode ?? defaultValues.incomeClassCode,
      },
      LenderType: {
        LenderTypeCode: firstFacilityFixedFee.lenderTypeCode,
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
      SpreadToInvestorsIndicator: firstFacilityFixedFee.spreadToInvestorsIndicator,
    };

    const requestBodyToCreateFacilityFixedFee = values.map((value) => ({
      amount: value.amount,
      period: value.period,
      lenderTypeCode: value.lenderTypeCode,
      effectiveDate: value.effectiveDate,
      expirationDate: value.expirationDate,
      nextDueDate: value.nextDueDate,
      nextAccrueToDate: value.nextAccrueToDate,
      currency: value.currency,
      spreadToInvestorsIndicator: value.spreadToInvestorsIndicator,
    }));

    return {
      acbsRequestBodyToCreateFacilityFixedFee,
      requestBodyToCreateFacilityFixedFee,
    };
  }
}
interface GenerateOptions {
  facilityTypeCode: string;
  borrowerPartyIdentifier: AcbsPartyId;
}

interface GenerateResult {
  acbsRequestBodyToCreateFacilityFixedFee: AcbsCreateFacilityFixedFeeRequestDto;
  requestBodyToCreateFacilityFixedFee: CreateFacilityFixedFeeRequest;
}
