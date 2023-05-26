import { InternalServerErrorException } from '@nestjs/common';
import { PROPERTIES } from '@ukef/constants';
import { AcbsDealService } from '@ukef/modules/acbs/acbs-deal.service';
import { AcbsCreateDealDto } from '@ukef/modules/acbs/dto/acbs-create-deal.dto';
import { CurrentDateProvider } from '@ukef/modules/date/current-date.provider';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { getMockAcbsAuthenticationService } from '@ukef-test/support/abcs-authentication.service.mock';
import { CreateDealGenerator } from '@ukef-test/support/generator/create-deal-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { when } from 'jest-when';

import { DealService } from './deal.service';
import { DealBorrowingRestrictionService } from './deal-borrowing-restriction.service';

describe('DealService', () => {
  const valueGenerator = new RandomValueGenerator();
  const dateStringTransformations = new DateStringTransformations();
  const idToken = valueGenerator.string();

  let service: DealService;
  let acbsDealServiceCreateDeal: jest.Mock;
  let currentDateProviderGetEarliestDateFromTodayAnd: jest.Mock;
  let updateDealBorrowingRestriction: jest.Mock;

  beforeEach(() => {
    const acbsDealService = new AcbsDealService(null, null);
    acbsDealServiceCreateDeal = jest.fn();
    acbsDealService.createDeal = acbsDealServiceCreateDeal;

    const mockAcbsAuthenticationService = getMockAcbsAuthenticationService();
    const acbsAuthenticationService = mockAcbsAuthenticationService.service;
    const acbsAuthenticationServiceGetIdToken = mockAcbsAuthenticationService.getIdToken;
    when(acbsAuthenticationServiceGetIdToken).calledWith().mockResolvedValueOnce(idToken);

    const currentDateProvider = new CurrentDateProvider();
    currentDateProviderGetEarliestDateFromTodayAnd = jest.fn();
    currentDateProvider.getEarliestDateFromTodayAnd = currentDateProviderGetEarliestDateFromTodayAnd;

    updateDealBorrowingRestriction = jest.fn();
    const dealBorrowingRestrictionService = new DealBorrowingRestrictionService(null, null);
    dealBorrowingRestrictionService.updateBorrowingRestrictionForDeal = updateDealBorrowingRestriction;

    service = new DealService(acbsAuthenticationService, acbsDealService, dateStringTransformations, currentDateProvider, dealBorrowingRestrictionService);
  });

  describe('createDeal', () => {
    const { portfolioIdentifier } = PROPERTIES.GLOBAL;
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

    describe('creating the deal', () => {
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

        const dealCreatedInAcbs = getDealCreatedInAcbs();

        expect(dealCreatedInAcbs.Description).toBe(descriptionWithTruncatedObligorName);
      });

      it('rounds the dealValue to 2dp for the LimitAmount', async () => {
        const dealValueWithMoreThan2dp = 1.234;
        const dealValueRoundedTo2dp = 1.23;
        const dealWithDealValueWithMoreThan2dp = { ...dealToCreate, dealValue: dealValueWithMoreThan2dp };

        await service.createDeal(dealWithDealValueWithMoreThan2dp);

        const dealCreatedInAcbs = getDealCreatedInAcbs();

        expect(dealCreatedInAcbs.LimitAmount).toBe(dealValueRoundedTo2dp);
      });

      describe('replaces the guaranteeCommencementDate with today if the guaranteeCommencementDate is after today', () => {
        let dealCreatedInAcbs: AcbsCreateDealDto;

        beforeEach(async () => {
          currentDateProviderGetEarliestDateFromTodayAnd.mockReset();
          when(currentDateProviderGetEarliestDateFromTodayAnd).calledWith(guaranteeCommencementDateAsDate).mockReturnValueOnce(now);

          await service.createDeal(dealToCreate);

          dealCreatedInAcbs = getDealCreatedInAcbs();
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

          dealCreatedInAcbs = getDealCreatedInAcbs();
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

    describe('update the deal borrowing restriction', () => {
      it('updates the borrowing restriction for the deal if it has been created successfully', async () => {
        await service.createDeal(dealToCreate);

        expect(updateDealBorrowingRestriction).toHaveBeenCalledWith(dealToCreate.dealIdentifier);
      });

      it('does not update the borrowing restriction for the deal if creating the deal throws an error', async () => {
        when(acbsDealServiceCreateDeal)
          .calledWith(portfolioIdentifier, expectedDealToCreateInAcbs, idToken)
          .mockRejectedValueOnce(new Error('Simulated error for test.'));

        await service.createDeal(dealToCreate).catch(() => {
          // ignored for test
        });

        expect(updateDealBorrowingRestriction).not.toHaveBeenCalled();
      });

      it('throws an InternalServerErrorException if the ACBS service throws an error', async () => {
        const { dealIdentifier } = dealToCreate;
        const acbsServiceError = new Error('Simulated error for test.');
        when(updateDealBorrowingRestriction).calledWith(dealIdentifier).mockRejectedValueOnce(acbsServiceError);

        const createDealPromise = service.createDeal(dealToCreate);

        await expect(createDealPromise).rejects.toBeInstanceOf(InternalServerErrorException);
        await expect(createDealPromise).rejects.toThrow('Internal server error');
        await expect(createDealPromise).rejects.toHaveProperty('cause', acbsServiceError);
        await expect(createDealPromise).rejects.toHaveProperty(
          'response.error',
          `Failed to update the deal borrowing restriction after creating deal ${dealIdentifier}`,
        );
      });
    });

    const getDealCreatedInAcbs = (): AcbsCreateDealDto => acbsDealServiceCreateDeal.mock.calls[0][1];
  });
});
