import { UkefId } from '@ukef/helpers';
import { CurrentDateProvider } from '@ukef/modules/date/current-date.provider';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { CreateDealInvestorGenerator } from '@ukef-test/support/generator/create-deal-investor-generator';
import { GetDealInvestorGenerator } from '@ukef-test/support/generator/get-deal-investor-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { when } from 'jest-when';

import { DealInvestorController } from './deal-investor.controller';
import { DealInvestorService } from './deal-investor.service';
import { CreateDealInvestorResponse } from './dto/create-deal-investor-response.dto';

jest.mock('./deal-investor.service');

describe('DealInvestorController', () => {
  const valueGenerator = new RandomValueGenerator();
  const currentDateProvider = new CurrentDateProvider();
  const dateStringTransformations = new DateStringTransformations();

  let controller: DealInvestorController;
  let dealInvestorService: DealInvestorService;

  let dealInvestorServiceGetDealInvestors: jest.Mock;
  let dealInvestorServiceCreateInvestorForDeal: jest.Mock;

  beforeEach(() => {
    dealInvestorService = new DealInvestorService(null, null, null, null);

    dealInvestorServiceGetDealInvestors = jest.fn();
    dealInvestorService.getDealInvestors = dealInvestorServiceGetDealInvestors;

    dealInvestorServiceCreateInvestorForDeal = jest.fn();
    dealInvestorService.createInvestorForDeal = dealInvestorServiceCreateInvestorForDeal;

    controller = new DealInvestorController(dealInvestorService);
  });

  describe('getDealInvestors', () => {
    const dealIdentifier = valueGenerator.ukefId();
    const portfolioIdentifier = valueGenerator.portfolioId();

    const { dealInvestorsFromService } = new GetDealInvestorGenerator(valueGenerator).generate({
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

  describe('createInvestorForDeal', () => {
    const dealIdentifier: UkefId = valueGenerator.ukefId();

    const { requestBodyToCreateDealInvestor } = new CreateDealInvestorGenerator(valueGenerator, currentDateProvider, dateStringTransformations).generate({
      numberToGenerate: 2,
      dealIdentifier: dealIdentifier,
    });

    it('creates an investor for the deal with the service from the request body', async () => {
      await controller.createInvestorForDeal(dealIdentifier, requestBodyToCreateDealInvestor);

      expect(dealInvestorServiceCreateInvestorForDeal).toHaveBeenCalledWith(dealIdentifier, requestBodyToCreateDealInvestor[0]);
    });

    it('returns the deal identifier if creating the investor succeeds', async () => {
      const response = await controller.createInvestorForDeal(dealIdentifier, requestBodyToCreateDealInvestor);

      expect(response).toStrictEqual(new CreateDealInvestorResponse(dealIdentifier));
    });

    it('does NOT include unexpected keys from the request body', async () => {
      const requestBodyToCreateDealInvestorPlusUnexpectedKeys = [
        {
          ...requestBodyToCreateDealInvestor[0],
          unexpectedKey: 'unexpected value',
        },
        requestBodyToCreateDealInvestor[1],
      ];

      await controller.createInvestorForDeal(dealIdentifier, requestBodyToCreateDealInvestorPlusUnexpectedKeys);

      expect(dealInvestorServiceCreateInvestorForDeal).toHaveBeenCalledWith(dealIdentifier, requestBodyToCreateDealInvestor[0]);
    });
  });
});
