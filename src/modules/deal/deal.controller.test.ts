import { TEST_CURRENCIES } from '@ukef-test/support/constants/test-currency.constant';
import { TEST_DATES } from '@ukef-test/support/constants/test-date.constant';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { when } from 'jest-when';

import { DealController } from './deal.controller';
import { Deal } from './deal.interface';
import { DealService } from './deal.service';
import { CreateDealRequestItem } from './dto/create-deal-request.dto';
import { CreateDealResponse } from './dto/create-deal-response.dto';

describe('DealController', () => {
  const valueGenerator = new RandomValueGenerator();
  const dealIdentifier = valueGenerator.stringOfNumericCharacters({ length: 10 });
  const randomPortfolioIdentifier = valueGenerator.stringOfNumericCharacters({ length: 2 });

  const currency = TEST_CURRENCIES.A_TEST_CURRENCY;
  const dealValue = valueGenerator.nonnegativeFloat();
  const guaranteeCommencementDate = TEST_DATES.A_FUTURE_EFFECTIVE_DATE_ONLY;
  const obligorPartyIdentifier = valueGenerator.stringOfNumericCharacters({ length: 8 });
  const obligorName = valueGenerator.string();
  const obligorIndustryClassification = valueGenerator.string();

  let dealService: DealService;
  let controller: DealController;

  let dealServiceCreateDeal: jest.Mock;
  let dealServiceGetDealByIdentifier: jest.Mock;

  beforeEach(() => {
    dealService = new DealService(null, null, null, null, null);

    dealServiceCreateDeal = jest.fn();
    dealService.createDeal = dealServiceCreateDeal;

    dealServiceGetDealByIdentifier = jest.fn();
    dealService.getDealByIdentifier = dealServiceGetDealByIdentifier;

    controller = new DealController(dealService);
  });

  describe('createDeal', () => {
    const newDeal = new CreateDealRequestItem(
      dealIdentifier,
      currency,
      dealValue,
      guaranteeCommencementDate,
      obligorPartyIdentifier,
      obligorName,
      obligorIndustryClassification,
    );

    it('creates a deal with the service from the request body', async () => {
      await controller.createDeal([newDeal]);

      expect(dealServiceCreateDeal).toHaveBeenCalledWith(newDeal);
    });

    it('returns the deal identifier if creating the guarantee succeeds', async () => {
      const response = await controller.createDeal([newDeal]);

      expect(response).toStrictEqual(new CreateDealResponse(dealIdentifier));
    });

    it('does NOT include unexpected keys from the request body', async () => {
      const newDealPlusUnexpectedKeys = { ...newDeal, unexpectedKey: 'unexpected value' };

      await controller.createDeal([newDealPlusUnexpectedKeys]);

      expect(dealServiceCreateDeal).toHaveBeenCalledWith(newDeal);
    });
  });

  describe('getDealByIdentifier', () => {
    const dealFromService: Deal = {
      dealIdentifier,
      portfolioIdentifier: randomPortfolioIdentifier,
      currency,
      dealValue,
      guaranteeCommencementDate,
      obligorPartyIdentifier,
      obligorName,
      obligorIndustryClassification,
    };

    it('returns the deal from the service', async () => {
      when(dealServiceGetDealByIdentifier).calledWith(dealIdentifier).mockResolvedValueOnce(dealFromService);

      const deal = await controller.getDealByIdentifier(dealIdentifier);

      expect(deal).toStrictEqual(dealFromService);
    });

    it('does NOT return unexpected keys returned from the service', async () => {
      const dealWithUnexpectedKey = {
        ...dealFromService,
        unexpectedKey: valueGenerator.string(),
      };
      when(dealServiceGetDealByIdentifier).calledWith(dealIdentifier).mockResolvedValueOnce(dealWithUnexpectedKey);

      const deal = await controller.getDealByIdentifier(dealIdentifier);

      expect(deal).toStrictEqual(dealFromService);
    });
  });
});
