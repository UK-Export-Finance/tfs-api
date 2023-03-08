import { HttpService } from '@nestjs/axios';
import { PartyGenerator } from '@ukef-test/support/generator/party-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { AxiosError } from 'axios';
import { when } from 'jest-when';
import { of, throwError } from 'rxjs';

import { AcbsPartyService } from './acbs-party.service';
import { AcbsException } from './exception/acbs.exception';
import { AcbsResourceNotFoundException } from './exception/acbs-resource-not-found.exception';

describe('AcbsPartyService', () => {
  const valueGenerator = new RandomValueGenerator();
  const idToken = valueGenerator.string();
  const baseUrl = valueGenerator.string();

  let httpService: HttpService;
  let service: AcbsPartyService;

  beforeEach(() => {
    httpService = new HttpService();
    service = new AcbsPartyService({ baseUrl }, httpService);
  });

  describe('getPartyByIdentifier', () => {
    const partyIdentifier = valueGenerator.stringOfNumericCharacters();

    it('returns the party if ACBS responds with the party', async () => {
      const { partiesInAcbs } = new PartyGenerator(valueGenerator).generate({ numberToGenerate: 1 });
      const partyInAcbs = partiesInAcbs[0];

      // eslint-disable-next-line jest/unbound-method
      when(httpService.get)
        .calledWith(`/Party/${partyIdentifier}`, {
          baseURL: baseUrl,
          headers: { Authorization: `Bearer ${idToken}` },
        })
        .mockReturnValueOnce(
          of({
            data: partyInAcbs,
            status: 200,
            statusText: 'OK',
            config: undefined,
            headers: undefined,
          }),
        );

      const party = await service.getPartyByIdentifier(partyIdentifier, idToken);

      expect(party).toStrictEqual(partyInAcbs);
    });

    it('throws an AcbsException if the request to ACBS fails', async () => {
      const getPartyByIdentifierError = new AxiosError();
      // eslint-disable-next-line jest/unbound-method
      when(httpService.get)
        .calledWith(`/Party/${partyIdentifier}`, {
          baseURL: baseUrl,
          headers: { Authorization: `Bearer ${idToken}` },
        })
        .mockReturnValueOnce(throwError(() => getPartyByIdentifierError));

      const getExternalRatingsPromise = service.getPartyByIdentifier(partyIdentifier, idToken);

      await expect(getExternalRatingsPromise).rejects.toBeInstanceOf(AcbsException);
      await expect(getExternalRatingsPromise).rejects.toThrow(`Failed to get the party with identifier ${partyIdentifier}.`);
      await expect(getExternalRatingsPromise).rejects.toHaveProperty('innerError', getPartyByIdentifierError);
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
        .calledWith(`/Party/${partyIdentifier}`, {
          baseURL: baseUrl,
          headers: { Authorization: `Bearer ${idToken}` },
        })
        .mockReturnValueOnce(throwError(() => axiosError));

      const getExternalRatingsPromise = service.getPartyByIdentifier(partyIdentifier, idToken);

      await expect(getExternalRatingsPromise).rejects.toBeInstanceOf(AcbsResourceNotFoundException);
      await expect(getExternalRatingsPromise).rejects.toThrow(`Party with identifier ${partyIdentifier} was not found by ACBS.`);
      await expect(getExternalRatingsPromise).rejects.toHaveProperty('innerError', axiosError);
    });

    it('throws an AcbsException if ACBS responds with a 400 response that is a string that does NOT contain "Party not found"', async () => {
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
        .calledWith(`/Party/${partyIdentifier}`, {
          baseURL: baseUrl,
          headers: { Authorization: `Bearer ${idToken}` },
        })
        .mockReturnValueOnce(throwError(() => axiosError));

      const getExternalRatingsPromise = service.getPartyByIdentifier(partyIdentifier, idToken);

      await expect(getExternalRatingsPromise).rejects.toBeInstanceOf(AcbsException);
      await expect(getExternalRatingsPromise).rejects.toThrow(`Failed to get the party with identifier ${partyIdentifier}.`);
      await expect(getExternalRatingsPromise).rejects.toHaveProperty('innerError', axiosError);
    });

    it('throws an AcbsException if ACBS responds with a 400 response that is NOT a string', async () => {
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
        .calledWith(`/Party/${partyIdentifier}`, {
          baseURL: baseUrl,
          headers: { Authorization: `Bearer ${idToken}` },
        })
        .mockReturnValueOnce(throwError(() => axiosError));

      const getExternalRatingsPromise = service.getPartyByIdentifier(partyIdentifier, idToken);

      await expect(getExternalRatingsPromise).rejects.toBeInstanceOf(AcbsException);
      await expect(getExternalRatingsPromise).rejects.toThrow(`Failed to get the party with identifier ${partyIdentifier}.`);
      await expect(getExternalRatingsPromise).rejects.toHaveProperty('innerError', axiosError);
    });
  });
});
