import { PROPERTIES } from '@ukef/constants';
import { AcbsAuthenticationService } from '@ukef/modules/acbs/acbs-authentication.service';
import { AcbsDealGuaranteeService } from '@ukef/modules/acbs/acbs-deal-guarantee.service';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { DealGuaranteeGenerator } from '@ukef-test/support/generator/deal-guarantee-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { when } from 'jest-when';

import { CurrentDateProvider } from '../date/current-date.provider';
import { DealGuaranteeService } from './deal-guarantee.service';

jest.mock('@ukef/modules/acbs/acbs-deal-party.service');
jest.mock('@ukef/modules/acbs/acbs-authentication.service');

describe('DealGuaranteeService', () => {
  const valueGenerator = new RandomValueGenerator();
  const idToken = valueGenerator.string();
  const portfolioIdentifier = PROPERTIES.GLOBAL.portfolioIdentifier;

  let acbsAuthenticationService: AcbsAuthenticationService;
  let acbsDealGuaranteeService: AcbsDealGuaranteeService;
  let currentDateProvider: CurrentDateProvider;
  let service: DealGuaranteeService;

  let acbsDealGuaranteeServiceGetGuaranteesForDeal: jest.Mock;

  beforeEach(() => {
    acbsDealGuaranteeService = new AcbsDealGuaranteeService(null, null);

    acbsDealGuaranteeServiceGetGuaranteesForDeal = jest.fn();
    acbsDealGuaranteeService.getGuaranteesForDeal = acbsDealGuaranteeServiceGetGuaranteesForDeal;

    acbsAuthenticationService = new AcbsAuthenticationService(null, null, null);
    const acbsAuthenticationServiceGetIdToken = jest.fn();
    acbsAuthenticationService.getIdToken = acbsAuthenticationServiceGetIdToken;

    currentDateProvider = new CurrentDateProvider();

    const dateStringTransformations = new DateStringTransformations();

    service = new DealGuaranteeService(acbsAuthenticationService, acbsDealGuaranteeService, currentDateProvider, dateStringTransformations);

    when(acbsAuthenticationServiceGetIdToken).calledWith().mockResolvedValueOnce(idToken);
  });

  describe('getGuaranteesForDeal', () => {
    const dealIdentifier = valueGenerator.ukefId();

    const { dealGuaranteesInAcbs, dealGuaranteesFromService } = new DealGuaranteeGenerator(valueGenerator).generate({
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
