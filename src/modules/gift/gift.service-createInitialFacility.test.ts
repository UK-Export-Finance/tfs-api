import { HttpService } from '@nestjs/axios';
import { EXAMPLES, GIFT } from '@ukef/constants';
import { mockResponse201, mockResponse500 } from '@ukef-test/http-response';

import { GiftCounterpartyService } from './gift.counterparty.service';
import { GiftFixedFeeService } from './gift.fixed-fee.service';
import { GiftObligationService } from './gift.obligation.service';
import { GiftRepaymentProfileService } from './gift.repayment-profile.service';
import { GiftService } from './gift.service';

const {
  GIFT: { FACILITY_CREATION_PAYLOAD: mockPayload },
} = EXAMPLES;

const { EVENT_TYPES, PATH } = GIFT;

const mockResponsePost = mockResponse201(EXAMPLES.GIFT.FACILITY_RESPONSE_DATA);

describe('GiftService.createInitialFacility', () => {
  let httpService: HttpService;
  let counterpartyService: GiftCounterpartyService;
  let fixedFeeService: GiftFixedFeeService;
  let obligationService: GiftObligationService;
  let repaymentProfileService: GiftRepaymentProfileService;
  let service: GiftService;

  let giftHttpService;
  let mockHttpServicePost: jest.Mock;

  beforeEach(() => {
    // Arrange
    httpService = new HttpService();

    mockHttpServicePost = jest.fn().mockResolvedValueOnce(mockResponsePost);

    httpService.post = mockHttpServicePost;

    giftHttpService = {
      post: mockHttpServicePost,
    };

    counterpartyService = new GiftCounterpartyService(giftHttpService);
    fixedFeeService = new GiftFixedFeeService(giftHttpService);
    obligationService = new GiftObligationService(giftHttpService);
    repaymentProfileService = new GiftRepaymentProfileService(giftHttpService);

    service = new GiftService(giftHttpService, counterpartyService, fixedFeeService, obligationService, repaymentProfileService);
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  it('should call giftHttpService.post', async () => {
    // Act
    await service.createInitialFacility(mockPayload.overview);

    // Assert
    expect(mockHttpServicePost).toHaveBeenCalledTimes(1);

    expect(mockHttpServicePost).toHaveBeenCalledWith({
      path: PATH.FACILITY,
      payload: {
        eventType: EVENT_TYPES.CREATE_FACILITY,
        eventData: mockPayload.overview,
      },
    });
  });

  describe('when giftHttpService.post is successful', () => {
    it('should return the response of giftHttpService.post', async () => {
      // Act
      const response = await service.createInitialFacility(mockPayload.overview);

      // Assert
      expect(response).toEqual(mockResponsePost);
    });
  });

  describe('when giftHttpService.post returns an error', () => {
    beforeEach(() => {
      // Arrange
      mockHttpServicePost = jest.fn().mockRejectedValueOnce(mockResponse500());

      httpService.post = mockHttpServicePost;

      giftHttpService.post = mockHttpServicePost;

      service = new GiftService(giftHttpService, counterpartyService, fixedFeeService, obligationService, repaymentProfileService);
    });

    it('should thrown an error', async () => {
      // Act
      const promise = service.createInitialFacility(mockPayload.overview);

      // Assert
      const expected = new Error('Error creating initial GIFT facility');

      await expect(promise).rejects.toThrow(expected);
    });
  });
});
