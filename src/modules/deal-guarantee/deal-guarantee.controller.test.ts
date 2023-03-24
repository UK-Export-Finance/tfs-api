import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';

import { DealGuaranteeController } from './deal-guarantee.controller';
import { DealGuaranteeService } from './deal-guarantee.service';
import { CreateDealGuaranteeRequestItem } from './dto/create-deal-guarantee-request.dto';
import { CreateDealGuaranteeResponse } from './dto/create-deal-guarantee-response.dto';

describe('DealGuaranteeController', () => {
  const valueGenerator = new RandomValueGenerator();

  let dealGuaranteeService: DealGuaranteeService;
  let controller: DealGuaranteeController;

  let dealGuaranteeServiceCreateGuaranteeForDeal: jest.Mock;

  beforeEach(() => {
    dealGuaranteeService = new DealGuaranteeService(null, null, null);

    dealGuaranteeServiceCreateGuaranteeForDeal = jest.fn();
    dealGuaranteeService.createGuaranteeForDeal = dealGuaranteeServiceCreateGuaranteeForDeal;

    controller = new DealGuaranteeController(dealGuaranteeService);
  });

  describe('createGuaranteeForDeal', () => {
    const dealIdentifier = valueGenerator.stringOfNumericCharacters();
    const limitKey = valueGenerator.stringOfNumericCharacters({ maxLength: 8 });
    const guarantorParty = valueGenerator.stringOfNumericCharacters({ maxLength: 8 });
    const guaranteeTypeCode = valueGenerator.stringOfNumericCharacters({ maxLength: 3 });
    const effectiveDate = valueGenerator.dateOnlyString();
    const guaranteeExpiryDate = valueGenerator.dateOnlyString();
    const maximumLiability = valueGenerator.nonnegativeFloat();

    const newGuarantee = new CreateDealGuaranteeRequestItem(
      dealIdentifier,
      effectiveDate,
      limitKey,
      guaranteeExpiryDate,
      maximumLiability,
      guarantorParty,
      guaranteeTypeCode,
    );

    it('creates a guarantee for the deal with the service from the request body', async () => {
      await controller.createGuaranteeForDeal(dealIdentifier, [newGuarantee]);

      expect(dealGuaranteeServiceCreateGuaranteeForDeal).toHaveBeenCalledWith(dealIdentifier, newGuarantee);
    });

    it('returns the deal identifier if creating the guarantee succeeds', async () => {
      const response = await controller.createGuaranteeForDeal(dealIdentifier, [newGuarantee]);

      expect(response).toStrictEqual(new CreateDealGuaranteeResponse(dealIdentifier));
    });

    it('does NOT include unexpected keys from the request body', async () => {
      const newGuaranteePlusUnexpectedKeys = { ...newGuarantee, unexpectedKey: 'unexpected value' };

      await controller.createGuaranteeForDeal(dealIdentifier, [newGuaranteePlusUnexpectedKeys]);

      expect(dealGuaranteeServiceCreateGuaranteeForDeal).toHaveBeenCalledWith(dealIdentifier, newGuarantee);
    });
  });
});
