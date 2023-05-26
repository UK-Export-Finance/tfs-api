import { PROPERTIES } from '@ukef/constants';
import { AcbsDealBorrowingRestrictionService } from '@ukef/modules/acbs/acbs-deal-borrowing-restriction.service';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { getMockAcbsAuthenticationService } from '@ukef-test/support/abcs-authentication.service.mock';
import { CreateDealGenerator } from '@ukef-test/support/generator/create-deal-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { when } from 'jest-when';

import { DealBorrowingRestrictionService } from './deal-borrowing-restriction.service';

describe('DealBorrowingRestrictionService', () => {
  const valueGenerator = new RandomValueGenerator();
  const idToken = valueGenerator.string();
  const dealIdentifier = valueGenerator.dealId();
  const { portfolioIdentifier } = PROPERTIES.GLOBAL;

  const { acbsUpdateDealBorrowingRestrictionRequest: expectedRequest } = new CreateDealGenerator(valueGenerator, new DateStringTransformations()).generate({
    numberToGenerate: 1,
  });

  let service: DealBorrowingRestrictionService;
  let updateBorrowingRestrictionForDealInAcbs: jest.Mock;

  beforeEach(() => {
    const acbsDealBorrowingRestrictionService = new AcbsDealBorrowingRestrictionService(null, null);
    updateBorrowingRestrictionForDealInAcbs = jest.fn();
    acbsDealBorrowingRestrictionService.updateBorrowingRestrictionForDeal = updateBorrowingRestrictionForDealInAcbs;

    const mockAcbsAuthenticationService = getMockAcbsAuthenticationService();
    const acbsAuthenticationService = mockAcbsAuthenticationService.service;
    const acbsAuthenticationServiceGetIdToken = mockAcbsAuthenticationService.getIdToken;
    when(acbsAuthenticationServiceGetIdToken).calledWith().mockResolvedValueOnce(idToken);

    service = new DealBorrowingRestrictionService(acbsAuthenticationService, acbsDealBorrowingRestrictionService);
  });

  describe('updateBorrowingRestrictionForDeal', () => {
    it('updates the borrowing restriction for the deal in ACBS', async () => {
      when(updateBorrowingRestrictionForDealInAcbs).calledWith();

      await service.updateBorrowingRestrictionForDeal(dealIdentifier);

      expect(updateBorrowingRestrictionForDealInAcbs).toHaveBeenCalledWith(portfolioIdentifier, dealIdentifier, expectedRequest, idToken);
    });
  });
});
