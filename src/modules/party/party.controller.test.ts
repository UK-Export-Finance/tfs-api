import { PartyGenerator } from '@ukef-test/support/generator/party-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { when } from 'jest-when';

import { PartyController } from './party.controller';
import { PartyService } from './party.service';

jest.mock('./party.service');

describe('PartyController', () => {
  const valueGenerator = new RandomValueGenerator();
  const partyIdentifier = valueGenerator.stringOfNumericCharacters();

  let partyService: PartyService;
  let controller: PartyController;

  beforeEach(() => {
    partyService = new PartyService({ baseUrl: valueGenerator.httpsUrl() }, null, null, null);
    controller = new PartyController(null, partyService);
  });

  describe('getPartyByIdentifier', () => {
    const { parties, partiesFromApi } = new PartyGenerator(valueGenerator).generate({ numberToGenerate: 1 });
    const partyFromService = parties[0];
    const expectedParty = partiesFromApi[0];

    it('returns the party from the service', async () => {
      // eslint-disable-next-line jest/unbound-method
      when(partyService.getPartyByIdentifier).calledWith(partyIdentifier).mockResolvedValueOnce(partyFromService);

      const party = await controller.getPartyByIdentifier(partyIdentifier);

      expect(party).toStrictEqual(expectedParty);
    });

    it('does NOT return unexpected keys for the party from the service', async () => {
      const partyWithUnexpectedKey = {
        ...partyFromService,
        unexpectedKey: valueGenerator.string(),
      };
      // eslint-disable-next-line jest/unbound-method
      when(partyService.getPartyByIdentifier).calledWith(partyIdentifier).mockResolvedValueOnce(partyWithUnexpectedKey);

      const party = await controller.getPartyByIdentifier(partyIdentifier);

      expect(party).toStrictEqual(expectedParty);
    });
  });
});
