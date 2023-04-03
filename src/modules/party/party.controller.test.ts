import { GetPartyGenerator } from '@ukef-test/support/generator/get-party-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
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

  beforeEach(() => {
    partyService = new PartyService({ baseUrl: valueGenerator.httpsUrl() }, null, null, null, null);

    partyServiceGetPartyByIdentifier = jest.fn();
    partyService.getPartyByIdentifier = partyServiceGetPartyByIdentifier;

    controller = new PartyController(null, partyService);
  });

  describe('getPartyByIdentifier', () => {
    const { parties, partiesFromApi } = new GetPartyGenerator(valueGenerator, dateStringTransformations).generate({ numberToGenerate: 1 });
    const partyFromService = parties[0];
    const expectedParty = partiesFromApi[0];

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
});
