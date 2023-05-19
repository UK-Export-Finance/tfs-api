import { PROPERTIES } from '@ukef/constants';
import { UkefId } from '@ukef/helpers';
import { AcbsDealPartyService } from '@ukef/modules/acbs/acbs-deal-party.service';
import { AcbsCreateDealInvestorRequest } from '@ukef/modules/acbs/dto/acbs-create-deal-investor-request.dto';
import { CurrentDateProvider } from '@ukef/modules/date/current-date.provider';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { getMockAcbsAuthenticationService } from '@ukef-test/support/abcs-authentication.service.mock';
import { TEST_DATES } from '@ukef-test/support/constants/test-date.constant';
import { CreateDealInvestorGenerator } from '@ukef-test/support/generator/create-deal-investor-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { when } from 'jest-when';

import { DealInvestorService } from './deal-investor.service';

jest.mock('@ukef/modules/acbs/acbs-deal-party.service');
jest.mock('@ukef/modules/acbs-authentication/acbs-authentication.service');

describe('DealInvestorService', () => {
  const valueGenerator = new RandomValueGenerator();
  const currentDateProvider = new CurrentDateProvider();
  const dateStringTransformations = new DateStringTransformations();
  const idToken = valueGenerator.string();
  const todayAsDateOnlyString = new Date().toISOString().split('T')[0];

  let acbsDealPartyService: AcbsDealPartyService;
  let service: DealInvestorService;

  let acbsDealPartyServiceCreateInvestorForDeal: jest.Mock;

  beforeEach(() => {
    acbsDealPartyService = new AcbsDealPartyService(null, null);

    acbsDealPartyServiceCreateInvestorForDeal = jest.fn();
    acbsDealPartyService.createInvestorForDeal = acbsDealPartyServiceCreateInvestorForDeal;

    const mockAcbsAuthenticationService = getMockAcbsAuthenticationService();
    const acbsAuthenticationService = mockAcbsAuthenticationService.service;
    const acbsAuthenticationServiceGetIdToken = mockAcbsAuthenticationService.getIdToken;
    when(acbsAuthenticationServiceGetIdToken).calledWith().mockResolvedValueOnce(idToken);

    service = new DealInvestorService(acbsAuthenticationService, acbsDealPartyService, currentDateProvider, dateStringTransformations);
  });

  describe('createInvestorForDeal', () => {
    const dealIdentifier: UkefId = valueGenerator.ukefId();

    const { acbsRequestBodyToCreateDealInvestor, requestBodyToCreateDealInvestor } = new CreateDealInvestorGenerator(
      valueGenerator,
      currentDateProvider,
      dateStringTransformations,
    ).generate({
      numberToGenerate: 2,
      dealIdentifier: dealIdentifier,
    });

    it('creates an investor in ACBS with a transformation of the requested new investor', async () => {
      await service.createInvestorForDeal(dealIdentifier, requestBodyToCreateDealInvestor[0]);

      expect(acbsDealPartyServiceCreateInvestorForDeal).toHaveBeenCalledWith(dealIdentifier, acbsRequestBodyToCreateDealInvestor, idToken);
    });

    it('adds a default value for lenderType before creating the new investor if it is not specified', async () => {
      const { lenderType: _removed, ...newInvestorWithoutLenderType } = requestBodyToCreateDealInvestor[0];

      await service.createInvestorForDeal(dealIdentifier, newInvestorWithoutLenderType);

      const investorCreatedInAcbs: AcbsCreateDealInvestorRequest = acbsDealPartyServiceCreateInvestorForDeal.mock.calls[0][1];

      expect(investorCreatedInAcbs.LenderType.LenderTypeCode).toBe(PROPERTIES.DEAL_INVESTOR.DEFAULT.lenderType.lenderTypeCode);
    });

    it('adds a default value for expiryDate before creating the new investor if it is not specified', async () => {
      const { expiryDate: _removed, ...newInvestorWithoutExpiryDate } = requestBodyToCreateDealInvestor[0];

      await service.createInvestorForDeal(dealIdentifier, newInvestorWithoutExpiryDate);

      const investorCreatedInAcbs: AcbsCreateDealInvestorRequest = acbsDealPartyServiceCreateInvestorForDeal.mock.calls[0][1];

      expect(investorCreatedInAcbs.ExpirationDate).toBe(PROPERTIES.DEAL_INVESTOR.DEFAULT.expirationDate);
    });

    it('adds a default value for dealStatus before creating the new investor if it is not specified', async () => {
      const { dealStatus: _removed, ...newInvestorWithoutDealStatus } = requestBodyToCreateDealInvestor[0];

      await service.createInvestorForDeal(dealIdentifier, newInvestorWithoutDealStatus);

      const investorCreatedInAcbs: AcbsCreateDealInvestorRequest = acbsDealPartyServiceCreateInvestorForDeal.mock.calls[0][1];

      expect(investorCreatedInAcbs.DealStatus.DealStatusCode).toBe(PROPERTIES.DEAL_INVESTOR.DEFAULT.dealStatus.dealStatusCode);
    });

    it(`replaces effectiveDate with today's date if effectiveDate is after today`, async () => {
      await service.createInvestorForDeal(dealIdentifier, { ...requestBodyToCreateDealInvestor[0], effectiveDate: TEST_DATES.A_FUTURE_EFFECTIVE_DATE_ONLY });

      const investorCreatedInAcbs: AcbsCreateDealInvestorRequest = acbsDealPartyServiceCreateInvestorForDeal.mock.calls[0][1];

      expect(investorCreatedInAcbs.EffectiveDate).toBe(dateStringTransformations.addTimeToDateOnlyString(todayAsDateOnlyString));
    });

    it(`does NOT replace effectiveDate with today's date if effectiveDate is NOT after today`, async () => {
      await service.createInvestorForDeal(dealIdentifier, requestBodyToCreateDealInvestor[0]);

      const investorCreatedInAcbs: AcbsCreateDealInvestorRequest = acbsDealPartyServiceCreateInvestorForDeal.mock.calls[0][1];

      expect(investorCreatedInAcbs.EffectiveDate).toBe(dateStringTransformations.addTimeToDateOnlyString(TEST_DATES.A_PAST_EFFECTIVE_DATE_ONLY));
    });
  });
});
