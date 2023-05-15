import { ENUMS, PROPERTIES } from '@ukef/constants';
import { AcbsBundleId, AcbsPartyId, DateOnlyString, UkefId } from '@ukef/helpers';
import { AcbsCreateBundleInformationRequestDto } from '@ukef/modules/acbs/dto/acbs-create-bundleInformation-request.dto';
import { AcbsCreateBundleInformationResponseDto } from '@ukef/modules/acbs/dto/acbs-create-bundleInformation-response.dto';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import {
  CreateFacilityActivationTransactionRequest,
  CreateFacilityActivationTransactionRequestItem,
} from '@ukef/modules/facility-activation-transaction/dto/create-facility-activation-transaction-request.dto';
import { CreateFacilityActivationTransactionResponse } from '@ukef/modules/facility-activation-transaction/dto/create-facility-activation-transaction-response.dto';
import { CreateFacilityLoanRequestItem } from '@ukef/modules/facility-loan/dto/create-facility-loan-request.dto';
import { CreateFacilityLoanResponseDto } from '@ukef/modules/facility-loan/dto/create-facility-loan-response.dto';

import { AbstractGenerator } from './abstract-generator';
import { RandomValueGenerator } from './random-value-generator';

export class CreateFacilityLoanGenerator extends AbstractGenerator<
  CreateFacilityLoanRequestItem,
  GenerateResult,
  GenerateOptions
> {
  constructor(protected readonly valueGenerator: RandomValueGenerator, protected readonly dateStringTransformations: DateStringTransformations) {
    super(valueGenerator);
  }

  protected generateValues(): CreateFacilityLoanRequestItem {
    // Numeric enums needs filter to get possible values.
    const possibleBundleStatuses = Object.values(ENUMS.BUNDLE_STATUSES).filter((value) => !isNaN(Number(value)));
    const possibleLenderTypes = Object.values(ENUMS.LENDER_TYPE_CODES);
    return {
      facilityIdentifier: this.valueGenerator.ukefId(),
      initialBundleStatusCode: possibleBundleStatuses[this.valueGenerator.integer({ min: 0, max: possibleBundleStatuses.length - 1 })] as number,
      lenderTypeCode: possibleLenderTypes[this.valueGenerator.integer({ min: 0, max: possibleLenderTypes.length - 1 })],
    };
  }

  protected transformRawValuesToGeneratedValues(
    values,
    { facilityIdentifier, bundleIdentifier, borrowerPartyIdentifier, effectiveDate }: GenerateOptions,
  ): GenerateResult {
    const firstFacilityLoan = values[0];

    const acbsRequestBodyToCreateFacilityLoan: AcbsCreateBundleInformationRequestDto = {
      PortfolioIdentifier: PROPERTIES.GLOBAL.portfolioIdentifier,
      InitialBundleStatusCode: firstFacilityLoan.initialBundleStatusCode,
      InitiatingUserName: PROPERTIES.FACILITY_ACTIVATION_TRANSACTION.DEFAULT.initiatingUserName,
      UseAPIUserIndicator: PROPERTIES.FACILITY_ACTIVATION_TRANSACTION.DEFAULT.useAPIUserIndicator,
      BundleMessageList: [
        {
          $type: PROPERTIES.FACILITY_ACTIVATION_TRANSACTION.DEFAULT.bundleMessageList.type,
          AccountOwnerIdentifier: PROPERTIES.FACILITY_ACTIVATION_TRANSACTION.DEFAULT.bundleMessageList.accountOwnerIdentifier,
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
            LenderTypeCode: firstFacilityLoan.lenderTypeCode,
          },
          LimitKeyValue: borrowerPartyIdentifier,
          LimitType: {
            LimitTypeCode: PROPERTIES.FACILITY_ACTIVATION_TRANSACTION.DEFAULT.bundleMessageList.limitType.limitTypeCode,
          },
          SectionIdentifier: PROPERTIES.FACILITY_ACTIVATION_TRANSACTION.DEFAULT.bundleMessageList.sectionIdentifier,
        },
      ],
    };

    const requestBodyToCreateFacilityLoan = values.map((value) => ({
      facilityIdentifier: facilityIdentifier,
      initialBundleStatusCode: value.initialBundleStatusCode,
      lenderTypeCode: value.lenderTypeCode,
    }));

    const createBundleInformationResponseFromAcbs = { BundleIdentifier: bundleIdentifier };
    const createFacilityLoanResponseFromService = { bundleIdentifier };

    return {
      acbsRequestBodyToCreateFacilityLoan,
      requestBodyToCreateFacilityLoan,
      createBundleInformationResponseFromAcbs,
      createFacilityLoanResponseFromService,
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
  acbsRequestBodyToCreateFacilityLoan: AcbsCreateBundleInformationRequestDto;
  requestBodyToCreateFacilityLoan: CreateFacilityLoanRequestItem;
  createBundleInformationResponseFromAcbs: AcbsCreateBundleInformationResponseDto;
  createFacilityLoanResponseFromService: CreateFacilityLoanResponseDto;
}
