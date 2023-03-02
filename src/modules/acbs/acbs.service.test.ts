import { HttpService } from '@nestjs/axios';
import { RandomValueGenerator } from '@ukef-test/support/random-value-generator';
import { AxiosError } from 'axios';
import { when } from 'jest-when';
import { of, throwError } from 'rxjs';

import { AcbsService } from './acbs.service';
import { AcbsException } from './exception/acbs.exception';
import { AcbsResourceNotFoundException } from './exception/acbs-resource-not-found.exception';

describe('AcbsService', () => {
  const valueGenerator = new RandomValueGenerator();
  const authToken = valueGenerator.string();
  const baseUrl = valueGenerator.string();

  let httpService: HttpService;
  let service: AcbsService;

  beforeEach(() => {
    httpService = new HttpService();
    service = new AcbsService({ baseUrl }, httpService);
  });

  describe('getExternalRatingsForParty', () => {
    const partyIdentifier = '001';

    it('throws an AcbsException if the request to ACBS fails', async () => {
      const getExternalRatingsForPartyError = new AxiosError();
      // eslint-disable-next-line jest/unbound-method
      when(httpService.get)
        .calledWith(`/Party/${partyIdentifier}/PartyExternalRating`, {
          baseURL: baseUrl,
          headers: { Authorization: `Bearer ${authToken}` },
        })
        .mockReturnValueOnce(throwError(() => getExternalRatingsForPartyError));

      const getExternalRatingsPromise = service.getExternalRatingsForParty(partyIdentifier, authToken);

      await expect(getExternalRatingsPromise).rejects.toBeInstanceOf(AcbsException);
      await expect(getExternalRatingsPromise).rejects.toThrow(`Failed to get the external ratings for the party with id ${partyIdentifier}.`);
      await expect(getExternalRatingsPromise).rejects.toHaveProperty('innerError', getExternalRatingsForPartyError);
    });

    it('returns an empty array of external ratings for the party if ACBS responds with an empty array of external ratings', async () => {
      // eslint-disable-next-line jest/unbound-method
      when(httpService.get)
        .calledWith(`/Party/${partyIdentifier}/PartyExternalRating`, {
          baseURL: baseUrl,
          headers: { Authorization: `Bearer ${authToken}` },
        })
        .mockReturnValueOnce(
          of({
            data: [],
            status: 200,
            statusText: 'OK',
            config: undefined,
            headers: undefined,
          }),
        );

      const externalRatings = await service.getExternalRatingsForParty(partyIdentifier, authToken);

      expect(externalRatings).toStrictEqual([]);
    });

    it('throws an AcbsResourceNotFoundException if ACBS responds with a 400 response that is a string containing "Party not found"', async () => {
      const axiosError = new AxiosError();
      axiosError.response = {
        data: 'Party not found or user does not have access',
        status: 400,
        statusText: 'Bad Request',
        headers: undefined,
        config: undefined,
      };

      // eslint-disable-next-line jest/unbound-method
      when(httpService.get)
        .calledWith(`/Party/${partyIdentifier}/PartyExternalRating`, {
          baseURL: baseUrl,
          headers: { Authorization: `Bearer ${authToken}` },
        })
        .mockReturnValueOnce(throwError(() => axiosError));

      const getExternalRatingsPromise = service.getExternalRatingsForParty(partyIdentifier, authToken);

      await expect(getExternalRatingsPromise).rejects.toBeInstanceOf(AcbsResourceNotFoundException);
      await expect(getExternalRatingsPromise).rejects.toThrow(`Party with identifier ${partyIdentifier} was not found by ACBS.`);
      await expect(getExternalRatingsPromise).rejects.toHaveProperty('innerError', axiosError);
    });

    it('throws an AcbsException if ACBS responds with a 400 response that is a string that does not contain "Party not found"', async () => {
      const axiosError = new AxiosError();
      axiosError.response = {
        data: 'some error string',
        status: 400,
        statusText: 'Bad Request',
        headers: undefined,
        config: undefined,
      };

      // eslint-disable-next-line jest/unbound-method
      when(httpService.get)
        .calledWith(`/Party/${partyIdentifier}/PartyExternalRating`, {
          baseURL: baseUrl,
          headers: { Authorization: `Bearer ${authToken}` },
        })
        .mockReturnValueOnce(throwError(() => axiosError));

      const getExternalRatingsPromise = service.getExternalRatingsForParty(partyIdentifier, authToken);

      await expect(getExternalRatingsPromise).rejects.toBeInstanceOf(AcbsException);
      await expect(getExternalRatingsPromise).rejects.toThrow(`Failed to get the external ratings for the party with id ${partyIdentifier}.`);
      await expect(getExternalRatingsPromise).rejects.toHaveProperty('innerError', axiosError);
    });

    it('throws an AcbsException if ACBS responds with a 400 response that is not a string', async () => {
      const axiosError = new AxiosError();
      axiosError.response = {
        data: { errorMessage: valueGenerator.string() },
        status: 400,
        statusText: 'Bad Request',
        headers: undefined,
        config: undefined,
      };

      // eslint-disable-next-line jest/unbound-method
      when(httpService.get)
        .calledWith(`/Party/${partyIdentifier}/PartyExternalRating`, {
          baseURL: baseUrl,
          headers: { Authorization: `Bearer ${authToken}` },
        })
        .mockReturnValueOnce(throwError(() => axiosError));

      const getExternalRatingsPromise = service.getExternalRatingsForParty(partyIdentifier, authToken);

      await expect(getExternalRatingsPromise).rejects.toBeInstanceOf(AcbsException);
      await expect(getExternalRatingsPromise).rejects.toThrow(`Failed to get the external ratings for the party with id ${partyIdentifier}.`);
      await expect(getExternalRatingsPromise).rejects.toHaveProperty('innerError', axiosError);
    });

    it('returns the external ratings for the party if ACBS responds with the external ratings', async () => {
      const ratingEntityCodeA = valueGenerator.stringOfNumericCharacters();
      const assignedRatingCodeA = valueGenerator.stringOfNumericCharacters();
      const ratedDateA = valueGenerator.date();
      const probabilityofDefaultA = valueGenerator.probabilityFloat();
      const lossGivenDefaultA = valueGenerator.nonnegativeFloat();
      const riskWeightingA = valueGenerator.nonnegativeFloat();
      const externalRatingNote1A = valueGenerator.string();
      const externalRatingNote2A = valueGenerator.string();
      const externalRatingUserCode1A = valueGenerator.string();
      const externalRatingUserCode2A = valueGenerator.string();

      const ratingEntityCodeB = valueGenerator.stringOfNumericCharacters();
      const assignedRatingCodeB = valueGenerator.stringOfNumericCharacters();
      const ratedDateB = valueGenerator.date();
      const probabilityofDefaultB = valueGenerator.probabilityFloat();
      const lossGivenDefaultB = valueGenerator.nonnegativeFloat();
      const riskWeightingB = valueGenerator.nonnegativeFloat();
      const externalRatingNote1B = valueGenerator.string();
      const externalRatingNote2B = valueGenerator.string();
      const externalRatingUserCode1B = valueGenerator.string();
      const externalRatingUserCode2B = valueGenerator.string();

      const externalRatingsInAcbs = [
        {
          PartyIdentifier: partyIdentifier,
          RatingEntity: {
            RatingEntityCode: ratingEntityCodeA,
          },
          AssignedRating: {
            AssignedRatingCode: assignedRatingCodeA,
          },
          RatedDate: ratedDateA,
          ProbabilityofDefault: probabilityofDefaultA,
          LossGivenDefault: lossGivenDefaultA,
          RiskWeighting: riskWeightingA,
          ExternalRatingNote1: externalRatingNote1A,
          ExternalRatingNote2: externalRatingNote2A,
          ExternalRatingUserCode1: {
            UserCode1: externalRatingUserCode1A,
          },
          ExternalRatingUserCode2: {
            UserCode2: externalRatingUserCode2A,
          },
        },
        {
          PartyIdentifier: partyIdentifier,
          RatingEntity: {
            RatingEntityCode: ratingEntityCodeB,
          },
          AssignedRating: {
            AssignedRatingCode: assignedRatingCodeB,
          },
          RatedDate: ratedDateB,
          ProbabilityofDefault: probabilityofDefaultB,
          LossGivenDefault: lossGivenDefaultB,
          RiskWeighting: riskWeightingB,
          ExternalRatingNote1: externalRatingNote1B,
          ExternalRatingNote2: externalRatingNote2B,
          ExternalRatingUserCode1: {
            UserCode1: externalRatingUserCode1B,
          },
          ExternalRatingUserCode2: {
            UserCode2: externalRatingUserCode2B,
          },
        },
      ];

      // eslint-disable-next-line jest/unbound-method
      when(httpService.get)
        .calledWith(`/Party/${partyIdentifier}/PartyExternalRating`, {
          baseURL: baseUrl,
          headers: { Authorization: `Bearer ${authToken}` },
        })
        .mockReturnValueOnce(
          of({
            data: externalRatingsInAcbs,
            status: 200,
            statusText: 'OK',
            config: undefined,
            headers: undefined,
          }),
        );

      const externalRatings = await service.getExternalRatingsForParty(partyIdentifier, authToken);

      expect(externalRatings).toStrictEqual(externalRatingsInAcbs);
    });
  });
});
