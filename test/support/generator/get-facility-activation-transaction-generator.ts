import { ENUMS, PROPERTIES } from '@ukef/constants';
import { BundleStatusEnum } from '@ukef/constants/enums/bundle-status';
import { LenderTypeCodeEnum } from '@ukef/constants/enums/lender-type-code';
import { AcbsPartyId, DateOnlyString, UkefId } from '@ukef/helpers';
import { AcbsGetBundleInformationResponseDto } from '@ukef/modules/acbs/dto/acbs-get-bundle-information-response.dto';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { GetFacilityActivationTransactionResponseDto } from '@ukef/modules/facility-activation-transaction/dto/get-facility-activation-transaction-response.dto';

import { AbstractGenerator } from './abstract-generator';
import { RandomValueGenerator } from './random-value-generator';

export class GetFacilityActivationTransactionGenerator extends AbstractGenerator<FacilityActivationTransactionValues, GenerateResult, GenerateOptions> {
  constructor(protected readonly valueGenerator: RandomValueGenerator, protected readonly dateStringTransformations: DateStringTransformations) {
    super(valueGenerator);
  }

  protected generateValues(): FacilityActivationTransactionValues {
    // Numeric enums needs filter to get possible values.
    const possibleBundleStatuses = Object.values(ENUMS.BUNDLE_STATUSES).filter((value) => !isNaN(Number(value)));
    const possibleLenderTypes = Object.values(ENUMS.LENDER_TYPE_CODES);

    return {
      initialBundleStatusCode: possibleBundleStatuses[this.valueGenerator.integer({ min: 0, max: possibleBundleStatuses.length - 1 })] as number,
      bundleStatusCode: this.valueGenerator.stringOfNumericCharacters({ maxLength: 2 }),
      bundleStatusDesc: this.valueGenerator.string({ maxLength: 20 }),
      initiatingUserName: this.valueGenerator.string({ maxLength: 60 }),
      accountOwnerIdentifier: this.valueGenerator.acbsPartyId(), // TODO: is this right to use acbsPartyId?
      effectiveDate: this.valueGenerator.dateOnlyString(),
      facilityTransactionCodeValueCode: this.valueGenerator.string({ maxLength: 10 }),
      lenderTypeCode: possibleLenderTypes[this.valueGenerator.integer({ min: 0, max: possibleLenderTypes.length - 1 })],
      facilityTransactionTypeCode: this.valueGenerator.nonnegativeInteger({ max: 9999 }),
      isDraftIndicator: this.valueGenerator.boolean(),
      limitKeyValue: this.valueGenerator.acbsPartyId(),
      limitTypeCode: this.valueGenerator.string({ maxLength: 2 }),
      sectionIdentifier: this.valueGenerator.string({ maxLength: 2 }),
      postingDate: this.valueGenerator.dateOnlyString(),
    };
  }

  protected transformRawValuesToGeneratedValues(
    facilityActivationTransactions: FacilityActivationTransactionValues[],
    { facilityIdentifier }: GenerateOptions,
  ): GenerateResult {
    const { portfolioIdentifier } = PROPERTIES.GLOBAL;
    const [firstFacilityActivationTransaction] = facilityActivationTransactions;
    const effectiveDateTime = this.dateStringTransformations.addTimeToDateOnlyString(firstFacilityActivationTransaction.effectiveDate);
    const postingDateTime = this.dateStringTransformations.addTimeToDateOnlyString(firstFacilityActivationTransaction.postingDate);

    const acbsFacilityActivationTransaction: AcbsGetBundleInformationResponseDto = {
      PortfolioIdentifier: portfolioIdentifier,
      InitialBundleStatusCode: firstFacilityActivationTransaction.initialBundleStatusCode,
      BundleStatus: {
        BundleStatusCode: firstFacilityActivationTransaction.bundleStatusCode,
        BundleStatusShortDescription: firstFacilityActivationTransaction.bundleStatusDesc,
      },
      InitiatingUserName: firstFacilityActivationTransaction.initiatingUserName,
      PostingDate: postingDateTime,
      BundleMessageList: [
        {
          $type: 'FacilityCodeValueTransaction',
          AccountOwnerIdentifier: firstFacilityActivationTransaction.accountOwnerIdentifier,
          EffectiveDate: effectiveDateTime,
          FacilityIdentifier: facilityIdentifier,
          FacilityTransactionCodeValue: {
            FacilityTransactionCodeValueCode: firstFacilityActivationTransaction.facilityTransactionCodeValueCode,
          },
          FacilityTransactionType: {
            TypeCode: firstFacilityActivationTransaction.facilityTransactionTypeCode.toString(),
          },
          IsDraftIndicator: firstFacilityActivationTransaction.isDraftIndicator,
          LenderType: {
            LenderTypeCode: firstFacilityActivationTransaction.lenderTypeCode,
          },
          LimitKeyValue: firstFacilityActivationTransaction.limitKeyValue,
          LimitType: {
            LimitTypeCode: firstFacilityActivationTransaction.limitTypeCode,
          },
          SectionIdentifier: firstFacilityActivationTransaction.sectionIdentifier,
        },
      ],
    };

    const apiFacilityActivationTransaction: GetFacilityActivationTransactionResponseDto = {
      portfolioIdentifier,
      facilityIdentifier,
      bundleStatusCode: firstFacilityActivationTransaction.bundleStatusCode,
      bundleStatusDesc: firstFacilityActivationTransaction.bundleStatusDesc,
      lenderTypeCode: firstFacilityActivationTransaction.lenderTypeCode,
      initialBundleStatusCode: firstFacilityActivationTransaction.initialBundleStatusCode,
      initiatingUserName: firstFacilityActivationTransaction.initiatingUserName,
      accountOwnerIdentifier: firstFacilityActivationTransaction.accountOwnerIdentifier,
      effectiveDate: firstFacilityActivationTransaction.effectiveDate,
      facilityTransactionCodeValueCode: firstFacilityActivationTransaction.facilityTransactionCodeValueCode,
      facilityTransactionTypeCode: firstFacilityActivationTransaction.facilityTransactionTypeCode,
      isDraftIndicator: firstFacilityActivationTransaction.isDraftIndicator,
      limitKeyValue: firstFacilityActivationTransaction.limitKeyValue,
      limitTypeCode: firstFacilityActivationTransaction.limitTypeCode,
      sectionIdentifier: firstFacilityActivationTransaction.sectionIdentifier,
    };

    return {
      acbsFacilityActivationTransaction,
      apiFacilityActivationTransaction,
    };
  }
}

interface FacilityActivationTransactionValues {
  initialBundleStatusCode: BundleStatusEnum;
  bundleStatusCode: string;
  bundleStatusDesc: string;
  initiatingUserName: string;
  accountOwnerIdentifier: AcbsPartyId; // TODO: is this right to use acbsPartyId?
  effectiveDate: DateOnlyString;
  facilityTransactionCodeValueCode: string;
  lenderTypeCode: LenderTypeCodeEnum;
  facilityTransactionTypeCode: number;
  isDraftIndicator: boolean;
  limitKeyValue: AcbsPartyId;
  limitTypeCode: string;
  sectionIdentifier: string;
  postingDate: DateOnlyString;
}

interface GenerateOptions {
  facilityIdentifier: UkefId;
}

interface GenerateResult {
  acbsFacilityActivationTransaction: AcbsGetBundleInformationResponseDto;
  apiFacilityActivationTransaction: GetFacilityActivationTransactionResponseDto;
}
