import { HttpService } from '@nestjs/axios';
import { EXAMPLES, GIFT } from '@ukef/constants';
import { mockResponse200, mockResponse500 } from '@ukef-test/http-response';

import { GiftCounterpartyService } from './gift.counterparty.service';
import { GiftObligationService } from './gift.obligation.service';
import { GiftRepaymentProfileService } from './gift.repayment-profile.service';
import { GiftService } from './gift.service';

const {
  GIFT: { FACILITY_RESPONSE_DATA, FACILITY_ID: mockFacilityId },
} = EXAMPLES;

const { PATH } = GIFT;

const mockResponseGet = mockResponse200(FACILITY_RESPONSE_DATA);

describe('GiftService.getFacility', () => {
  let httpService: HttpService;
  let counterpartyService: GiftCounterpartyService;
  let obligationService: GiftObligationService;
  let repaymentProfileService: GiftRepaymentProfileService;
  let service: GiftService;

  let giftHttpService;
  let mockHttpServiceGet: jest.Mock;

  beforeEach(() => {
    httpService = new HttpService();

    mockHttpServiceGet = jest.fn().mockResolvedValueOnce(mockResponseGet);

    httpService.get = mockHttpServiceGet;

    giftHttpService = {
      get: mockHttpServiceGet,
    };

    counterpartyService = new GiftCounterpartyService(giftHttpService);
    obligationService = new GiftObligationService(giftHttpService);
    repaymentProfileService = new GiftRepaymentProfileService(giftHttpService);

    service = new GiftService(giftHttpService, counterpartyService, obligationService, repaymentProfileService);
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  it('should call giftHttpService.get', async () => {
    await service.getFacility(mockFacilityId);

    expect(mockHttpServiceGet).toHaveBeenCalledTimes(1);

    expect(mockHttpServiceGet).toHaveBeenCalledWith({
      path: `${PATH.FACILITY}/${mockFacilityId}`,
    });
  });

  describe('when giftHttpService.get is successful', () => {
    it('should return the response of giftHttpService.get', async () => {
      const response = await service.getFacility(mockFacilityId);

      expect(response).toEqual(mockResponseGet);
    });
  });

  describe('when giftHttpService.get returns an error', () => {
    beforeEach(() => {
      mockHttpServiceGet = jest.fn().mockRejectedValueOnce(mockResponse500());

      httpService.get = mockHttpServiceGet;

      giftHttpService.get = mockHttpServiceGet;

      service = new GiftService(giftHttpService, counterpartyService, obligationService, repaymentProfileService);
    });

    it('should thrown an error', async () => {
      const promise = service.getFacility(mockFacilityId);

      const expected = 'Error calling GIFT HTTP service GET method';

      await expect(promise).rejects.toThrow(expected);
    });
  });
});
