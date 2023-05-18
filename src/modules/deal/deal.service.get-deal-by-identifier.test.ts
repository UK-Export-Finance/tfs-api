import { PROPERTIES } from '@ukef/constants';
import { AcbsDealService } from '@ukef/modules/acbs/acbs-deal.service';
import { CurrentDateProvider } from '@ukef/modules/date/current-date.provider';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { getMockAcbsAuthenticationService } from '@ukef-test/support/abcs-authentication.service.mock';
import { TEST_CURRENCIES } from '@ukef-test/support/constants/test-currency.constant';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { when } from 'jest-when';

import { AcbsGetDealResponseDto } from '../acbs/dto/acbs-get-deal-response.dto';
import { Deal } from './deal.interface';
import { DealService } from './deal.service';

describe('DealService', () => {
  const valueGenerator = new RandomValueGenerator();
  const dateStringTransformations = new DateStringTransformations();
  const idToken = valueGenerator.string();
  const dealIdentifier = valueGenerator.stringOfNumericCharacters({ length: 10 });
  const { portfolioIdentifier } = PROPERTIES.GLOBAL;
  const currency = TEST_CURRENCIES.A_TEST_CURRENCY;
  const dealValue = valueGenerator.nonnegativeFloat();
  const guaranteeCommencementDateInAcbs = '2023-02-01T00:00:00Z';
  const guaranteeCommencementDateOnly = '2023-02-01';
  const obligorPartyIdentifier = valueGenerator.stringOfNumericCharacters({ length: 8 });
  const obligorName = valueGenerator.string();
  const obligorIndustryClassification = valueGenerator.string();

  const dealInAcbs: AcbsGetDealResponseDto = {
    DealIdentifier: dealIdentifier,
    PortfolioIdentifier: portfolioIdentifier,
    Currency: {
      CurrencyCode: currency,
    },
    OriginalEffectiveDate: guaranteeCommencementDateInAcbs,
    MemoLimitAmount: dealValue,
    IndustryClassification: {
      IndustryClassificationCode: obligorIndustryClassification,
    },
    BorrowerParty: {
      PartyName1: obligorName,
      PartyIdentifier: obligorPartyIdentifier,
    },
  };

  const expectedDealFromService: Deal = {
    dealIdentifier,
    portfolioIdentifier,
    currency,
    dealValue,
    guaranteeCommencementDate: guaranteeCommencementDateOnly,
    obligorPartyIdentifier,
    obligorName,
    obligorIndustryClassification,
  };

  let service: DealService;
  let acbsDealServiceGetDealByIdentifier: jest.Mock;

  beforeEach(() => {
    const acbsDealService = new AcbsDealService(null, null);
    acbsDealServiceGetDealByIdentifier = jest.fn();
    acbsDealService.getDealByIdentifier = acbsDealServiceGetDealByIdentifier;

    const mockAcbsAuthenticationService = getMockAcbsAuthenticationService();
    const acbsAuthenticationService = mockAcbsAuthenticationService.service;
    const acbsAuthenticationServiceGetIdToken = mockAcbsAuthenticationService.getIdToken;
    when(acbsAuthenticationServiceGetIdToken).calledWith().mockResolvedValueOnce(idToken);

    service = new DealService(acbsAuthenticationService, acbsDealService, dateStringTransformations, new CurrentDateProvider());
  });

  describe('getDealByIdentifier', () => {
    const { portfolioIdentifier } = PROPERTIES.GLOBAL;

    it('returns a transformation of the deal from ACBS', async () => {
      when(acbsDealServiceGetDealByIdentifier).calledWith(portfolioIdentifier, dealIdentifier, idToken).mockResolvedValueOnce(dealInAcbs);

      const deal = await service.getDealByIdentifier(dealIdentifier);

      expect(deal).toStrictEqual(expectedDealFromService);
    });

    it('returns a null guarantee commencement date if it is null in the ACBS response', async () => {
      const dealInAcbsWithNullOriginalEffectiveDate: AcbsGetDealResponseDto = { ...dealInAcbs, OriginalEffectiveDate: null };
      when(acbsDealServiceGetDealByIdentifier)
        .calledWith(portfolioIdentifier, dealIdentifier, idToken)
        .mockResolvedValueOnce(dealInAcbsWithNullOriginalEffectiveDate);

      const deal = await service.getDealByIdentifier(dealIdentifier);

      expect(deal.guaranteeCommencementDate).toBeNull();
    });

    it('returns the obligor industry classification as an empty string if it is null in the ACBS response', async () => {
      const dealInAcbsWithNullIndustryClassificationCode: AcbsGetDealResponseDto = {
        ...dealInAcbs,
        IndustryClassification: { IndustryClassificationCode: null },
      };
      when(acbsDealServiceGetDealByIdentifier)
        .calledWith(portfolioIdentifier, dealIdentifier, idToken)
        .mockResolvedValueOnce(dealInAcbsWithNullIndustryClassificationCode);

      const deal = await service.getDealByIdentifier(dealIdentifier);

      expect(deal.obligorIndustryClassification).toBe('');
    });

    it('returns the obligor party name as an empty string if it is null in the ACBS response', async () => {
      const dealInAcbsWithNullPartyName: AcbsGetDealResponseDto = { ...dealInAcbs, BorrowerParty: { ...dealInAcbs.BorrowerParty, PartyName1: null } };
      when(acbsDealServiceGetDealByIdentifier).calledWith(portfolioIdentifier, dealIdentifier, idToken).mockResolvedValueOnce(dealInAcbsWithNullPartyName);

      const deal = await service.getDealByIdentifier(dealIdentifier);

      expect(deal.obligorName).toBe('');
    });
  });
});
