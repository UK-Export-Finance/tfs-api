import { ENUMS } from '@ukef/constants';
import { LenderTypeCodeEnum } from '@ukef/constants/enums/lender-type-code';
import { AcbsCreateFacilityPartyDto } from '@ukef/modules/acbs/dto/acbs-create-facility-party.dto';

import { TEST_CURRENCIES } from '../constants/test-currency.constant';
import { RandomValueGenerator } from '../generator/random-value-generator';

export const generateAcbsCreateFacilityPartyDtoUsing = (valueGenerator: RandomValueGenerator): AcbsCreateFacilityPartyDto => ({
  FacilityStatus: {
    FacilityStatusCode: valueGenerator.character(),
  },
  InvolvedParty: {
    PartyIdentifier: valueGenerator.stringOfNumericCharacters(),
  },
  EffectiveDate: valueGenerator.dateTimeString(),
  ExpirationDate: valueGenerator.dateTimeString(),
  LenderType: {
    LenderTypeCode: valueGenerator.enumValue<LenderTypeCodeEnum>(ENUMS.LENDER_TYPE_CODES),
  },
  SectionIdentifier: valueGenerator.stringOfNumericCharacters({ minLength: 1, maxLength: 2 }),
  Currency: {
    CurrencyCode: TEST_CURRENCIES.A_TEST_CURRENCY,
  },
  LimitAmount: valueGenerator.nonnegativeFloat(),
  CustomerAdvisedIndicator: valueGenerator.boolean(),
  LimitRevolvingIndicator: valueGenerator.boolean(),
});
