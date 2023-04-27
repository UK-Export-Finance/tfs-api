import { RandomValueGenerator } from '../generator/random-value-generator';

export const generateAcbsCreateFacilityGuaranteeDtoUsing = (valueGenerator: RandomValueGenerator) => ({
  LenderType: {
    LenderTypeCode: valueGenerator.stringOfNumericCharacters({ maxLength: 3 }),
  },
  SectionIdentifier: valueGenerator.stringOfNumericCharacters({ maxLength: 2 }),
  LimitType: {
    LimitTypeCode: valueGenerator.stringOfNumericCharacters({ maxLength: 2 }),
  },
  LimitKey: valueGenerator.acbsPartyId(),
  GuarantorParty: {
    PartyIdentifier: valueGenerator.acbsPartyId(),
  },
  GuaranteeType: {
    GuaranteeTypeCode: valueGenerator.stringOfNumericCharacters({ maxLength: 3 }),
  },
  EffectiveDate: valueGenerator.dateTimeString(),
  ExpirationDate: valueGenerator.dateTimeString(),
  GuaranteedLimit: valueGenerator.nonnegativeFloat(),
  GuaranteedPercentage: valueGenerator.nonnegativeFloat({ max: 100 }),
});
