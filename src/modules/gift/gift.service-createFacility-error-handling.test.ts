import { HttpService } from '@nestjs/axios';
import { HttpStatus } from '@nestjs/common';
import { EXAMPLES } from '@ukef/constants';
import { mockAxiosError, mockResponse201 } from '@ukef-test/http-response';

import { GiftCounterpartyService } from './gift.counterparty.service';
import { GiftRepaymentProfileService } from './gift.repayment-profile.service';
import { GiftService } from './gift.service';

const {
  GIFT: { COUNTERPARTY, FACILITY_RESPONSE_DATA, FACILITY_CREATION_PAYLOAD: mockPayload, REPAYMENT_PROFILE },
} = EXAMPLES;

const mockResponsePost = mockResponse201(EXAMPLES.GIFT.FACILITY_RESPONSE_DATA);

const mockCounterparties = [COUNTERPARTY(), COUNTERPARTY(), COUNTERPARTY()];
const mockRepaymentProfiles = [REPAYMENT_PROFILE(), REPAYMENT_PROFILE(), REPAYMENT_PROFILE()];

const mockCreateCounterpartiesResponse = mockCounterparties.map((counterparty) => mockResponse201(counterparty));

const mockRepaymentProfilesResponse = mockRepaymentProfiles.map((repaymentProfile) => mockResponse201(repaymentProfile));

describe('GiftService.createFacility - error handling', () => {
  let httpService: HttpService;
  let counterpartyService: GiftCounterpartyService;
  let repaymentProfileService: GiftRepaymentProfileService;
  let service: GiftService;

  let giftHttpService;
  let mockHttpServicePost: jest.Mock;
  let createInitialFacilitySpy: jest.Mock;
  let createCounterpartiesSpy: jest.Mock;
  let createRepaymentProfilesSpy: jest.Mock;

  beforeEach(() => {
    httpService = new HttpService();

    mockHttpServicePost = jest.fn().mockResolvedValueOnce(mockResponsePost);

    httpService.post = mockHttpServicePost;

    giftHttpService = {
      post: mockHttpServicePost,
    };

    counterpartyService = new GiftCounterpartyService(giftHttpService);
    repaymentProfileService = new GiftRepaymentProfileService(giftHttpService);

    createInitialFacilitySpy = jest.fn().mockResolvedValueOnce(mockResponse201(FACILITY_RESPONSE_DATA));
    createCounterpartiesSpy = jest.fn().mockResolvedValueOnce(mockCreateCounterpartiesResponse);
    createRepaymentProfilesSpy = jest.fn().mockResolvedValueOnce(mockRepaymentProfilesResponse);

    counterpartyService.createMany = createCounterpartiesSpy;
    repaymentProfileService.createMany = createRepaymentProfilesSpy;

    service = new GiftService(giftHttpService, counterpartyService, repaymentProfileService);

    service.createInitialFacility = createInitialFacilitySpy;
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe('when counterpartyService.createInitialFacility throws an error', () => {
    const mockAxiosErrorStatus = HttpStatus.BAD_REQUEST;

    const mockAxiosErrorData = {
      validationErrors: [{ mock: true }],
    };

    beforeEach(() => {
      createInitialFacilitySpy = jest.fn().mockRejectedValueOnce(mockAxiosError({ data: mockAxiosErrorData, status: mockAxiosErrorStatus }));

      service = new GiftService(giftHttpService, counterpartyService, repaymentProfileService);

      service.createInitialFacility = createInitialFacilitySpy;
    });

    it('should throw an error', async () => {
      const response = service.createFacility(mockPayload);

      const expected = 'Error creating GIFT facility';

      await expect(response).rejects.toThrow(expected);
    });
  });

  describe('when counterpartyService.createMany throws an error', () => {
    const mockAxiosErrorStatus = HttpStatus.BAD_REQUEST;

    const mockAxiosErrorData = {
      validationErrors: [{ mock: true }],
    };

    beforeEach(() => {
      createCounterpartiesSpy = jest.fn().mockRejectedValueOnce(mockAxiosError({ data: mockAxiosErrorData, status: mockAxiosErrorStatus }));

      counterpartyService.createMany = createCounterpartiesSpy;

      service = new GiftService(giftHttpService, counterpartyService, repaymentProfileService);

      service.createInitialFacility = jest.fn().mockResolvedValueOnce(mockResponse201(FACILITY_RESPONSE_DATA));
    });

    it('should throw an error', async () => {
      const response = service.createFacility(mockPayload);

      const expected = 'Error creating GIFT facility';

      await expect(response).rejects.toThrow(expected);
    });
  });
});
