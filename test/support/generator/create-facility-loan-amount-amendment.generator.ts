import { PROPERTIES } from '@ukef/constants';
import { DateOnlyString, DateString } from '@ukef/helpers';
import { AcbsCreateBundleInformationRequestDto } from '@ukef/modules/acbs/dto/acbs-create-bundle-information-request.dto';
import { LoanAdvanceTransaction } from '@ukef/modules/acbs/dto/bundle-actions/loan-advance-transaction.bundle-action';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { CreateLoanAmountAmendmentRequest } from '@ukef/modules/facility-loan/dto/create-loan-amount-amendment-request.dto';

import { AbstractGenerator } from './abstract-generator';
import { RandomValueGenerator } from './random-value-generator';

export class CreateFacilityLoanAmountAmendmentGenerator extends AbstractGenerator<GenerateValues, GenerateResult, GenerateOptions> {
  constructor(
    protected readonly valueGenerator: RandomValueGenerator,
    protected readonly dateStringTransformations: DateStringTransformations,
  ) {
    super(valueGenerator);
  }

  protected generateValues(): GenerateValues {
    return {
      positiveAmountAmendment: this.valueGenerator.float({ min: 0.01 }),
      effectiveDate: this.valueGenerator.dateOnlyString(),
    };
  }

  protected transformRawValuesToGeneratedValues(values: GenerateValues[], { loanIdentifier }: GenerateOptions): GenerateResult {
    const [{ positiveAmountAmendment, effectiveDate }] = values;
    const { increase: increaseTypeCode, decrease: decreaseTypeCode } = PROPERTIES.LOAN_AMOUNT_AMENDMENT.DEFAULT.bundleMessageList.transactionTypeCode;
    const acbsEffectiveDate = this.dateStringTransformations.addTimeToDateOnlyString(effectiveDate);

    return {
      increaseAmountRequest: [
        {
          amountAmendment: positiveAmountAmendment,
          effectiveDate,
        },
      ],
      decreaseAmountRequest: [
        {
          amountAmendment: -positiveAmountAmendment,
          effectiveDate,
        },
      ],
      acbsLoanAmendmentForIncrease: this.buildExpectedAcbsLoanAmendment({
        typeCode: increaseTypeCode,
        acbsEffectiveDate,
        loanIdentifier,
        amountAmendment: positiveAmountAmendment,
      }),
      acbsLoanAmendmentForDecrease: this.buildExpectedAcbsLoanAmendment({
        typeCode: decreaseTypeCode,
        acbsEffectiveDate,
        loanIdentifier,
        amountAmendment: positiveAmountAmendment,
      }),
    };
  }

  private buildExpectedAcbsLoanAmendment = ({
    typeCode,
    acbsEffectiveDate,
    loanIdentifier,
    amountAmendment,
  }: {
    typeCode: string;
    acbsEffectiveDate: DateString;
    loanIdentifier: string;
    amountAmendment: number;
  }): AcbsCreateBundleInformationRequestDto<LoanAdvanceTransaction> => {
    const { portfolioIdentifier } = PROPERTIES.GLOBAL;
    const defaultValues = PROPERTIES.LOAN_AMOUNT_AMENDMENT.DEFAULT;
    const messageListDefaultValues = defaultValues.bundleMessageList;

    return {
      PortfolioIdentifier: portfolioIdentifier,
      InitialBundleStatusCode: defaultValues.initialBundleStatusCode,
      InitiatingUserName: defaultValues.initiatingUserName,
      UseAPIUserIndicator: defaultValues.useAPIUserIndicator,
      BundleMessageList: [
        {
          $type: messageListDefaultValues.type,
          EffectiveDate: acbsEffectiveDate,
          LoanIdentifier: loanIdentifier,
          TransactionTypeCode: typeCode,
          IsDraftIndicator: messageListDefaultValues.isDraftIndicator,
          LoanAdvanceAmount: amountAmendment,
          CashOffsetTypeCode: messageListDefaultValues.cashOffsetTypeCode,
        },
      ],
    };
  };
}

interface GenerateValues {
  positiveAmountAmendment: number;
  effectiveDate: DateOnlyString;
}

interface GenerateOptions {
  loanIdentifier: string;
}

interface GenerateResult {
  increaseAmountRequest: CreateLoanAmountAmendmentRequest;
  decreaseAmountRequest: CreateLoanAmountAmendmentRequest;
  acbsLoanAmendmentForIncrease: AcbsCreateBundleInformationRequestDto<LoanAdvanceTransaction>;
  acbsLoanAmendmentForDecrease: AcbsCreateBundleInformationRequestDto<LoanAdvanceTransaction>;
}
