import { DateString } from '@ukef/helpers';
import { AcbsGetFacilityFixedFeeResponseDto } from '@ukef/modules/acbs/dto/acbs-get-facility-fixed-fee-response.dto';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { GetFacilityFixedFeeResponse } from '@ukef/modules/facility-fixed-fee/dto/get-facility-fixed-fee-response.dto';

import { AbstractGenerator } from './abstract-generator';
import { RandomValueGenerator } from './random-value-generator';

export class GetFacilityFixedFeeGenerator extends AbstractGenerator<FacilityFixedFeeValues, GenerateResult, GenerateOptions> {
  constructor(protected readonly valueGenerator: RandomValueGenerator, protected readonly dateStringTransformations: DateStringTransformations) {
    super(valueGenerator);
  }

  protected generateValues(): FacilityFixedFeeValues {
    return {
      fixedFeeAmount: this.valueGenerator.nonnegativeFloat({ fixed: 2 }),
      currentPayoffAmount: this.valueGenerator.nonnegativeFloat({ fixed: 2 }),
      effectiveDateInAcbs: this.valueGenerator.dateTimeString(),
      expirationDateInAcbs: this.valueGenerator.dateTimeString(),
      nextDueDateInAcbs: this.valueGenerator.dateTimeString(),
      nextAccrueToDateInAcbs: this.valueGenerator.dateTimeString(),
      segmentIdentifier: this.valueGenerator.stringOfNumericCharacters({ length: 2 }),
      description: this.valueGenerator.string(),
      currency: {
        currencyCode: this.valueGenerator.string(),
      },
      lenderType: {
        lenderTypeCode: this.valueGenerator.string(),
      },
      incomeClass: {
        incomeClassCode: this.valueGenerator.string({ length: 3 }),
      },
    };
  }

  protected transformRawValuesToGeneratedValues(
    values: FacilityFixedFeeValues[],
    { facilityIdentifier, portfolioIdentifier }: GenerateOptions,
  ): GenerateResult {
    const acbsFacilityFixedFees: AcbsGetFacilityFixedFeeResponseDto = values.map((acbsFacilityFixedFee) => ({
      FixedFeeAmount: acbsFacilityFixedFee.fixedFeeAmount,
      CurrentPayoffAmount: acbsFacilityFixedFee.currentPayoffAmount,
      EffectiveDate: acbsFacilityFixedFee.effectiveDateInAcbs,
      ExpirationDate: acbsFacilityFixedFee.expirationDateInAcbs,
      NextDueDate: acbsFacilityFixedFee.nextDueDateInAcbs,
      NextAccrueToDate: acbsFacilityFixedFee.nextAccrueToDateInAcbs,
      SegmentIdentifier: acbsFacilityFixedFee.segmentIdentifier,
      Description: acbsFacilityFixedFee.description,
      Currency: {
        CurrencyCode: acbsFacilityFixedFee.currency.currencyCode,
      },
      LenderType: {
        LenderTypeCode: acbsFacilityFixedFee.lenderType.lenderTypeCode,
      },
      IncomeClass: {
        IncomeClassCode: acbsFacilityFixedFee.incomeClass.incomeClassCode,
      },
    }));

    const apiFacilityFixedFees: GetFacilityFixedFeeResponse = values.map((apiFacilityFixedFee) => ({
      facilityIdentifier,
      portfolioIdentifier,
      amount: apiFacilityFixedFee.fixedFeeAmount,
      currentPayoffAmount: apiFacilityFixedFee.currentPayoffAmount,
      effectiveDate: this.dateStringTransformations.removeTime(apiFacilityFixedFee.effectiveDateInAcbs),
      expirationDate: this.dateStringTransformations.removeTime(apiFacilityFixedFee.expirationDateInAcbs),
      nextDueDate: this.dateStringTransformations.removeTime(apiFacilityFixedFee.nextDueDateInAcbs),
      nextAccrueToDate: this.dateStringTransformations.removeTime(apiFacilityFixedFee.nextAccrueToDateInAcbs),
      period: apiFacilityFixedFee.segmentIdentifier,
      description: apiFacilityFixedFee.description,
      currency: apiFacilityFixedFee.currency.currencyCode,
      lenderTypeCode: apiFacilityFixedFee.lenderType.lenderTypeCode,
      incomeClassCode: apiFacilityFixedFee.incomeClass.incomeClassCode,
    }));

    return {
      acbsFacilityFixedFees,
      apiFacilityFixedFees: apiFacilityFixedFees,
    };
  }
}

interface FacilityFixedFeeValues {
  fixedFeeAmount: number;
  currentPayoffAmount: number;
  effectiveDateInAcbs: DateString;
  expirationDateInAcbs: DateString;
  nextDueDateInAcbs: DateString;
  nextAccrueToDateInAcbs: DateString;
  segmentIdentifier: string;
  description: string;
  currency: {
    currencyCode: string;
  };
  lenderType: {
    lenderTypeCode: string;
  };
  incomeClass: {
    incomeClassCode: string;
  };
}

interface GenerateOptions {
  facilityIdentifier: string;
  portfolioIdentifier: string;
}

interface GenerateResult {
  acbsFacilityFixedFees: AcbsGetFacilityFixedFeeResponseDto;
  apiFacilityFixedFees: GetFacilityFixedFeeResponse;
}
