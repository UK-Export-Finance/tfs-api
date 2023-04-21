import { EXAMPLES } from '@ukef/constants';
import { ValidatedDateOnlyApiProperty } from '@ukef/decorators/validated-date-only-api-property.decorator';
import { ValidatedNumberApiProperty } from '@ukef/decorators/validated-number-api-property.decorator';
import { ValidatedStringApiProperty } from '@ukef/decorators/validated-string-api-property.decorator';
import { AcbsPartyId, UkefId } from '@ukef/helpers';
import { DateOnlyString } from '@ukef/helpers/date-only-string.type';

export type CreateFacilityGuaranteeRequest = CreateFacilityGuaranteeRequestItem[];

export class CreateFacilityGuaranteeRequestItem {
  @ValidatedStringApiProperty({
    description: 'The identifier of the facility to create the guarantee for.',
    example: EXAMPLES.FACILITY_ID,
    minLength: 10,
    maxLength: 10,
    pattern: /^00\d{8}$/,
  })
  readonly facilityIdentifier: UkefId;

  @ValidatedDateOnlyApiProperty({
    description: `The date that this guarantee will take effect. This will be replaced by today's date if a date in the past is provided.`,
  })
  readonly effectiveDate: DateOnlyString;

  @ValidatedStringApiProperty({
    description: 'An ACBS party identifier.',
    minLength: 8,
    maxLength: 8,
    example: EXAMPLES.PARTY_ID,
  })
  readonly limitKey: AcbsPartyId;

  @ValidatedDateOnlyApiProperty({
    description: 'The date that this guarantee will expire on.',
  })
  readonly guaranteeExpiryDate: DateOnlyString;

  @ValidatedNumberApiProperty({
    description: 'The maximum amount the guarantor will guarantee.',
    minimum: 0,
  })
  readonly maximumLiability: number;

  @ValidatedStringApiProperty({
    description: `ACBS Party Identifier based on the type for investor, Bond Issuer, Bond Beneficiary, EWCS Facility Provider, EWCSBuyer Exporter, review functional spec for details.`,
    minLength: 8,
    maxLength: 8,
  })
  readonly guarantorParty: AcbsPartyId;

  @ValidatedStringApiProperty({
    description: `Possible values: bond giver(315), bond beneficiary (310), facility provider (500), buyer for (exporter EWCS) - 321`,
    minLength: 3,
    maxLength: 3,
  })
  readonly guaranteeTypeCode: string;

  constructor(
    facilityIdentifier: UkefId,
    effectiveDate: DateOnlyString,
    limitKey: AcbsPartyId,
    guaranteeExpiryDate: DateOnlyString,
    maximumLiability: number,
    guarantorParty: AcbsPartyId,
    guaranteeTypeCode: string,
  ) {
    this.facilityIdentifier = facilityIdentifier;
    this.effectiveDate = effectiveDate;
    this.limitKey = limitKey;
    this.guaranteeExpiryDate = guaranteeExpiryDate;
    this.maximumLiability = maximumLiability;
    this.guarantorParty = guarantorParty;
    this.guaranteeTypeCode = guaranteeTypeCode;
  }
}
