import { ENUMS } from '@ukef/constants';
import { AssignedRatingCodeProvider } from '@ukef/modules/party/assigned-rating-code.provider';
import { CreatePartyGenerator } from '@ukef-test/support/generator/create-party-generator';
import { GetPartyExternalRatingGenerator } from '@ukef-test/support/generator/get-party-external-rating-generator';
import { GetPartyGenerator } from '@ukef-test/support/generator/get-party-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { Response } from 'express';
import { when } from 'jest-when';

import { DateStringTransformations } from '../date/date-string.transformations';
import { PartyExternalRatingService } from '../party-external-rating/party-external-rating.service';
import { PartyController } from './party.controller';
import { PartyService } from './party.service';

jest.mock('./party.service');

describe('PartyController', () => {
  const valueGenerator = new RandomValueGenerator();
  const dateStringTransformations = new DateStringTransformations();
  const partyIdentifier = valueGenerator.acbsPartyId();

  let partyService: PartyService;
  let partyExternalRatingService: PartyExternalRatingService;
  let assignedRatingCodeProvider: AssignedRatingCodeProvider;
  let controller: PartyController;

  let partyServiceGetPartyByIdentifier: jest.Mock;
  let partyServiceCreateParty: jest.Mock;
  let partyServiceGetPartyIdentifierBySearchText: jest.Mock;
  let partyExternalRatingServiceGetExternalRatingsForParty: jest.Mock;
  let partyExternalRatingServiceCreateExternalRatingForParty: jest.Mock;
  let assignedRatingCodeProviderGetAssignedRatingCode: jest.Mock;

  beforeEach(() => {
    partyService = new PartyService(null, null, null);
    partyExternalRatingService = new PartyExternalRatingService(null, null, null);
    assignedRatingCodeProvider = new AssignedRatingCodeProvider();

    partyServiceGetPartyByIdentifier = jest.fn();
    partyService.getPartyByIdentifier = partyServiceGetPartyByIdentifier;

    partyServiceCreateParty = jest.fn();
    partyService.createParty = partyServiceCreateParty;

    partyServiceGetPartyIdentifierBySearchText = jest.fn();
    partyService.getPartyIdentifierBySearchText = partyServiceGetPartyIdentifierBySearchText;

    partyExternalRatingServiceGetExternalRatingsForParty = jest.fn();
    partyExternalRatingService.getExternalRatingsForParty = partyExternalRatingServiceGetExternalRatingsForParty;

    partyExternalRatingServiceCreateExternalRatingForParty = jest.fn();
    partyExternalRatingService.createExternalRatingForParty = partyExternalRatingServiceCreateExternalRatingForParty;

    assignedRatingCodeProviderGetAssignedRatingCode = jest.fn();
    assignedRatingCodeProvider.getAssignedRatingCode = assignedRatingCodeProviderGetAssignedRatingCode;

    controller = new PartyController(partyService, partyExternalRatingService, assignedRatingCodeProvider);
  });

  describe('getPartyByIdentifier', () => {
    const { parties, apiParties } = new GetPartyGenerator(valueGenerator, dateStringTransformations).generate({ numberToGenerate: 1 });
    const [partyFromService] = parties;
    const [expectedParty] = apiParties;

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
    const { apiCreatePartyRequest } = new CreatePartyGenerator(valueGenerator, dateStringTransformations).generate({ numberToGenerate: 1 });
    const res: Response = {
      status: jest.fn().mockReturnThis(),
    } as any;
    const [newParty] = apiCreatePartyRequest;
    const { officerRiskDate: ratedDate } = newParty;
    const { externalRatings } = new GetPartyExternalRatingGenerator(valueGenerator).generate({ numberToGenerate: 1, partyIdentifier });
    const { SOVEREIGN, CORPORATE } = ENUMS.ASSIGNED_RATING_CODES;

    it('creates a party with the service if the PartyAlternateIdentifier does not match existing parties', async () => {
      when(partyServiceCreateParty).calledWith(newParty).mockResolvedValueOnce({ partyIdentifier });
      await controller.createParty(apiCreatePartyRequest, res);

      expect(partyServiceCreateParty).toHaveBeenCalledWith(newParty);
    });

    it('returns the party identifier if the PartyAlternateIdentifier matches an existing party', async () => {
      when(partyServiceGetPartyIdentifierBySearchText).calledWith(newParty.alternateIdentifier).mockResolvedValueOnce({ partyIdentifier });

      const response = await controller.createParty(apiCreatePartyRequest, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(response).toStrictEqual({ partyIdentifier });
    });

    it('returns the party identifier if creating the party succeeds', async () => {
      when(partyServiceGetPartyIdentifierBySearchText).calledWith(newParty.alternateIdentifier).mockResolvedValueOnce(undefined);
      when(partyServiceCreateParty).calledWith(newParty).mockResolvedValueOnce({ partyIdentifier });

      const response = await controller.createParty(apiCreatePartyRequest, res);

      expect(response).toStrictEqual({ partyIdentifier });
    });

    it('does not create an external rating for the newly created party if one or more external ratings already exist', async () => {
      when(partyServiceGetPartyIdentifierBySearchText).calledWith(newParty.alternateIdentifier).mockResolvedValueOnce(undefined);
      when(partyServiceCreateParty).calledWith(newParty).mockResolvedValueOnce({ partyIdentifier });
      when(partyExternalRatingServiceGetExternalRatingsForParty).calledWith(partyIdentifier).mockResolvedValueOnce(externalRatings);
      when(assignedRatingCodeProviderGetAssignedRatingCode).calledWith().mockReturnValueOnce(CORPORATE);

      await controller.createParty(apiCreatePartyRequest, res);

      expect(assignedRatingCodeProviderGetAssignedRatingCode).not.toHaveBeenCalled();
      expect(partyExternalRatingServiceCreateExternalRatingForParty).not.toHaveBeenCalled();
    });

    it(`creates an external rating for the newly created party if it does not already have any, for a sovereign account type`, async () => {
      when(partyServiceGetPartyIdentifierBySearchText).calledWith(newParty.alternateIdentifier).mockResolvedValueOnce(undefined);
      when(partyServiceCreateParty).calledWith(newParty).mockResolvedValueOnce({ partyIdentifier });
      when(partyExternalRatingServiceGetExternalRatingsForParty).calledWith(partyIdentifier).mockResolvedValueOnce([]);
      when(assignedRatingCodeProviderGetAssignedRatingCode).calledWith().mockReturnValueOnce(SOVEREIGN);

      await controller.createParty(apiCreatePartyRequest, res);

      expect(partyExternalRatingServiceCreateExternalRatingForParty).toHaveBeenCalledWith(partyIdentifier, { assignedRatingCode: SOVEREIGN, ratedDate });
    });

    it(`creates an external rating for the newly created party if it does not already have any, for a corporate account type`, async () => {
      when(partyServiceGetPartyIdentifierBySearchText).calledWith(newParty.alternateIdentifier).mockResolvedValueOnce(undefined);
      when(partyServiceCreateParty).calledWith(newParty).mockResolvedValueOnce({ partyIdentifier });
      when(partyExternalRatingServiceGetExternalRatingsForParty).calledWith(partyIdentifier).mockResolvedValueOnce([]);
      when(assignedRatingCodeProviderGetAssignedRatingCode).calledWith().mockReturnValueOnce(CORPORATE);

      await controller.createParty(apiCreatePartyRequest, res);

      expect(partyExternalRatingServiceCreateExternalRatingForParty).toHaveBeenCalledWith(partyIdentifier, { assignedRatingCode: CORPORATE, ratedDate });
    });

    it('does not create an external rating for the existing party if one or more external ratings already exist', async () => {
      when(partyServiceGetPartyIdentifierBySearchText).calledWith(newParty.alternateIdentifier).mockResolvedValueOnce({ partyIdentifier });
      when(partyExternalRatingServiceGetExternalRatingsForParty).calledWith(partyIdentifier).mockResolvedValueOnce(externalRatings);
      when(assignedRatingCodeProviderGetAssignedRatingCode).calledWith().mockReturnValueOnce(CORPORATE);

      await controller.createParty(apiCreatePartyRequest, res);

      expect(assignedRatingCodeProviderGetAssignedRatingCode).not.toHaveBeenCalled();
      expect(partyExternalRatingServiceCreateExternalRatingForParty).not.toHaveBeenCalled();
    });

    it(`creates an external rating for the existing party if it does not already have any, for a sovereign account type`, async () => {
      when(partyServiceGetPartyIdentifierBySearchText).calledWith(newParty.alternateIdentifier).mockResolvedValueOnce({ partyIdentifier });
      when(partyExternalRatingServiceGetExternalRatingsForParty).calledWith(partyIdentifier).mockResolvedValueOnce([]);
      when(assignedRatingCodeProviderGetAssignedRatingCode).calledWith().mockReturnValueOnce(SOVEREIGN);

      await controller.createParty(apiCreatePartyRequest, res);

      expect(partyExternalRatingServiceCreateExternalRatingForParty).toHaveBeenCalledWith(partyIdentifier, { assignedRatingCode: SOVEREIGN, ratedDate });
    });

    it(`creates an external rating for the existing party if it does not already have any, for a corporate account type`, async () => {
      when(partyServiceGetPartyIdentifierBySearchText).calledWith(newParty.alternateIdentifier).mockResolvedValueOnce({ partyIdentifier });
      when(partyExternalRatingServiceGetExternalRatingsForParty).calledWith(partyIdentifier).mockResolvedValueOnce([]);
      when(assignedRatingCodeProviderGetAssignedRatingCode).calledWith().mockReturnValueOnce(CORPORATE);

      await controller.createParty(apiCreatePartyRequest, res);

      expect(partyExternalRatingServiceCreateExternalRatingForParty).toHaveBeenCalledWith(partyIdentifier, { assignedRatingCode: CORPORATE, ratedDate });
    });
  });
});
