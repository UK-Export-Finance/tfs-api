import { MdmService } from '@ukef/modules/mdm/mdm.service';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { AxiosError } from 'axios';
import { when } from 'jest-when';
import { PinoLogger } from 'nestjs-pino';

import { MdmException } from '../mdm/exception/mdm.exception';
import { MdmResourceNotFoundException } from '../mdm/exception/mdm-resource-not-found.exception';
import { PartyCustomerTypeService } from './party-customer-type.service';

describe('PartyCustomerTypeService', () => {
  const valueGenerator = new RandomValueGenerator();
  const alternateIdentifier = valueGenerator.ukefPartyId();
  const fallbackCustomerType = valueGenerator.string();
  const firstCustomerType = valueGenerator.string();

  let logWarn: jest.Mock;
  let findCustomersByPartyUrn: jest.Mock;

  let service: PartyCustomerTypeService;

  beforeEach(() => {
    const mdmService = new MdmService(null);
    findCustomersByPartyUrn = jest.fn();
    mdmService.findCustomersByPartyUrn = findCustomersByPartyUrn;

    const logger = new PinoLogger({});
    logWarn = jest.fn();
    logger.warn = logWarn;

    service = new PartyCustomerTypeService(mdmService, logger);
  });

  describe.each([
    {
      description: 'when multiple customers are found with a matching partyUrn',
      givenFirstCustomerTypeReturnedIs: (typeOfFirstCustomer: string | null) =>
        when(findCustomersByPartyUrn)
          .calledWith(alternateIdentifier)
          .mockResolvedValueOnce([
            { type: typeOfFirstCustomer },
            { type: valueGenerator.string() },
            { type: valueGenerator.string() },
            { type: valueGenerator.string() },
          ]),
    },
    {
      description: 'when one customer is found with a matching partyUrn',
      givenFirstCustomerTypeReturnedIs: (typeOfFirstCustomer: string | null) =>
        when(findCustomersByPartyUrn)
          .calledWith(alternateIdentifier)
          .mockResolvedValueOnce([{ type: typeOfFirstCustomer }]),
    },
  ])('$description', ({ givenFirstCustomerTypeReturnedIs }) => {
    it('returns the type of the first customer if the type of the first customer found is not null', async () => {
      givenFirstCustomerTypeReturnedIs(firstCustomerType);

      const type = await service.getCustomerTypeForPartyFromAlternateIdentifier({
        alternateIdentifier,
        fallbackIfNotFound: fallbackCustomerType,
      });

      expect(type).toBe(firstCustomerType);
    });

    it('returns null if the type of the first customer found is null', async () => {
      givenFirstCustomerTypeReturnedIs(null);

      const type = await service.getCustomerTypeForPartyFromAlternateIdentifier({
        alternateIdentifier,
        fallbackIfNotFound: fallbackCustomerType,
      });

      expect(type).toBeNull();
    });

    it('does not log a warning', async () => {
      givenFirstCustomerTypeReturnedIs(firstCustomerType);

      await service.getCustomerTypeForPartyFromAlternateIdentifier({
        alternateIdentifier,
        fallbackIfNotFound: fallbackCustomerType,
      });

      expect(logWarn).not.toHaveBeenCalled();
    });
  });

  describe.each([
    {
      description: 'when no customers are found with a matching partyUrn',
      setUpScenario: () => when(findCustomersByPartyUrn).calledWith(alternateIdentifier).mockResolvedValueOnce([]),
    },
    {
      description: 'when the MdmService throws a MdmResourceNotFoundException',
      setUpScenario: () =>
        when(findCustomersByPartyUrn).calledWith(alternateIdentifier).mockRejectedValue(new MdmResourceNotFoundException('Test error', new AxiosError())),
    },
  ])('$description', ({ setUpScenario }) => {
    beforeEach(() => {
      setUpScenario();
    });

    it('returns the fallback value', async () => {
      const type = await service.getCustomerTypeForPartyFromAlternateIdentifier({
        alternateIdentifier,
        fallbackIfNotFound: fallbackCustomerType,
      });

      expect(type).toBe(fallbackCustomerType);
    });

    it('logs a warning that no matching customers were found', async () => {
      await service.getCustomerTypeForPartyFromAlternateIdentifier({
        alternateIdentifier,
        fallbackIfNotFound: fallbackCustomerType,
      });

      expect(logWarn).toHaveBeenCalledTimes(1);
      expect(logWarn).toHaveBeenCalledWith(
        `No customers were found with a partyUrn matching ${alternateIdentifier}. We will use a fallback customer type of ${fallbackCustomerType}.`,
      );
    });
  });

  describe('when the MdmService throws an MdmException that is not MdmResourceNotFoundException', () => {
    it('throws the MdmException', async () => {
      const mdmException = new MdmException('Test error');
      when(findCustomersByPartyUrn).calledWith(alternateIdentifier).mockRejectedValue(mdmException);

      const getCustomerTypePromise = service.getCustomerTypeForPartyFromAlternateIdentifier({
        alternateIdentifier,
        fallbackIfNotFound: fallbackCustomerType,
      });

      await expect(getCustomerTypePromise).rejects.toBe(mdmException);
    });
  });
});
