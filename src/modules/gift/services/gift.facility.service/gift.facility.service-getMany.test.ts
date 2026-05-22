import { HttpStatus, NotFoundException } from '@nestjs/common';
import { EXAMPLES } from '@ukef/constants';
import { mockGiftFacilityCreationErrorService } from '@ukef-test/gift/mock-services';
import { mockResponse200 } from '@ukef-test/http-response';
import { PinoLogger } from 'nestjs-pino';

import {
  GiftAccrualScheduleService,
  GiftBusinessCalendarsConventionService,
  GiftBusinessCalendarService,
  GiftCounterpartyService,
  GiftCurrencyService,
  GiftFacilityAsyncValidationService,
  GiftFacilityCreationErrorService,
  GiftFeeTypeService,
  GiftFixedFeeService,
  GiftObligationService,
  GiftProductTypeService,
  GiftRepaymentProfileService,
  GiftRiskDetailsService,
  GiftStatusService,
} from '../';
import { GiftFacilityService } from './';

const {
  GIFT: { FACILITY_RESPONSE_DATA, FACILITY_ID: mockFacilityId, FACILITY_ID_2, FACILITY_ID_3 },
} = EXAMPLES;

const mockFacilityIds = [mockFacilityId, FACILITY_ID_2, FACILITY_ID_3];

const mockResponseGet1 = mockResponse200(FACILITY_RESPONSE_DATA);
const mockResponseGet2 = mockResponse200({ ...FACILITY_RESPONSE_DATA, facilityId: FACILITY_ID_2 });
const mockResponseGet3 = mockResponse200({ ...FACILITY_RESPONSE_DATA, facilityId: FACILITY_ID_3 });

describe('GiftFacilityService.getMany', () => {
  const logger = new PinoLogger({});

  let asyncValidationService: GiftFacilityAsyncValidationService;
  let accrualScheduleService: GiftAccrualScheduleService;
  let businessCalendarService: GiftBusinessCalendarService;
  let businessCalendarsConventionService: GiftBusinessCalendarsConventionService;
  let counterpartyService: GiftCounterpartyService;
  let fixedFeeService: GiftFixedFeeService;
  let obligationService: GiftObligationService;
  let repaymentProfileService: GiftRepaymentProfileService;
  let riskDetailsService: GiftRiskDetailsService;
  let statusService: GiftStatusService;
  let creationErrorService: GiftFacilityCreationErrorService;
  let service: GiftFacilityService;

  let giftHttpService;
  let mockGet: jest.Mock;

  beforeEach(() => {
    mockGet = jest.fn().mockResolvedValueOnce(mockResponseGet1).mockResolvedValueOnce(mockResponseGet2).mockResolvedValueOnce(mockResponseGet3);

    giftHttpService = {
      get: mockGet,
    };

    const counterpartyService = new GiftCounterpartyService(giftHttpService, logger);
    const currencyService = new GiftCurrencyService(giftHttpService, logger);
    const feeTypeService = new GiftFeeTypeService(giftHttpService, logger);
    const mdmService = {};
    const productTypeService = new GiftProductTypeService(giftHttpService, logger);

    asyncValidationService = new GiftFacilityAsyncValidationService(
      logger,
      counterpartyService,
      currencyService,
      feeTypeService,
      mdmService as any,
      productTypeService,
    );

    accrualScheduleService = new GiftAccrualScheduleService(giftHttpService, logger);
    businessCalendarService = new GiftBusinessCalendarService(giftHttpService, logger);
    businessCalendarsConventionService = new GiftBusinessCalendarsConventionService(giftHttpService, logger);
    fixedFeeService = new GiftFixedFeeService(giftHttpService, logger);
    obligationService = new GiftObligationService(giftHttpService, logger);
    repaymentProfileService = new GiftRepaymentProfileService(giftHttpService, logger);
    riskDetailsService = new GiftRiskDetailsService(giftHttpService, logger);
    statusService = new GiftStatusService(giftHttpService, logger);
    creationErrorService = mockGiftFacilityCreationErrorService();

    service = new GiftFacilityService(
      giftHttpService,
      logger,
      asyncValidationService,
      accrualScheduleService,
      businessCalendarService,
      businessCalendarsConventionService,
      counterpartyService,
      fixedFeeService,
      obligationService,
      repaymentProfileService,
      riskDetailsService,
      statusService,
      creationErrorService,
    );

    service.get = mockGet;
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  it('should call service.get for each facilityId and return all responses', async () => {
    // Act
    await service.getMany(mockFacilityIds);

    // Assert
    expect(mockGet).toHaveBeenCalledTimes(3);

    expect(mockGet).toHaveBeenCalledWith(mockFacilityId);
    expect(mockGet).toHaveBeenCalledWith(FACILITY_ID_2);
    expect(mockGet).toHaveBeenCalledWith(FACILITY_ID_3);
  });

  describe('when giftHttpService.get is successful', () => {
    it('should return data from the responses of service.get', async () => {
      // Act
      const response = await service.getMany(mockFacilityIds);

      // Assert
      const expected = [mockResponseGet1.data, mockResponseGet2.data, mockResponseGet3.data];

      expect(response).toEqual(expected);
    });

    describe(`when all facilities return ${HttpStatus.NOT_FOUND}`, () => {
      beforeEach(() => {
        mockGet = jest
          .fn()
          .mockResolvedValueOnce(mockResponse200({ statusCode: HttpStatus.NOT_FOUND }))
          .mockResolvedValueOnce(mockResponse200({ statusCode: HttpStatus.NOT_FOUND }))
          .mockResolvedValueOnce(mockResponse200({ statusCode: HttpStatus.NOT_FOUND }));

        service.get = mockGet;
      });

      it('should throw a NotFoundException with the facility IDs', async () => {
        // Act
        const promise = service.getMany(mockFacilityIds);

        // Assert
        await expect(promise).rejects.toThrow(NotFoundException);

        await expect(promise).rejects.toThrow(`No GIFT facilities found for IDs ${mockFacilityIds}`);
      });
    });

    describe(`when at least one facility does not return ${HttpStatus.NOT_FOUND}`, () => {
      beforeEach(() => {
        mockGet = jest
          .fn()
          .mockResolvedValueOnce(mockResponse200({ statusCode: HttpStatus.NOT_FOUND }))
          .mockResolvedValueOnce(mockResponse200({ statusCode: HttpStatus.OK }))
          .mockResolvedValueOnce(mockResponse200({ statusCode: HttpStatus.NOT_FOUND }));

        service.get = mockGet;
      });

      it('should return mapped responses', async () => {
        // Act
        const response = await service.getMany(mockFacilityIds);

        // Assert
        expect(response).toEqual([{ statusCode: HttpStatus.NOT_FOUND }, { statusCode: HttpStatus.OK }, { statusCode: HttpStatus.NOT_FOUND }]);
      });
    });
  });

  describe('when service.get returns an error', () => {
    const mockError = new Error('Not Found');

    beforeEach(() => {
      // Arrange
      mockGet = jest.fn().mockRejectedValueOnce(mockError);
      giftHttpService.get = mockGet;

      service = new GiftFacilityService(
        giftHttpService,
        logger,
        asyncValidationService,
        accrualScheduleService,
        businessCalendarService,
        businessCalendarsConventionService,
        counterpartyService,
        fixedFeeService,
        obligationService,
        repaymentProfileService,
        riskDetailsService,
        statusService,
        creationErrorService,
      );
    });

    it('should throw an error', async () => {
      // Act
      const promise = service.getMany(mockFacilityIds);

      // Assert
      await expect(promise).rejects.toThrow(`Error getting multiple GIFT facilities ${mockFacilityIds}`);
    });
  });
});
