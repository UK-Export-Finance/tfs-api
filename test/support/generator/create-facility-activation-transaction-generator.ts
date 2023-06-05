import { ENUMS, PROPERTIES } from '@ukef/constants';
import { AcbsBundleId, AcbsPartyId, DateOnlyString, UkefId } from '@ukef/helpers';
import { AcbsCreateBundleInformationRequestDto } from '@ukef/modules/acbs/dto/acbs-create-bundle-information-request.dto';
import { AcbsCreateBundleInformationResponseHeadersDto } from '@ukef/modules/acbs/dto/acbs-create-bundle-information-response.dto';
import { FacilityCodeValueTransaction } from '@ukef/modules/acbs/dto/bundle-actions/facility-code-value-transaction.bundle-action';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import {
  CreateFacilityActivationTransactionRequest,
  CreateFacilityActivationTransactionRequestItem,
} from '@ukef/modules/facility-activation-transaction/dto/create-facility-activation-transaction-request.dto';
import { CreateFacilityActivationTransactionResponse } from '@ukef/modules/facility-activation-transaction/dto/create-facility-activation-transaction-response.dto';

import { AbstractGenerator } from './abstract-generator';
import { RandomValueGenerator } from './random-value-generator';

export class CreateFacilityActivationTransactionGenerator extends AbstractGenerator<
  CreateFacilityActivationTransactionRequestItem,
  GenerateResult,
  GenerateOptions
> {
  constructor(protected readonly valueGenerator: RandomValueGenerator, protected readonly dateStringTransformations: DateStringTransformations) {
    super(valueGenerator);
  }

  protected generateValues(): CreateFacilityActivationTransactionRequestItem {
    // Numeric enums needs filter to get possible values.
    const possibleInitialBundleStatusCodes = Object.values(ENUMS.INITIAL_BUNDLE_STATUS_CODES).filter((value) => !isNaN(Number(value)));
    const possibleLenderTypes = Object.values(ENUMS.LENDER_TYPE_CODES);
    return {
      facilityIdentifier: this.valueGenerator.ukefId(),
      initialBundleStatusCode: possibleInitialBundleStatusCodes[
        this.valueGenerator.integer({ min: 0, max: possibleInitialBundleStatusCodes.length - 1 })
      ] as number,
      lenderTypeCode: possibleLenderTypes[this.valueGenerator.integer({ min: 0, max: possibleLenderTypes.length - 1 })],
    };
  }

  protected transformRawValuesToGeneratedValues(
    values,
    { facilityIdentifier, bundleIdentifier, borrowerPartyIdentifier, effectiveDate }: GenerateOptions,
  ): GenerateResult {
    const [firstFacilityActivationTransaction] = values;

    const acbsRequestBodyToCreateFacilityActivationTransaction: AcbsCreateBundleInformationRequestDto<FacilityCodeValueTransaction> = {
      PortfolioIdentifier: PROPERTIES.GLOBAL.portfolioIdentifier,
      InitialBundleStatusCode: firstFacilityActivationTransaction.initialBundleStatusCode,
      InitiatingUserName: PROPERTIES.FACILITY_ACTIVATION_TRANSACTION.DEFAULT.initiatingUserName,
      UseAPIUserIndicator: PROPERTIES.FACILITY_ACTIVATION_TRANSACTION.DEFAULT.useAPIUserIndicator,
      BundleMessageList: [
        {
          $type: PROPERTIES.FACILITY_ACTIVATION_TRANSACTION.DEFAULT.bundleMessageList.type,
          AccountOwnerIdentifier: PROPERTIES.FACILITY_ACTIVATION_TRANSACTION.DEFAULT.bundleMessageList.accountOwnerIdentifier as AcbsPartyId,
          EffectiveDate: this.dateStringTransformations.addTimeToDateOnlyString(effectiveDate),
          FacilityIdentifier: facilityIdentifier,
          FacilityTransactionCodeValue: {
            FacilityTransactionCodeValueCode:
              PROPERTIES.FACILITY_ACTIVATION_TRANSACTION.DEFAULT.bundleMessageList.facilityTransactionCodeValue.facilityTransactionCodeValueCode,
          },
          FacilityTransactionType: {
            TypeCode: PROPERTIES.FACILITY_ACTIVATION_TRANSACTION.DEFAULT.bundleMessageList.facilityTransactionType.typeCode,
          },
          IsDraftIndicator: PROPERTIES.FACILITY_ACTIVATION_TRANSACTION.DEFAULT.bundleMessageList.isDraftIndicator,
          LenderType: {
            LenderTypeCode: firstFacilityActivationTransaction.lenderTypeCode,
          },
          LimitKeyValue: borrowerPartyIdentifier,
          LimitType: {
            LimitTypeCode: PROPERTIES.FACILITY_ACTIVATION_TRANSACTION.DEFAULT.bundleMessageList.limitType.limitTypeCode,
          },
          SectionIdentifier: PROPERTIES.FACILITY_ACTIVATION_TRANSACTION.DEFAULT.bundleMessageList.sectionIdentifier,
        },
      ],
    };

    const requestBodyToCreateFacilityActivationTransaction = values.map((value) => ({
      facilityIdentifier: facilityIdentifier,
      initialBundleStatusCode: value.initialBundleStatusCode,
      lenderTypeCode: value.lenderTypeCode,
    }));

    const createBundleInformationResponseFromAcbs = { BundleIdentifier: bundleIdentifier };
    const createFacilityActivationTransactionResponseFromService = { bundleIdentifier };

    return {
      acbsRequestBodyToCreateFacilityActivationTransaction,
      requestBodyToCreateFacilityActivationTransaction,
      createBundleInformationResponseFromAcbs,
      createFacilityActivationTransactionResponseFromService,
    };
  }
}

interface GenerateOptions {
  facilityIdentifier: UkefId;
  bundleIdentifier: AcbsBundleId;
  borrowerPartyIdentifier: AcbsPartyId;
  effectiveDate: DateOnlyString;
}

interface GenerateResult {
  acbsRequestBodyToCreateFacilityActivationTransaction: AcbsCreateBundleInformationRequestDto<FacilityCodeValueTransaction>;
  requestBodyToCreateFacilityActivationTransaction: CreateFacilityActivationTransactionRequest;
  createBundleInformationResponseFromAcbs: AcbsCreateBundleInformationResponseHeadersDto;
  createFacilityActivationTransactionResponseFromService: CreateFacilityActivationTransactionResponse;
}
