import { ENUMS, PROPERTIES } from '@ukef/constants';
import { UkefId } from '@ukef/helpers';
import { AcbsCreateFacilityCovenantRequestDto } from '@ukef/modules/acbs/dto/acbs-create-facility-covenant-request.dto';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { CreateFacilityCovenantRequestDto, CreateFacilityCovenantRequestItem } from '@ukef/modules/facility-covenant/dto/create-facility-covenant-request.dto';

import { AbstractGenerator } from './abstract-generator';
import { RandomValueGenerator } from './random-value-generator';

export class CreateFacilityCovenantGenerator extends AbstractGenerator<CreateFacilityCovenantRequestItem, GenerateResult, GenerateOptions> {
  constructor(protected readonly valueGenerator: RandomValueGenerator, protected readonly dateStringTransformations: DateStringTransformations) {
    super(valueGenerator);
  }

  protected generateValues(): CreateFacilityCovenantRequestItem {
    const possibleCovenantTypeCodes = Object.values(ENUMS.COVENANT_TYPE_CODES);

    return {
      covenantIdentifier: this.valueGenerator.ukefCovenantId(),
      covenantType: possibleCovenantTypeCodes[this.valueGenerator.integer({ min: 0, max: possibleCovenantTypeCodes.length - 1 })],
      maximumLiability: this.valueGenerator.nonnegativeFloat({ fixed: 2 }),
      currency: this.valueGenerator.string({ minLength: 0, maxLength: 1 }),
      guaranteeExpiryDate: this.valueGenerator.dateOnlyString(),
      effectiveDate: this.valueGenerator.dateOnlyString(),
    };
  }

  protected transformRawValuesToGeneratedValues(
    values: CreateFacilityCovenantRequestDto,
    { facilityTypeCode, limitKeyValue }: GenerateOptions,
  ): GenerateResult {
    const [firstFacilityCovenant] = values;

    let covenantName;

    if (
      firstFacilityCovenant.covenantType === ENUMS.COVENANT_TYPE_CODES.CHARGEABLE_AMOUNT ||
      firstFacilityCovenant.covenantType === ENUMS.COVENANT_TYPE_CODES.CHARGEABLE_AMOUNT_NOT_GBP
    ) {
      covenantName = 'CHARGEABLE AMOUNT';
    } else if (facilityTypeCode === '250') {
      covenantName = 'AMOUNT OF SUPPORTED BOND';
    } else if (
      facilityTypeCode === '260' ||
      (firstFacilityCovenant.covenantType === ENUMS.COVENANT_TYPE_CODES.UK_CONTRACT_VALUE && facilityTypeCode === '280')
    ) {
      covenantName = 'AMOUNT OF SUPPORTED FACILITY';
    } else {
      covenantName = facilityTypeCode;
    }

    const effectiveDateString = this.dateStringTransformations.addTimeToDateOnlyString(firstFacilityCovenant.effectiveDate);
    const guaranteeExpiryDateString = this.dateStringTransformations.addTimeToDateOnlyString(firstFacilityCovenant.guaranteeExpiryDate);

    const acbsRequestBodyToCreateFacilityCovenant: AcbsCreateFacilityCovenantRequestDto = {
      AccountOwnerIdentifier: PROPERTIES.COVENANT.DEFAULT.accountOwnerIdentifier,
      ComplianceEvaluationMode: {
        CovenantEvaluationModeCode: PROPERTIES.COVENANT.DEFAULT.complianceEvaluationMode.covenantEvaluationModeCode,
      },
      ComplianceStatusDate: effectiveDateString,
      CovenantIdentifier: firstFacilityCovenant.covenantIdentifier,
      CovenantName: covenantName,
      DateCycleEvaluationMode: {
        CovenantEvaluationModeCode: PROPERTIES.COVENANT.DEFAULT.dateCycleEvaluationMode.covenantEvaluationModeCode,
      },
      EffectiveDate: effectiveDateString,
      ExpirationDate: guaranteeExpiryDateString,
      LenderType: {
        LenderTypeCode: PROPERTIES.COVENANT.DEFAULT.lenderType.covenantLenderTypeCode,
      },
      LimitKeyValue: limitKeyValue,
      LimitType: {
        LimitTypeCode: PROPERTIES.COVENANT.DEFAULT.limitType.covenantLimitTypeCode,
      },
      SectionIdentifier: PROPERTIES.COVENANT.DEFAULT.sectionIdentifier,
      TargetAmount: firstFacilityCovenant.maximumLiability,
      PledgeType: {
        PledgeTypeCode: firstFacilityCovenant.currency,
      },
      CovenantType: {
        CovenantTypeCode: firstFacilityCovenant.covenantType,
      },
      ComplianceRule: {
        ComplianceRuleCode: PROPERTIES.COVENANT.DEFAULT.complianceRule.covenantComplianceRuleCode,
      },
      InComplianceIndicator: PROPERTIES.COVENANT.DEFAULT.inComplianceIndicator,
      WaivedIndicator: PROPERTIES.COVENANT.DEFAULT.waivedIndicator,
      NextReviewDate: effectiveDateString,
    };

    const requestBodyToCreateFacilityCovenant = values.map((v) => ({
      covenantIdentifier: v.covenantIdentifier,
      covenantType: v.covenantType,
      maximumLiability: v.maximumLiability,
      currency: v.currency,
      guaranteeExpiryDate: v.guaranteeExpiryDate,
      effectiveDate: v.effectiveDate,
    }));

    return {
      acbsRequestBodyToCreateFacilityCovenant,
      requestBodyToCreateFacilityCovenant,
    };
  }
}
interface GenerateOptions {
  facilityIdentifier: UkefId;
  facilityTypeCode: string;
  limitKeyValue: string;
}

interface GenerateResult {
  acbsRequestBodyToCreateFacilityCovenant: AcbsCreateFacilityCovenantRequestDto;
  requestBodyToCreateFacilityCovenant: CreateFacilityCovenantRequestDto;
}
