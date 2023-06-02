import { PROPERTIES } from '@ukef/constants';
import { AcbsDealGuaranteeService } from '@ukef/modules/acbs/acbs-deal-guarantee.service';
import { CurrentDateProvider } from '@ukef/modules/date/current-date.provider';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { getMockAcbsAuthenticationService } from '@ukef-test/support/abcs-authentication.service.mock';
import { GetDealGuaranteeGenerator } from '@ukef-test/support/generator/get-deal-guarantee-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { when } from 'jest-when';

import { DealGuaranteeService } from './deal-guarantee.service';

jest.mock('@ukef/modules/acbs/acbs-deal-party.service');
jest.mock('@ukef/modules/acbs-authentication/acbs-authentication.service');

describe('DealGuaranteeService', () => {
  const valueGenerator = new RandomValueGenerator();
  const idToken = valueGenerator.string();
  const { portfolioIdentifier } = PROPERTIES.GLOBAL;

  let acbsDealGuaranteeService: AcbsDealGuaranteeService;
  let currentDateProvider: CurrentDateProvider;
  let service: DealGuaranteeService;

  let acbsDealGuaranteeServiceGetGuaranteesForDeal: jest.Mock;

  beforeEach(() => {
    acbsDealGuaranteeService = new AcbsDealGuaranteeService(null, null);

    acbsDealGuaranteeServiceGetGuaranteesForDeal = jest.fn();
    acbsDealGuaranteeService.getGuaranteesForDeal = acbsDealGuaranteeServiceGetGuaranteesForDeal;

    const mockAcbsAuthenticationService = getMockAcbsAuthenticationService();
    const acbsAuthenticationService = mockAcbsAuthenticationService.service;
    const acbsAuthenticationServiceGetIdToken = mockAcbsAuthenticationService.getIdToken;
    when(acbsAuthenticationServiceGetIdToken).calledWith().mockResolvedValueOnce(idToken);

    currentDateProvider = new CurrentDateProvider();

    const dateStringTransformations = new DateStringTransformations();

    service = new DealGuaranteeService(acbsAuthenticationService, acbsDealGuaranteeService, dateStringTransformations, currentDateProvider);
  });

  describe('getGuaranteesForDeal', () => {
    const dealIdentifier = valueGenerator.ukefId();

    const { dealGuaranteesInAcbs, dealGuaranteesFromService } = new GetDealGuaranteeGenerator(valueGenerator).generate({
      numberToGenerate: 2,
      dealIdentifier,
      portfolioIdentifier,
    });

    it('returns a transformation of the deal guarantees', async () => {
      when(acbsDealGuaranteeServiceGetGuaranteesForDeal).calledWith(portfolioIdentifier, dealIdentifier, idToken).mockResolvedValueOnce(dealGuaranteesInAcbs);
      const dealGuaranteesServiceResponse = await service.getGuaranteesForDeal(dealIdentifier);

      expect(dealGuaranteesServiceResponse).toStrictEqual(dealGuaranteesFromService);
    });

    it('does NOT return unexpected keys from the deal guarantee from the service', async () => {
      const dealGuaranteesFromApiWithUnexpectedKey = dealGuaranteesInAcbs.map((item) => ({
        ...item,
        unexpectedKey: valueGenerator.string(),
      }));
      when(acbsDealGuaranteeServiceGetGuaranteesForDeal)
        .calledWith(portfolioIdentifier, dealIdentifier, idToken)
        .mockResolvedValueOnce(dealGuaranteesFromApiWithUnexpectedKey);
      const dealGuaranteesServiceResponse = await service.getGuaranteesForDeal(dealIdentifier);

      expect(dealGuaranteesServiceResponse).toStrictEqual(dealGuaranteesFromService);
    });
  });
});
