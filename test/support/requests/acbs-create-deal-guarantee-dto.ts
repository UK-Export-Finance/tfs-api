import { RandomValueGenerator } from '../generator/random-value-generator';

export const generateAcbsCreateDealGuaranteeDtoUsing = (valueGenerator: RandomValueGenerator) => ({
  LenderType: {
    LenderTypeCode: valueGenerator.stringOfNumericCharacters({ maxLength: 3 }),
  },
  SectionIdentifier: valueGenerator.stringOfNumericCharacters({ maxLength: 2 }),
  LimitType: {
    LimitTypeCode: valueGenerator.stringOfNumericCharacters({ maxLength: 2 }),
  },
  LimitKey: valueGenerator.stringOfNumericCharacters({ maxLength: 8 }),
  GuarantorParty: {
    PartyIdentifier: valueGenerator.stringOfNumericCharacters({ maxLength: 8 }),
  },
  GuaranteeType: {
    GuaranteeTypeCode: valueGenerator.stringOfNumericCharacters({ maxLength: 3 }),
  },
  EffectiveDate: valueGenerator.dateTimeString(),
  ExpirationDate: valueGenerator.dateTimeString(),
  GuaranteedLimit: valueGenerator.nonnegativeFloat(),
  GuaranteedPercentage: valueGenerator.nonnegativeFloat({ max: 100 }),
});
