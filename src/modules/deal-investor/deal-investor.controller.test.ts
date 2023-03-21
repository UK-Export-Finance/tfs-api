import { DealInvestorGenerator } from '@ukef-test/support/generator/deal-investor-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { when } from 'jest-when';

import { DealInvestorController } from './deal-investor.controller';
import { DealInvestorService } from './deal-investor.service';

jest.mock('./deal-investor.service');

describe('DealInvestorController', () => {
  const valueGenerator = new RandomValueGenerator();

  let controller: DealInvestorController;
  let dealInvestorService: DealInvestorService;

  let dealInvestorServiceGetDealInvestors: jest.Mock;

  beforeEach(() => {
    dealInvestorService = new DealInvestorService(null, null);

    dealInvestorServiceGetDealInvestors = jest.fn();
    dealInvestorService.getDealInvestors = dealInvestorServiceGetDealInvestors;

    controller = new DealInvestorController(dealInvestorService);
  });

  describe('getDealInvestors', () => {
    const dealIdentifier = valueGenerator.ukefId();
    const portfolioIdentifier = valueGenerator.string();

    const { dealInvestorsFromService } = new DealInvestorGenerator(valueGenerator).generate({
      numberToGenerate: 2,
      dealIdentifier,
      portfolioIdentifier,
    });
    const expectedDealInvestors = dealInvestorsFromService;

    it('returns the deal investors from the service', async () => {
      when(dealInvestorServiceGetDealInvestors).calledWith(dealIdentifier).mockResolvedValueOnce(dealInvestorsFromService);

      const dealInvestors = await controller.getDealInvestors({ dealIdentifier: dealIdentifier });

      expect(dealInvestors).toStrictEqual(expectedDealInvestors);
    });

    it('does return new keys without changing service response', async () => {
      const newKeyValue = valueGenerator.string();
      const dealInvestorsWithUnexpectedKey = dealInvestorsFromService.map((item) => ({
        ...item,
        newKey: newKeyValue,
      }));
      const expectedDealInvestorsWithNewKey = dealInvestorsFromService.map((item) => ({
        ...item,
        newKey: newKeyValue,
      }));

      when(dealInvestorServiceGetDealInvestors).calledWith(dealIdentifier).mockResolvedValueOnce(dealInvestorsWithUnexpectedKey);

      const dealInvestors = await controller.getDealInvestors({ dealIdentifier: dealIdentifier });

      expect(dealInvestors).toStrictEqual(expectedDealInvestorsWithNewKey);
    });
  });
});
