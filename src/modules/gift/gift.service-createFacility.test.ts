import { HttpService } from '@nestjs/axios';
import { HttpStatus } from '@nestjs/common';
import { EXAMPLES } from '@ukef/constants';
import { mockResponse201 } from '@ukef-test/http-response';

import { GiftCounterpartyService } from './gift.counterparty.service';
import { GiftObligationService } from './gift.obligation.service';
import { GiftRepaymentProfileService } from './gift.repayment-profile.service';
import { GiftService } from './gift.service';

const {
  GIFT: { COUNTERPARTY, FACILITY_RESPONSE_DATA, FACILITY_CREATION_PAYLOAD: mockPayload, OBLIGATION, REPAYMENT_PROFILE },
} = EXAMPLES;

const mockResponsePost = mockResponse201(EXAMPLES.GIFT.FACILITY_RESPONSE_DATA);

const mockCounterparties = [COUNTERPARTY(), COUNTERPARTY(), COUNTERPARTY()];
const mockObligations = [OBLIGATION(), OBLIGATION(), OBLIGATION()];
const mockRepaymentProfiles = [REPAYMENT_PROFILE(), REPAYMENT_PROFILE(), REPAYMENT_PROFILE()];

const mockCreateCounterpartiesResponse = mockCounterparties.map((counterparty) => mockResponse201(counterparty));
const mockCreateObligationsResponse = mockObligations.map((counterparty) => mockResponse201(counterparty));
const mockRepaymentProfilesResponse = mockRepaymentProfiles.map((repaymentProfile) => mockResponse201(repaymentProfile));

describe('GiftService.createFacility', () => {
  let httpService: HttpService;
  let counterpartyService: GiftCounterpartyService;
  let obligationService: GiftObligationService;
  let repaymentProfileService: GiftRepaymentProfileService;
  let service: GiftService;

  let giftHttpService;
  let mockHttpServicePost: jest.Mock;
  let createInitialFacilitySpy: jest.Mock;
  let createObligationsSpy: jest.Mock;
  let createCounterpartiesSpy: jest.Mock;
  let createRepaymentProfilesSpy: jest.Mock;

  beforeEach(() => {
    // Arrange
    httpService = new HttpService();

    mockHttpServicePost = jest.fn().mockResolvedValueOnce(mockResponsePost);

    httpService.post = mockHttpServicePost;

    giftHttpService = {
      post: mockHttpServicePost,
    };

    counterpartyService = new GiftCounterpartyService(giftHttpService);
    obligationService = new GiftObligationService(giftHttpService);
    repaymentProfileService = new GiftRepaymentProfileService(giftHttpService);

    createInitialFacilitySpy = jest.fn().mockResolvedValueOnce(mockResponse201(FACILITY_RESPONSE_DATA));
    createCounterpartiesSpy = jest.fn().mockResolvedValueOnce(mockCreateCounterpartiesResponse);
    createObligationsSpy = jest.fn().mockResolvedValueOnce(mockCreateObligationsResponse);
    createRepaymentProfilesSpy = jest.fn().mockResolvedValueOnce(mockRepaymentProfilesResponse);

    counterpartyService.createMany = createCounterpartiesSpy;
    obligationService.createMany = createObligationsSpy;
    repaymentProfileService.createMany = createRepaymentProfilesSpy;

    service = new GiftService(giftHttpService, counterpartyService, obligationService, repaymentProfileService);

    service.createInitialFacility = createInitialFacilitySpy;
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  it('should call service.createInitialFacility', async () => {
    // Act
    await service.createFacility(mockPayload);

    // Assert
    expect(createInitialFacilitySpy).toHaveBeenCalledTimes(1);

    expect(createInitialFacilitySpy).toHaveBeenCalledWith(mockPayload.overview);
  });

  it('should call counterpartyService.createMany', async () => {
    // Act
    await service.createFacility(mockPayload);

    // Assert
    expect(createCounterpartiesSpy).toHaveBeenCalledTimes(1);

    expect(createCounterpartiesSpy).toHaveBeenCalledWith(mockPayload.counterparties, FACILITY_RESPONSE_DATA.workPackageId);
  });

  it('should call obligationService.createMany', async () => {
    // Act
    await service.createFacility(mockPayload);

    // Assert
    expect(createObligationsSpy).toHaveBeenCalledTimes(1);

    expect(createObligationsSpy).toHaveBeenCalledWith(mockPayload.obligations, FACILITY_RESPONSE_DATA.workPackageId);
  });

  it('should call giftRepaymentProfileService.createMany', async () => {
    // Act
    await service.createFacility(mockPayload);

    // Assert
    expect(createRepaymentProfilesSpy).toHaveBeenCalledTimes(1);

    expect(createRepaymentProfilesSpy).toHaveBeenCalledWith(mockPayload.repaymentProfiles, FACILITY_RESPONSE_DATA.workPackageId);
  });

  describe('when all calls are successful', () => {
    it('should return a response object', async () => {
      // Act
      const response = await service.createFacility(mockPayload);

      // Assert
      const expected = {
        status: HttpStatus.CREATED,
        data: {
          ...FACILITY_RESPONSE_DATA,
          counterparties: mockCounterparties,
          obligations: mockObligations,
          repaymentProfiles: mockRepaymentProfiles,
        },
      };

      expect(response).toEqual(expected);
    });
  });
});
