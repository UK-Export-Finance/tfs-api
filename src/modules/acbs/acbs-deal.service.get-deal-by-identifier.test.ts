import { HttpService } from '@nestjs/axios';
import { TEST_CURRENCIES } from '@ukef-test/support/constants/test-currency.constant';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { AxiosError } from 'axios';
import { when } from 'jest-when';
import { of, throwError } from 'rxjs';

import { AcbsDealService } from './acbs-deal.service';
import { AcbsGetDealResponseDto } from './dto/acbs-get-deal-response.dto';
import { AcbsException } from './exception/acbs.exception';
import { AcbsResourceNotFoundException } from './exception/acbs-resource-not-found.exception';

describe('AcbsDealService', () => {
  const valueGenerator = new RandomValueGenerator();
  const idToken = valueGenerator.string();
  const baseUrl = valueGenerator.httpsUrl();
  const portfolioIdentifier = valueGenerator.string({ length: 2 });
  const dealIdentifier = valueGenerator.stringOfNumericCharacters({ length: 10 });

  let httpService: HttpService;
  let service: AcbsDealService;

  let httpServiceGet: jest.Mock;

  const expectedHttpServiceGetArgs = [
    `/Portfolio/${portfolioIdentifier}/Deal/${dealIdentifier}`,
    {
      baseURL: baseUrl,
      headers: { Authorization: `Bearer ${idToken}` },
    },
  ];

  beforeEach(() => {
    httpService = new HttpService();

    httpServiceGet = jest.fn();
    httpService.get = httpServiceGet;

    service = new AcbsDealService({ baseUrl }, httpService);
  });

  const dealInAcbs: AcbsGetDealResponseDto = {
    DealIdentifier: dealIdentifier,
    PortfolioIdentifier: portfolioIdentifier,
    Currency: {
      CurrencyCode: TEST_CURRENCIES.A_TEST_CURRENCY,
    },
    OriginalEffectiveDate: valueGenerator.dateTimeString(),
    MemoLimitAmount: valueGenerator.nonnegativeFloat(),
    IndustryClassification: {
      IndustryClassificationCode: valueGenerator.stringOfNumericCharacters({ length: 3 }),
    },
    BorrowerParty: {
      PartyName1: valueGenerator.string(),
      PartyIdentifier: valueGenerator.stringOfNumericCharacters({ length: 8 }),
    },
  };

  describe('getDealByIdentifier', () => {
    it('returns the deal from ACBS if ACBS responds with the deal', async () => {
      when(httpServiceGet)
        .calledWith(...expectedHttpServiceGetArgs)
        .mockReturnValueOnce(
          of({
            data: dealInAcbs,
            status: 200,
            statusText: 'Ok',
            config: undefined,
            headers: undefined,
          }),
        );

      const deal = await service.getDealByIdentifier(portfolioIdentifier, dealIdentifier, idToken);

      expect(deal).toBe(dealInAcbs);
    });

    it('throws an AcbsException if the request to ACBS fails', async () => {
      const getDealByIdentifierError = new AxiosError();
      when(httpServiceGet)
        .calledWith(...expectedHttpServiceGetArgs)
        .mockReturnValueOnce(throwError(() => getDealByIdentifierError));

      const getDealPromise = service.getDealByIdentifier(portfolioIdentifier, dealIdentifier, idToken);

      await expect(getDealPromise).rejects.toBeInstanceOf(AcbsException);
      await expect(getDealPromise).rejects.toThrow(`Failed to get the deal with identifier ${dealIdentifier}.`);
      await expect(getDealPromise).rejects.toHaveProperty('innerError', getDealByIdentifierError);
    });

    it(`throws an AcbsResourceNotFoundException if ACBS responds with a 200 response where the response body is 'null'`, async () => {
      when(httpServiceGet)
        .calledWith(...expectedHttpServiceGetArgs)
        .mockReturnValueOnce(
          of({
            data: null,
            status: 200,
            statusText: 'Ok',
            config: undefined,
            headers: undefined,
          }),
        );

      const getDealPromise = service.getDealByIdentifier(portfolioIdentifier, dealIdentifier, idToken);

      await expect(getDealPromise).rejects.toBeInstanceOf(AcbsResourceNotFoundException);
      await expect(getDealPromise).rejects.toThrow(`Deal with identifier ${dealIdentifier} was not found by ACBS.`);
    });
  });
});
