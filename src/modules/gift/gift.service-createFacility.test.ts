import { HttpService } from '@nestjs/axios';
import { HttpStatus } from '@nestjs/common';
import { EXAMPLES } from '@ukef/constants';
import { mockResponse200, mockResponse201 } from '@ukef-test/http-response';
import { PinoLogger } from 'nestjs-pino';

import { GiftCounterpartyService } from './gift.counterparty.service';
import { GiftFixedFeeService } from './gift.fixed-fee.service';
import { GiftObligationService } from './gift.obligation.service';
import { GiftRepaymentProfileService } from './gift.repayment-profile.service';
import { GiftService } from './gift.service';
import { GiftStatusService } from './gift.status.service';

const {
  GIFT: {
    COUNTERPARTY,
    FACILITY_ID: mockFacilityId,
    FACILITY_RESPONSE_DATA,
    FACILITY_CREATION_PAYLOAD: mockPayload,
    FIXED_FEE,
    OBLIGATION,
    REPAYMENT_PROFILE,
    WORK_PACKAGE_APPROVE_RESPONSE_DATA,
  },
} = EXAMPLES;

const mockResponsePost = mockResponse201(EXAMPLES.GIFT.FACILITY_RESPONSE_DATA);

const mockCounterparties = [COUNTERPARTY(), COUNTERPARTY(), COUNTERPARTY()];
const mockFixedFees = [FIXED_FEE(), FIXED_FEE()];
const mockObligations = [OBLIGATION(), OBLIGATION(), OBLIGATION()];
const mockRepaymentProfiles = [REPAYMENT_PROFILE(), REPAYMENT_PROFILE(), REPAYMENT_PROFILE()];

const mockCreateCounterpartiesResponse = mockCounterparties.map((counterparty) => mockResponse201({ data: counterparty }));
const mockCreateFixedFeesResponse = mockFixedFees.map((fixedFee) => mockResponse201({ data: fixedFee }));
const mockCreateObligationsResponse = mockObligations.map((obligation) => mockResponse201({ data: obligation }));
const mockRepaymentProfilesResponse = mockRepaymentProfiles.map((repaymentProfile) => mockResponse201({ data: repaymentProfile }));

describe('GiftService.createFacility', () => {
  const logger = new PinoLogger({});

  let httpService: HttpService;
  let counterpartyService: GiftCounterpartyService;
  let fixedFeeService: GiftFixedFeeService;
  let obligationService: GiftObligationService;
  let repaymentProfileService: GiftRepaymentProfileService;
  let statusService: GiftStatusService;
  let service: GiftService;

  let giftHttpService;
  let mockHttpServicePost: jest.Mock;
  let createInitialFacilitySpy: jest.Mock;
  let createCounterpartiesSpy: jest.Mock;
  let createFixedFeesSpy: jest.Mock;
  let createObligationsSpy: jest.Mock;
  let createRepaymentProfilesSpy: jest.Mock;
  let approvedStatusSpy: jest.Mock;

  beforeEach(() => {
    // Arrange
    httpService = new HttpService();

    mockHttpServicePost = jest.fn().mockResolvedValueOnce(mockResponsePost);

    httpService.post = mockHttpServicePost;

    giftHttpService = {
      post: mockHttpServicePost,
    };

    counterpartyService = new GiftCounterpartyService(giftHttpService, logger);
    fixedFeeService = new GiftFixedFeeService(giftHttpService, logger);
    obligationService = new GiftObligationService(giftHttpService, logger);
    repaymentProfileService = new GiftRepaymentProfileService(giftHttpService, logger);
    statusService = new GiftStatusService(giftHttpService, logger);

    createInitialFacilitySpy = jest.fn().mockResolvedValueOnce(mockResponse201(FACILITY_RESPONSE_DATA));
    createCounterpartiesSpy = jest.fn().mockResolvedValueOnce(mockCreateCounterpartiesResponse);
    createFixedFeesSpy = jest.fn().mockResolvedValueOnce(mockCreateFixedFeesResponse);
    createObligationsSpy = jest.fn().mockResolvedValueOnce(mockCreateObligationsResponse);
    createRepaymentProfilesSpy = jest.fn().mockResolvedValueOnce(mockRepaymentProfilesResponse);
    approvedStatusSpy = jest.fn().mockResolvedValueOnce(mockResponse200(WORK_PACKAGE_APPROVE_RESPONSE_DATA));

    counterpartyService.createMany = createCounterpartiesSpy;
    fixedFeeService.createMany = createFixedFeesSpy;
    obligationService.createMany = createObligationsSpy;
    repaymentProfileService.createMany = createRepaymentProfilesSpy;
    statusService.approved = approvedStatusSpy;

    service = new GiftService(giftHttpService, logger, counterpartyService, fixedFeeService, obligationService, repaymentProfileService, statusService);

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

    expect(createCounterpartiesSpy).toHaveBeenCalledWith(mockPayload.counterparties, mockFacilityId, FACILITY_RESPONSE_DATA.workPackageId);
  });

  it('should call fixedFeeService.createMany', async () => {
    // Act
    await service.createFacility(mockPayload);

    // Assert
    expect(createFixedFeesSpy).toHaveBeenCalledTimes(1);

    expect(createFixedFeesSpy).toHaveBeenCalledWith(mockPayload.fixedFees, mockFacilityId, FACILITY_RESPONSE_DATA.workPackageId);
  });

  it('should call obligationService.createMany', async () => {
    // Act
    await service.createFacility(mockPayload);

    // Assert
    expect(createObligationsSpy).toHaveBeenCalledTimes(1);

    expect(createObligationsSpy).toHaveBeenCalledWith(mockPayload.obligations, mockFacilityId, FACILITY_RESPONSE_DATA.workPackageId);
  });

  it('should call giftRepaymentProfileService.createMany', async () => {
    // Act
    await service.createFacility(mockPayload);

    // Assert
    expect(createRepaymentProfilesSpy).toHaveBeenCalledTimes(1);

    expect(createRepaymentProfilesSpy).toHaveBeenCalledWith(mockPayload.repaymentProfiles, mockFacilityId, FACILITY_RESPONSE_DATA.workPackageId);
  });

  it('should call giftStatusService.approved', async () => {
    // Act
    await service.createFacility(mockPayload);

    // Assert
    expect(approvedStatusSpy).toHaveBeenCalledTimes(1);

    expect(approvedStatusSpy).toHaveBeenCalledWith(mockFacilityId, FACILITY_RESPONSE_DATA.workPackageId);
  });

  describe('when all calls are successful', () => {
    it('should return a response object', async () => {
      // Act
      const response = await service.createFacility(mockPayload);

      // Assert
      const expected = {
        status: HttpStatus.CREATED,
        data: {
          ...FACILITY_RESPONSE_DATA.configurationEvent.data,
          state: WORK_PACKAGE_APPROVE_RESPONSE_DATA.state,
          counterparties: mockCounterparties,
          fixedFees: mockFixedFees,
          obligations: mockObligations,
          repaymentProfiles: mockRepaymentProfiles,
        },
      };

      expect(response).toEqual(expected);
    });
  });
});
