import { ENUMS, PROPERTIES } from '@ukef/constants';
import { LenderTypeCodeEnum } from '@ukef/constants/enums/lender-type-code';
import { AcbsPartyId, DateOnlyString, UkefId } from '@ukef/helpers';
import { AcbsCreateBundleInformationRequestDto } from '@ukef/modules/acbs/dto/acbs-create-bundle-information-request.dto';
import { FacilityFeeAmountTransaction } from '@ukef/modules/acbs/dto/bundle-actions/facility-fee-amount-transaction.bundle-action';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import {
  CreateFixedFeeAmountAmendmentRequest,
  CreateFixedFeeAmountAmendmentRequestItem,
} from '@ukef/modules/facility-fixed-fee/dto/create-facility-fixed-fee-amount-amendment-request.dto';

import { AbstractGenerator } from './abstract-generator';
import { RandomValueGenerator } from './random-value-generator';

export class CreateFacilityFixedFeesAmountAmendmentGenerator extends AbstractGenerator<GenerateValues, GenerateResult, GenerateOptions> {
  constructor(protected readonly valueGenerator: RandomValueGenerator, protected readonly dateStringTransformations: DateStringTransformations) {
    super(valueGenerator);
  }

  protected generateValues(): GenerateValues {
    return {
      partyIdentifier: this.valueGenerator.acbsPartyId(),
      period: this.valueGenerator.string({ length: 2 }),
      lenderTypeCode: this.valueGenerator.enumValue<LenderTypeCodeEnum>(ENUMS.LENDER_TYPE_CODES),
      effectiveDate: this.valueGenerator.dateOnlyString(),
      amountAmendment: this.valueGenerator.float({ min: 0.01 }),
    };
  }

  protected transformRawValuesToGeneratedValues(values: GenerateValues[], { facilityIdentifier }: GenerateOptions): GenerateResult {
    const increaseAmountRequest: CreateFixedFeeAmountAmendmentRequestItem[] = values.map((value) => ({
      ...value,
    }));

    const decreaseAmountRequest: CreateFixedFeeAmountAmendmentRequestItem[] = increaseAmountRequest.map((increaseAmountItem) => ({
      ...increaseAmountItem,
      amountAmendment: -increaseAmountItem.amountAmendment,
    }));

    const defaultValues = PROPERTIES.FACILITY_FEE_AMOUNT_TRANSACTION.DEFAULT;
    const defaultMessageValues = defaultValues.bundleMessageList;
    const acbsFixedFeesAmendmentForIncrease: AcbsCreateBundleInformationRequestDto<FacilityFeeAmountTransaction> = {
      PortfolioIdentifier: PROPERTIES.GLOBAL.portfolioIdentifier,
      InitialBundleStatusCode: PROPERTIES.FACILITY_FEE_AMOUNT_TRANSACTION.DEFAULT.initialBundleStatusCode,
      InitiatingUserName: PROPERTIES.FACILITY_FEE_AMOUNT_TRANSACTION.DEFAULT.initiatingUserName,
      UseAPIUserIndicator: PROPERTIES.FACILITY_FEE_AMOUNT_TRANSACTION.DEFAULT.useAPIUserIndicator,
      BundleMessageList: values.map((value) => ({
        $type: defaultMessageValues.type,
        AccountOwnerIdentifier: defaultMessageValues.accountOwnerIdentifier,
        EffectiveDate: this.dateStringTransformations.addTimeToDateOnlyString(value.effectiveDate),
        FacilityIdentifier: facilityIdentifier,
        FacilityFeeTransactionType: {
          TypeCode: defaultMessageValues.facilityFeeTransactionType.increaseTypeCode,
        },
        IsDraftIndicator: defaultMessageValues.isDraftIndicator,
        LenderType: {
          LenderTypeCode: value.lenderTypeCode,
        },
        LimitKeyValue: value.partyIdentifier,
        LimitType: {
          LimitTypeCode: defaultMessageValues.limitType.limitTypeCode,
        },
        SectionIdentifier: defaultMessageValues.sectionIdentifier,
        SegmentIdentifier: value.period,
        TransactionAmount: Math.abs(value.amountAmendment),
      })),
    };

    const acbsFixedFeesAmendmentForDecrease = {
      ...acbsFixedFeesAmendmentForIncrease,
      BundleMessageList: acbsFixedFeesAmendmentForIncrease.BundleMessageList.map((bundleMessage) => ({
        ...bundleMessage,
        FacilityFeeTransactionType: { TypeCode: defaultMessageValues.facilityFeeTransactionType.decreaseTypeCode },
      })),
    };

    return {
      increaseAmountRequest,
      decreaseAmountRequest,
      acbsFixedFeesAmendmentForIncrease,
      acbsFixedFeesAmendmentForDecrease,
    };
  }
}

interface GenerateValues {
  partyIdentifier: AcbsPartyId;
  period: string;
  lenderTypeCode: LenderTypeCodeEnum;
  effectiveDate: DateOnlyString;
  amountAmendment: number;
}

interface GenerateOptions {
  facilityIdentifier: UkefId;
}

interface GenerateResult {
  increaseAmountRequest: CreateFixedFeeAmountAmendmentRequest;
  decreaseAmountRequest: CreateFixedFeeAmountAmendmentRequest;
  acbsFixedFeesAmendmentForIncrease: AcbsCreateBundleInformationRequestDto<FacilityFeeAmountTransaction>;
  acbsFixedFeesAmendmentForDecrease: AcbsCreateBundleInformationRequestDto<FacilityFeeAmountTransaction>;
}
