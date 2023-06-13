import { GetDealGuaranteeGenerator } from '@ukef-test/support/generator/get-deal-guarantee-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { when } from 'jest-when';

import { DealGuaranteeController } from './deal-guarantee.controller';
import { DealGuaranteeService } from './deal-guarantee.service';
import { CreateDealGuaranteeRequestItem } from './dto/create-deal-guarantee-request.dto';
import { CreateDealGuaranteeResponse } from './dto/create-deal-guarantee-response.dto';

describe('DealGuaranteeController', () => {
  const valueGenerator = new RandomValueGenerator();

  let dealGuaranteeService: DealGuaranteeService;
  let controller: DealGuaranteeController;

  let dealGuaranteeServiceCreateGuaranteeForDeal: jest.Mock;
  let dealGuaranteeServiceGetGuaranteesForDeal: jest.Mock;

  beforeEach(() => {
    dealGuaranteeService = new DealGuaranteeService(null, null, null, null);

    dealGuaranteeServiceCreateGuaranteeForDeal = jest.fn();
    dealGuaranteeServiceGetGuaranteesForDeal = jest.fn();
    dealGuaranteeService.createGuaranteeForDeal = dealGuaranteeServiceCreateGuaranteeForDeal;
    dealGuaranteeService.getGuaranteesForDeal = dealGuaranteeServiceGetGuaranteesForDeal;

    controller = new DealGuaranteeController(dealGuaranteeService);
  });

  describe('createGuaranteeForDeal', () => {
    const dealIdentifier = valueGenerator.ukefId();
    const limitKey = valueGenerator.stringOfNumericCharacters({ maxLength: 8 });
    const guarantorParty = valueGenerator.stringOfNumericCharacters({ maxLength: 8 });
    const guaranteeTypeCode = valueGenerator.stringOfNumericCharacters({ maxLength: 3 });
    const effectiveDate = valueGenerator.dateOnlyString();
    const guaranteeExpiryDate = valueGenerator.dateOnlyString();
    const maximumLiability = valueGenerator.nonnegativeFloat();

    const newGuarantee = new CreateDealGuaranteeRequestItem(
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
  });

  describe('getGuaranteesForDeal', () => {
    const dealIdentifier = valueGenerator.ukefId();
    const portfolioIdentifier = valueGenerator.portfolioId();

    const { dealGuaranteesFromService } = new GetDealGuaranteeGenerator(valueGenerator).generate({
      numberToGenerate: 2,
      dealIdentifier,
      portfolioIdentifier,
    });
    const expectedDealGuarantees = dealGuaranteesFromService;

    it('returns the deal guarantees from the service', async () => {
      when(dealGuaranteeServiceGetGuaranteesForDeal).calledWith(dealIdentifier).mockResolvedValueOnce(dealGuaranteesFromService);

      const dealGuarantees = await controller.getGuaranteesForDeal({ dealIdentifier: dealIdentifier });

      expect(dealGuarantees).toStrictEqual(expectedDealGuarantees);
    });

    it('does return new keys without changing service response', async () => {
      const newKeyValue = valueGenerator.string();
      const dealGuaranteesWithUnexpectedKey = dealGuaranteesFromService.map((item) => ({
        ...item,
        newKey: newKeyValue,
      }));
      const expectedDealGuaranteesWithNewKey = dealGuaranteesFromService.map((item) => ({
        ...item,
        newKey: newKeyValue,
      }));

      when(dealGuaranteeServiceGetGuaranteesForDeal).calledWith(dealIdentifier).mockResolvedValueOnce(dealGuaranteesWithUnexpectedKey);

      const dealGuarantees = await controller.getGuaranteesForDeal({ dealIdentifier: dealIdentifier });

      expect(dealGuarantees).toStrictEqual(expectedDealGuaranteesWithNewKey);
    });
  });
});
