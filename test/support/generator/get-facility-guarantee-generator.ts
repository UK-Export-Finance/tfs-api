import { DateString } from '@ukef/helpers'; // TO-DO: rename this file for consistency
import { AcbsGetFacilityGuaranteesResponseDto } from '@ukef/modules/acbs/dto/acbs-get-facility-guarantees-response.dto';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { GetFacilityGuaranteesResponse } from '@ukef/modules/facility-guarantee/dto/get-facility-guarantees-response.dto';
import { FacilityGuarantee } from '@ukef/modules/facility-guarantee/facility-guarantee.interface';

import { AbstractGenerator } from './abstract-generator';
import { RandomValueGenerator } from './random-value-generator';

export class GetFacilityGuaranteeGenerator extends AbstractGenerator<FacilityGuaranteeValues, GenerateResult, GenerateOptions> {
  constructor(protected readonly valueGenerator: RandomValueGenerator, protected readonly dateStringTransformations: DateStringTransformations) {
    super(valueGenerator);
  }

  protected generateValues(): FacilityGuaranteeValues {
    return {
      effectiveDateInAcbs: this.valueGenerator.dateTimeString(),
      guarantorPartyIdentifier: this.valueGenerator.stringOfNumericCharacters({ length: 8 }),
      limitKey: this.valueGenerator.string(),
      expirationDateInAcbs: this.valueGenerator.dateTimeString(),
      guaranteedLimit: this.valueGenerator.nonnegativeFloat(),
      guaranteeTypeCode: this.valueGenerator.string(),
    };
  }

  protected transformRawValuesToGeneratedValues(
    values: FacilityGuaranteeValues[],
    { facilityIdentifier, portfolioIdentifier }: GenerateOptions,
  ): GenerateResult {
    const facilityGuaranteesInAcbs: AcbsGetFacilityGuaranteesResponseDto = values.map((v) => ({
      EffectiveDate: v.effectiveDateInAcbs,
      GuarantorParty: {
        PartyIdentifier: v.guarantorPartyIdentifier,
      },
      LimitKey: v.limitKey,
      ExpirationDate: v.expirationDateInAcbs,
      GuaranteedLimit: v.guaranteedLimit,
      GuaranteeType: {
        GuaranteeTypeCode: v.guaranteeTypeCode,
      },
    }));

    const facilityGuarantees: FacilityGuarantee[] = values.map((v) => ({
      facilityIdentifier,
      portfolioIdentifier,
      guaranteeCommencementDate: this.dateStringTransformations.removeTime(v.effectiveDateInAcbs),
      effectiveDate: this.dateStringTransformations.removeTime(v.effectiveDateInAcbs),
      guarantorParty: v.guarantorPartyIdentifier,
      limitKey: v.limitKey,
      guaranteeExpiryDate: this.dateStringTransformations.removeTime(v.expirationDateInAcbs),
      maximumLiability: v.guaranteedLimit,
      guaranteeTypeCode: v.guaranteeTypeCode,
    }));

    const facilityGuaranteesFromApi: GetFacilityGuaranteesResponse = facilityGuarantees;

    return {
      facilityGuaranteesInAcbs,
      facilityGuarantees,
      facilityGuaranteesFromApi,
    };
  }
}

interface FacilityGuaranteeValues {
  effectiveDateInAcbs: DateString;
  guarantorPartyIdentifier: string;
  limitKey: string;
  expirationDateInAcbs: DateString;
  guaranteedLimit: number;
  guaranteeTypeCode: string;
}

interface GenerateOptions {
  facilityIdentifier: string;
  portfolioIdentifier: string;
}

interface GenerateResult {
  facilityGuaranteesInAcbs: AcbsGetFacilityGuaranteesResponseDto;
  facilityGuarantees: FacilityGuarantee[];
  facilityGuaranteesFromApi: GetFacilityGuaranteesResponse;
}
