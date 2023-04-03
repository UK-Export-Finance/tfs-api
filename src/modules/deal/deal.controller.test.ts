import { TEST_CURRENCIES } from '@ukef-test/support/constants/test-currency.constant';
import { TEST_DATES } from '@ukef-test/support/constants/test-date.constant';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';

import { DealController } from './deal.controller';
import { DealService } from './deal.service';
import { CreateDealRequestItem } from './dto/create-deal-request.dto';
import { CreateDealResponse } from './dto/create-deal-response.dto';

describe('DealController', () => {
  const valueGenerator = new RandomValueGenerator();

  let dealService: DealService;
  let controller: DealController;

  let dealServiceCreateDeal: jest.Mock;

  beforeEach(() => {
    dealService = new DealService(null, null, null, null);

    dealServiceCreateDeal = jest.fn();
    dealService.createDeal = dealServiceCreateDeal;

    controller = new DealController(dealService);
  });

  describe('createDeal', () => {
    const dealIdentifier = valueGenerator.stringOfNumericCharacters({ length: 10 });

    const currency = TEST_CURRENCIES.A_TEST_CURRENCY;
    const dealValue = valueGenerator.nonnegativeFloat();
    const guaranteeCommencementDate = TEST_DATES.A_FUTURE_EFFECTIVE_DATE_ONLY;
    const obligorPartyIdentifier = valueGenerator.stringOfNumericCharacters({ length: 8 });
    const obligorName = valueGenerator.string();
    const obligorIndustryClassification = valueGenerator.string();

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
});
