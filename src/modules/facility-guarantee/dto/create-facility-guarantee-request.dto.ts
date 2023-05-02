import { ACBSID, ENUMS, EXAMPLES, UKEFID } from '@ukef/constants';
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
    length: 10,
    pattern: UKEFID.MAIN_ID.TEN_DIGIT_REGEX,
  })
  readonly facilityIdentifier: UkefId;

  @ValidatedDateOnlyApiProperty({
    description: `The date that this guarantee will take effect. This will be replaced by today's date if a date in the future is provided.`,
  })
  readonly effectiveDate: DateOnlyString;

  @ValidatedStringApiProperty({
    description: 'An ACBS party identifier.',
    length: 8,
    example: EXAMPLES.PARTY_ID,
    pattern: ACBSID.PARTY_ID.REGEX,
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
    description: `ACBS Party Identifier based on the type for Investor, Bond Issuer, Bond Beneficiary, EWCS Facility Provider, EWCS Buyer Exporter. Review functional spec for details.`,
    length: 8,
    example: EXAMPLES.PARTY_ID,
    pattern: ACBSID.PARTY_ID.REGEX,
  })
  readonly guarantorParty: AcbsPartyId;

  @ValidatedStringApiProperty({
    description: `Possible values: bond giver - 315, bond beneficiary - 310, facility provider - 500, buyer for (exporter EWCS) - 321.`,
    length: 3,
    example: ENUMS.GUARANTEE_TYPE_CODES.BOND_BENEFICIARY,
    enum: ENUMS.GUARANTEE_TYPE_CODES,
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
