import { AcbsAuthenticationService } from '@ukef/modules/acbs/acbs-authentication.service';
import { AcbsDealPartyService } from '@ukef/modules/acbs/acbs-deal-party.service';
import { DealInvestorGenerator } from '@ukef-test/support/generator/deal-investor-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { when } from 'jest-when';

import { DealInvestorService } from './deal-investor.service';

jest.mock('@ukef/modules/acbs/acbs-deal-party.service');
jest.mock('@ukef/modules/acbs/acbs-authentication.service');

describe('DealInvestorService', () => {
  const valueGenerator = new RandomValueGenerator();
  const idToken = valueGenerator.string();
  // TODO: replace with value from default configuration, or remove field portfolioIdentifier completely.
  const portfolioIdentifier = 'E1';

  let acbsAuthenticationService: AcbsAuthenticationService;
  let acbsDealPartyService: AcbsDealPartyService;
  let service: DealInvestorService;

  let acbsDealPartyServiceGetDealPartyForDeal: jest.Mock;

  beforeEach(() => {
    acbsDealPartyService = new AcbsDealPartyService(null, null);

    acbsDealPartyServiceGetDealPartyForDeal = jest.fn();
    acbsDealPartyService.getDealPartiesForDeal = acbsDealPartyServiceGetDealPartyForDeal;

    acbsAuthenticationService = new AcbsAuthenticationService(null, null, null);
    const acbsAuthenticationServiceGetIdToken = jest.fn();
    acbsAuthenticationService.getIdToken = acbsAuthenticationServiceGetIdToken;

    service = new DealInvestorService(acbsAuthenticationService, acbsDealPartyService);

    when(acbsAuthenticationServiceGetIdToken).calledWith().mockResolvedValueOnce(idToken);
  });

  describe('getDealInvestors', () => {
    const dealIdentifier = valueGenerator.ukefId();

    const { dealInvestorsInAcbs, dealInvestorsFromService } = new DealInvestorGenerator(valueGenerator).generate({
      numberToGenerate: 2,
      dealIdentifier,
      portfolioIdentifier,
    });

    it('returns a transformation of the deal investors', async () => {
      when(acbsDealPartyServiceGetDealPartyForDeal).calledWith(portfolioIdentifier, dealIdentifier, idToken).mockResolvedValueOnce(dealInvestorsInAcbs);
      const dealInvestorsServiceResponse = await service.getDealInvestors(dealIdentifier);

      expect(dealInvestorsServiceResponse).toStrictEqual(dealInvestorsFromService);
    });

    it('does NOT return unexpected keys from the deal investor from the service', async () => {
      const dealInvestorsFromApiWithUnexpectedKey = dealInvestorsInAcbs.map((item) => ({
        ...item,
        unexpectedKey: valueGenerator.string(),
      }));
      when(acbsDealPartyServiceGetDealPartyForDeal)
        .calledWith(portfolioIdentifier, dealIdentifier, idToken)
        .mockResolvedValueOnce(dealInvestorsFromApiWithUnexpectedKey);
      const dealInvestorsServiceResponse = await service.getDealInvestors(dealIdentifier);

      expect(dealInvestorsServiceResponse).toStrictEqual(dealInvestorsFromService);
    });
  });
});
