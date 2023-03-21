import { HttpService } from '@nestjs/axios';
import { DealInvestorGenerator } from '@ukef-test/support/generator/deal-investor-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { AxiosError } from 'axios';
import { when } from 'jest-when';
import { of, throwError } from 'rxjs';

import { AcbsDealPartyService } from './acbs-deal-party.service';
import { AcbsException } from './exception/acbs.exception';

describe('AcbsDealPartyService', () => {
  const valueGenerator = new RandomValueGenerator();
  const authToken = valueGenerator.string();
  const baseUrl = valueGenerator.string();

  let httpService: HttpService;
  let service: AcbsDealPartyService;

  let httpServiceGet: jest.Mock;

  beforeEach(() => {
    httpService = new HttpService();

    httpServiceGet = jest.fn();
    httpService.get = httpServiceGet;

    service = new AcbsDealPartyService({ baseUrl }, httpService);
  });

  describe('getDealPartyForDeal', () => {
    const dealIdentifier = valueGenerator.ukefId();
    const portfolioIdentifier = valueGenerator.string();
    const acbsDealPartyURL = `/Portfolio/${portfolioIdentifier}/Deal/${dealIdentifier}/DealParty`;

    it('throws an AcbsException if the request to ACBS fails', async () => {
      const getDealPartyForDealError = new AxiosError();
      when(httpServiceGet)
        .calledWith(`/Portfolio/${portfolioIdentifier}/Deal/${dealIdentifier}/DealParty`, {
          baseURL: baseUrl,
          headers: { Authorization: `Bearer ${authToken}` },
        })
        .mockReturnValueOnce(throwError(() => getDealPartyForDealError));

      const getDealPartyPromise = service.getDealPartiesForDeal(portfolioIdentifier, dealIdentifier, authToken);

      await expect(getDealPartyPromise).rejects.toBeInstanceOf(AcbsException);
      await expect(getDealPartyPromise).rejects.toThrow(`Failed to get the deal investors for the deal with id ${dealIdentifier}.`);
      await expect(getDealPartyPromise).rejects.toHaveProperty('innerError', getDealPartyForDealError);
    });

    it('returns an empty array if ACBS responds with an empty array', async () => {
      when(httpServiceGet)
        .calledWith(acbsDealPartyURL, {
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

      const dealInvestors = await service.getDealPartiesForDeal(portfolioIdentifier, dealIdentifier, authToken);

      expect(dealInvestors).toStrictEqual([]);
    });

    it(`returns an "null" if ACBS responds with an "null" when Deal doesn't exist`, async () => {
      when(httpServiceGet)
        .calledWith(acbsDealPartyURL, {
          baseURL: baseUrl,
          headers: { Authorization: `Bearer ${authToken}` },
        })
        .mockReturnValueOnce(
          of({
            data: 'null',
            status: 200,
            statusText: 'OK',
            config: undefined,
            headers: undefined,
          }),
        );

      const dealInvestors = await service.getDealPartiesForDeal(portfolioIdentifier, dealIdentifier, authToken);

      expect(dealInvestors).toBe('null');
    });

    it('returns the deal investors for the deal if ACBS responds with same data', async () => {
      const { dealInvestorsInAcbs } = new DealInvestorGenerator(valueGenerator).generate({ portfolioIdentifier, dealIdentifier, numberToGenerate: 2 });

      when(httpServiceGet)
        .calledWith(acbsDealPartyURL, {
          baseURL: baseUrl,
          headers: { Authorization: `Bearer ${authToken}` },
        })
        .mockReturnValueOnce(
          of({
            data: dealInvestorsInAcbs,
            status: 200,
            statusText: 'OK',
            config: undefined,
            headers: undefined,
          }),
        );

      const dealInvestors = await service.getDealPartiesForDeal(portfolioIdentifier, dealIdentifier, authToken);

      expect(dealInvestors).toStrictEqual(dealInvestorsInAcbs);
    });
  });
});
