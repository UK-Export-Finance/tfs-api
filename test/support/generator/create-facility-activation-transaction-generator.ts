import { PROPERTIES } from '@ukef/constants';
import { AcbsBundleId, DateString, UkefId } from '@ukef/helpers';
import { AcbsCreateBundleInformationRequestDto } from '@ukef/modules/acbs/dto/acbs-create-bundleInformation-request.dto';
import { AcbsCreateBundleInformationResponseDto } from '@ukef/modules/acbs/dto/acbs-create-bundleInformation-response.dto';
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

  protected generateValues() {
    return {
      facilityIdentifier: this.valueGenerator.ukefId(),
      initialBundleStatusCode: 3,
      lenderTypeCode: '100',
    };
  }

  protected transformRawValuesToGeneratedValues(values, { facilityIdentifier, bundleIdentifier, effectiveDate }: GenerateOptions): GenerateResult {
    const firstFacilityActivationTransaction = values[0];

    const acbsRequestBodyToCreateFacilityActivationTransaction: AcbsCreateBundleInformationRequestDto = {
      PortfolioIdentifier: PROPERTIES.GLOBAL.portfolioIdentifier,
      InitialBundleStatusCode: firstFacilityActivationTransaction.initialBundleStatusCode,
      InitiatingUserName: PROPERTIES.FACILITY_ACTIVATION_TRANSACTION.DEFAULT.initiatingUserName,
      UseAPIUserIndicator: PROPERTIES.FACILITY_ACTIVATION_TRANSACTION.DEFAULT.useAPIUserIndicator,
      BundleMessageList: [
        {
          $type: PROPERTIES.FACILITY_ACTIVATION_TRANSACTION.DEFAULT.bundleMessageList.type,
          AccountOwnerIdentifier: PROPERTIES.FACILITY_ACTIVATION_TRANSACTION.DEFAULT.bundleMessageList.accountOwnerIdentifier,
          EffectiveDate: effectiveDate,
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
          LimitKeyValue: this.valueGenerator.acbsPartyId(),
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
  effectiveDate: DateString;
}

interface GenerateResult {
  acbsRequestBodyToCreateFacilityActivationTransaction: AcbsCreateBundleInformationRequestDto;
  requestBodyToCreateFacilityActivationTransaction: CreateFacilityActivationTransactionRequest;
  createBundleInformationResponseFromAcbs: AcbsCreateBundleInformationResponseDto;
  createFacilityActivationTransactionResponseFromService: CreateFacilityActivationTransactionResponse;
}
