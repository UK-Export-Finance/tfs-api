import { CreatePartyGenerator } from '@ukef-test/support/generator/create-party-generator';
import { GetPartyGenerator } from '@ukef-test/support/generator/get-party-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { Response } from 'express';
import { when } from 'jest-when';

import { DateStringTransformations } from '../date/date-string.transformations';
import { PartyController } from './party.controller';
import { PartyService } from './party.service';

jest.mock('./party.service');

describe('PartyController', () => {
  const valueGenerator = new RandomValueGenerator();
  const dateStringTransformations = new DateStringTransformations();
  const partyIdentifier = valueGenerator.stringOfNumericCharacters();

  let partyService: PartyService;
  let controller: PartyController;

  let partyServiceGetPartyByIdentifier: jest.Mock;
  let partyServiceCreateParty: jest.Mock;
  let partyServiceGetPartyIdentifierBySearchText: jest.Mock;

  beforeEach(() => {
    partyService = new PartyService(null, null, null);

    partyServiceGetPartyByIdentifier = jest.fn();
    partyService.getPartyByIdentifier = partyServiceGetPartyByIdentifier;

    partyServiceCreateParty = jest.fn();
    partyService.createParty = partyServiceCreateParty;

    partyServiceGetPartyIdentifierBySearchText = jest.fn();
    partyService.getPartyIdentifierBySearchText = partyServiceGetPartyIdentifierBySearchText;

    controller = new PartyController(null, partyService);
  });

  describe('getPartyByIdentifier', () => {
    const { parties, partiesFromApi } = new GetPartyGenerator(valueGenerator, dateStringTransformations).generate({ numberToGenerate: 1 });
    const [partyFromService] = parties;
    const [expectedParty] = partiesFromApi;

    it('returns the party from the service', async () => {
      when(partyServiceGetPartyByIdentifier).calledWith(partyIdentifier).mockResolvedValueOnce(partyFromService);

      const party = await controller.getPartyByIdentifier(partyIdentifier);

      expect(party).toStrictEqual(expectedParty);
    });

    it('does NOT return unexpected keys for the party from the service', async () => {
      const partyWithUnexpectedKey = {
        ...partyFromService,
        unexpectedKey: valueGenerator.string(),
      };
      when(partyServiceGetPartyByIdentifier).calledWith(partyIdentifier).mockResolvedValueOnce(partyWithUnexpectedKey);

      const party = await controller.getPartyByIdentifier(partyIdentifier);

      expect(party).toStrictEqual(expectedParty);
    });
  });

  describe('createParty', () => {
    const { createPartyRequest: newParty } = new CreatePartyGenerator(valueGenerator, dateStringTransformations).generate({ numberToGenerate: 1 });
    const res: Response = {
      status: jest.fn().mockReturnThis(),
    } as any;

    it('creates a party with the service if the PartyAlternateIdentifier does not match existing parties', async () => {
      await controller.createParty(newParty, res);

      expect(partyServiceCreateParty).toHaveBeenCalledWith(newParty[0]);
    });

    it('returns the party identifier if the PartyAlternateIdentifier matches an existing party', async () => {
      when(partyServiceGetPartyIdentifierBySearchText).calledWith(newParty[0].alternateIdentifier).mockResolvedValueOnce({ partyIdentifier });

      const response = await controller.createParty(newParty, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(response).toStrictEqual({ partyIdentifier });
    });

    it('returns the party identifier if creating the party succeeds', async () => {
      when(partyServiceGetPartyIdentifierBySearchText).calledWith(newParty[0].alternateIdentifier).mockResolvedValueOnce(undefined);
      when(partyServiceCreateParty).calledWith(newParty[0]).mockResolvedValueOnce({ partyIdentifier });

      const response = await controller.createParty(newParty, res);

      expect(response).toStrictEqual({ partyIdentifier });
    });
  });
});
