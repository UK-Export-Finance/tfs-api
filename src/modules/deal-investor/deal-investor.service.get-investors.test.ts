import { PROPERTIES } from '@ukef/constants';
import { AcbsDealPartyService } from '@ukef/modules/acbs/acbs-deal-party.service';
import { AcbsAuthenticationService } from '@ukef/modules/acbs-authentication/acbs-authentication.service';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { getMockAcbsAuthenticationService } from '@ukef-test/support/abcs-authentication.service.mock';
import { GetDealInvestorGenerator } from '@ukef-test/support/generator/get-deal-investor-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { when } from 'jest-when';

import { CurrentDateProvider } from '../date/current-date.provider';
import { DealInvestorService } from './deal-investor.service';

jest.mock('@ukef/modules/acbs/acbs-deal-party.service');
jest.mock('@ukef/modules/acbs-authentication/acbs-authentication.service');

describe('DealInvestorService', () => {
  const valueGenerator = new RandomValueGenerator();
  const idToken = valueGenerator.string();
  const { portfolioIdentifier } = PROPERTIES.GLOBAL;

  let acbsAuthenticationService: AcbsAuthenticationService;
  let acbsDealPartyService: AcbsDealPartyService;
  let service: DealInvestorService;

  let acbsDealPartyServiceGetDealPartyForDeal: jest.Mock;

  beforeEach(() => {
    acbsDealPartyService = new AcbsDealPartyService(null, null);

    acbsDealPartyServiceGetDealPartyForDeal = jest.fn();
    acbsDealPartyService.getDealPartiesForDeal = acbsDealPartyServiceGetDealPartyForDeal;

    const mockAcbsAuthenticationService = getMockAcbsAuthenticationService();
    acbsAuthenticationService = mockAcbsAuthenticationService.service;
    const acbsAuthenticationServiceGetIdToken = mockAcbsAuthenticationService.getIdToken;
    when(acbsAuthenticationServiceGetIdToken).calledWith().mockResolvedValueOnce(idToken);

    const currentDateProvider = new CurrentDateProvider();
    const dateStringTransformations = new DateStringTransformations();

    service = new DealInvestorService(acbsAuthenticationService, acbsDealPartyService, currentDateProvider, dateStringTransformations);
  });

  describe('getDealInvestors', () => {
    const dealIdentifier = valueGenerator.ukefId();

    const { dealInvestorsInAcbs, dealInvestorsFromService } = new GetDealInvestorGenerator(valueGenerator).generate({
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
