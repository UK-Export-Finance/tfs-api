import { ENUMS } from '@ukef/constants';
import { SOVEREIGN_ACCOUNT_TYPES } from '@ukef/constants/sovereign-account-types.constant';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { when } from 'jest-when';

import { AssignedRatingCodeProvider } from './assigned-rating-code.provider';
import { PartyCustomerTypeService } from './party-customer-type.service';

describe('AssignedRatingCodeProvider', () => {
  const valueGenerator = new RandomValueGenerator();
  const alternateIdentifier = valueGenerator.ukefPartyId();

  let getCustomerTypeForPartyAlternateIdentifier: jest.Mock;
  let provider: AssignedRatingCodeProvider;

  beforeEach(() => {
    const partyCustomerTypeService = new PartyCustomerTypeService(null, null);
    getCustomerTypeForPartyAlternateIdentifier = jest.fn();
    partyCustomerTypeService.getCustomerTypeForPartyFromAlternateIdentifier = getCustomerTypeForPartyAlternateIdentifier;

    provider = new AssignedRatingCodeProvider(partyCustomerTypeService);
  });

  it.each(SOVEREIGN_ACCOUNT_TYPES)('returns the SOVEREIGN assigned rating code if the party customer type is %s', async (sovereignCustomerType) => {
    when(getCustomerTypeForPartyAlternateIdentifier).calledWith(expect.objectContaining({ alternateIdentifier })).mockResolvedValueOnce(sovereignCustomerType);

    const code = await provider.getAssignedRatingCodeForPartyAlternateIdentifier(alternateIdentifier);

    expect(code).toBe(ENUMS.ASSIGNED_RATING_CODES.SOVEREIGN);
  });

  it('returns the CORPORATE assigned rating code if the party customer type is null', async () => {
    when(getCustomerTypeForPartyAlternateIdentifier).calledWith(expect.objectContaining({ alternateIdentifier })).mockResolvedValueOnce(null);

    const code = await provider.getAssignedRatingCodeForPartyAlternateIdentifier(alternateIdentifier);

    expect(code).toBe(ENUMS.ASSIGNED_RATING_CODES.CORPORATE);
  });

  it('returns the CORPORATE assigned rating code if the party customer type is not found', async () => {
    when(getCustomerTypeForPartyAlternateIdentifier)
      .calledWith(expect.objectContaining({ alternateIdentifier }))
      .mockImplementationOnce(({ fallbackIfNotFound }) => fallbackIfNotFound);

    const code = await provider.getAssignedRatingCodeForPartyAlternateIdentifier(alternateIdentifier);

    expect(code).toBe(ENUMS.ASSIGNED_RATING_CODES.CORPORATE);
  });

  it('returns the CORPORATE assigned rating code if the party customer type is not null or one of the sovereign customer types', async () => {
    const nonSovereignPartyCustomerType = valueGenerator.string();
    when(getCustomerTypeForPartyAlternateIdentifier)
      .calledWith(expect.objectContaining({ alternateIdentifier }))
      .mockResolvedValueOnce(nonSovereignPartyCustomerType);

    const code = await provider.getAssignedRatingCodeForPartyAlternateIdentifier(alternateIdentifier);

    expect(code).toBe(ENUMS.ASSIGNED_RATING_CODES.CORPORATE);
  });
});
