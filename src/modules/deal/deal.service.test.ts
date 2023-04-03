import { PROPERTIES } from '@ukef/constants';
import { CreateDealGenerator } from '@ukef-test/support/generator/create-deal-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { when } from 'jest-when';

import { AcbsDealService } from '../acbs/acbs-deal.service';
import { AcbsCreateDealDto } from '../acbs/dto/acbs-create-deal.dto';
import { AcbsAuthenticationService } from '../acbs-authentication/acbs-authentication.service';
import { CurrentDateProvider } from '../date/current-date.provider';
import { DateStringTransformations } from '../date/date-string.transformations';
import { DealService } from './deal.service';

describe('DealService', () => {
  const valueGenerator = new RandomValueGenerator();
  const dateStringTransformations = new DateStringTransformations();
  const idToken = valueGenerator.string();

  let service: DealService;
  let acbsDealServiceCreateDeal: jest.Mock;
  let currentDateProviderGetEarliestDateFromTodayAnd: jest.Mock;

  beforeEach(() => {
    const acbsDealService = new AcbsDealService(null, null);
    acbsDealServiceCreateDeal = jest.fn();
    acbsDealService.createDeal = acbsDealServiceCreateDeal;

    const acbsAuthenticationService = new AcbsAuthenticationService(null, null, null);
    const acbsAuthenticationServiceGetIdToken = jest.fn();
    acbsAuthenticationService.getIdToken = acbsAuthenticationServiceGetIdToken;
    when(acbsAuthenticationServiceGetIdToken).calledWith().mockResolvedValueOnce(idToken);

    const currentDateProvider = new CurrentDateProvider();
    currentDateProviderGetEarliestDateFromTodayAnd = jest.fn();
    currentDateProvider.getEarliestDateFromTodayAnd = currentDateProviderGetEarliestDateFromTodayAnd;

    service = new DealService(acbsAuthenticationService, acbsDealService, dateStringTransformations, currentDateProvider);
  });

  describe('createDeal', () => {
    const portfolioIdentifier = PROPERTIES.GLOBAL.portfolioIdentifier;
    const now = new Date();
    const midnightToday = dateStringTransformations.getDateStringFromDate(now);
    const todayFormattedForDescription = dateStringTransformations.getDateOnlyStringFromDate(now).split('-').reverse().join('/');

    const {
      createDealRequestItem: dealToCreate,
      acbsCreateDealRequest: expectedDealToCreateInAcbs,
      guaranteeCommencementDateAsDate,
      guaranteeCommencementDateString,
      guaranteeCommencementDateForDescription,
    } = new CreateDealGenerator(valueGenerator, dateStringTransformations).generate({ numberToGenerate: 1 });

    beforeEach(() => {
      when(currentDateProviderGetEarliestDateFromTodayAnd).calledWith(guaranteeCommencementDateAsDate).mockReturnValueOnce(guaranteeCommencementDateAsDate);
    });

    it('creates a deal in ACBS with a transformation of the requested new deal', async () => {
      await service.createDeal(dealToCreate);

      expect(acbsDealServiceCreateDeal).toHaveBeenCalledWith(portfolioIdentifier, expectedDealToCreateInAcbs, idToken);
    });

    it('truncates the obligorName to 19 characters in the Description', async () => {
      const tooLongObligorName = '123456789_123456789_123456789';
      const obligorNameTruncatedTo19Characters = '123456789_123456789';
      const dealWithTooLongObligorName = { ...dealToCreate, obligorName: tooLongObligorName };
      const descriptionWithTruncatedObligorName = CreateDealGenerator.getExpectedDescription({
        obligorName: obligorNameTruncatedTo19Characters,
        currency: dealToCreate.currency,
        formattedDate: guaranteeCommencementDateForDescription,
      });

      await service.createDeal(dealWithTooLongObligorName);

      const dealCreatedInAcbs: AcbsCreateDealDto = acbsDealServiceCreateDeal.mock.calls[0][1];

      expect(dealCreatedInAcbs.Description).toBe(descriptionWithTruncatedObligorName);
    });

    it('rounds the dealValue to 2dp for the LimitAmount', async () => {
      const dealValueWithMoreThan2dp = 1.234;
      const dealValueRoundedTo2dp = 1.23;
      const dealWithDealValueWithMoreThan2dp = { ...dealToCreate, dealValue: dealValueWithMoreThan2dp };

      await service.createDeal(dealWithDealValueWithMoreThan2dp);

      const dealCreatedInAcbs: AcbsCreateDealDto = acbsDealServiceCreateDeal.mock.calls[0][1];

      expect(dealCreatedInAcbs.LimitAmount).toBe(dealValueRoundedTo2dp);
    });

    describe('replaces the guaranteeCommencementDate with today if the guaranteeCommencementDate is after today', () => {
      let dealCreatedInAcbs: AcbsCreateDealDto;

      beforeEach(async () => {
        currentDateProviderGetEarliestDateFromTodayAnd.mockReset();
        when(currentDateProviderGetEarliestDateFromTodayAnd).calledWith(guaranteeCommencementDateAsDate).mockReturnValueOnce(now);

        await service.createDeal(dealToCreate);

        dealCreatedInAcbs = acbsDealServiceCreateDeal.mock.calls[0][1];
      });

      it('in the OriginalEffectiveDate field in ACBS', () => {
        expect(dealCreatedInAcbs.OriginalEffectiveDate).toBe(midnightToday);
      });

      it('in the OriginalApprovalDate field in ACBS', () => {
        expect(dealCreatedInAcbs.OriginalApprovalDate).toBe(midnightToday);
      });

      it('in the TargetClosingDate field in ACBS', () => {
        expect(dealCreatedInAcbs.TargetClosingDate).toBe(midnightToday);
      });

      it('in the Description field in ACBS', () => {
        const expectedDescriptionWithToday = CreateDealGenerator.getExpectedDescription({
          obligorName: dealToCreate.obligorName,
          currency: dealToCreate.currency,
          formattedDate: todayFormattedForDescription,
        });

        expect(dealCreatedInAcbs.Description).toBe(expectedDescriptionWithToday);
      });
    });

    describe('does NOT replace the guaranteeCommencementDate with today if the guaranteeCommencementDate is before or equal to today', () => {
      let dealCreatedInAcbs: AcbsCreateDealDto;

      beforeEach(async () => {
        currentDateProviderGetEarliestDateFromTodayAnd.mockReset();
        when(currentDateProviderGetEarliestDateFromTodayAnd).calledWith(guaranteeCommencementDateAsDate).mockReturnValueOnce(guaranteeCommencementDateAsDate);

        await service.createDeal(dealToCreate);

        dealCreatedInAcbs = acbsDealServiceCreateDeal.mock.calls[0][1];
      });

      it('in the OriginalEffectiveDate field in ACBS', () => {
        expect(dealCreatedInAcbs.OriginalEffectiveDate).toBe(guaranteeCommencementDateString);
      });

      it('in the OriginalApprovalDate field in ACBS', () => {
        expect(dealCreatedInAcbs.OriginalApprovalDate).toBe(guaranteeCommencementDateString);
      });

      it('in the TargetClosingDate field in ACBS', () => {
        expect(dealCreatedInAcbs.TargetClosingDate).toBe(guaranteeCommencementDateString);
      });

      it('in the Description field in ACBS', () => {
        const expectedDescriptionWithGuaranteeCommencementDate = CreateDealGenerator.getExpectedDescription({
          obligorName: dealToCreate.obligorName,
          currency: dealToCreate.currency,
          formattedDate: guaranteeCommencementDateForDescription,
        });

        expect(dealCreatedInAcbs.Description).toBe(expectedDescriptionWithGuaranteeCommencementDate);
      });
    });
  });
});
