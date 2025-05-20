import { HttpService } from '@nestjs/axios';
import { EXAMPLES, GIFT } from '@ukef/constants';
import { mockResponse200, mockResponse500 } from '@ukef-test/http-response';
import { PinoLogger } from 'nestjs-pino';

import { GiftCounterpartyService } from './gift.counterparty.service';
import { GiftFacilityService } from './gift.facility.service';
import { GiftFixedFeeService } from './gift.fixed-fee.service';
import { GiftObligationService } from './gift.obligation.service';
import { GiftRepaymentProfileService } from './gift.repayment-profile.service';
import { GiftStatusService } from './gift.status.service';

const {
  GIFT: { FACILITY_RESPONSE_DATA, FACILITY_ID: mockFacilityId },
} = EXAMPLES;

const { PATH } = GIFT;

const mockResponseGet = mockResponse200(FACILITY_RESPONSE_DATA);

describe('GiftFacilityService.get', () => {
  const logger = new PinoLogger({});

  let httpService: HttpService;
  let counterpartyService: GiftCounterpartyService;
  let fixedFeeService: GiftFixedFeeService;
  let obligationService: GiftObligationService;
  let repaymentProfileService: GiftRepaymentProfileService;
  let statusService: GiftStatusService;
  let service: GiftFacilityService;

  let giftHttpService;
  let mockHttpServiceGet: jest.Mock;

  beforeEach(() => {
    // Arrange
    httpService = new HttpService();

    mockHttpServiceGet = jest.fn().mockResolvedValueOnce(mockResponseGet);

    httpService.get = mockHttpServiceGet;

    giftHttpService = {
      get: mockHttpServiceGet,
    };

    counterpartyService = new GiftCounterpartyService(giftHttpService, logger);
    fixedFeeService = new GiftFixedFeeService(giftHttpService, logger);
    obligationService = new GiftObligationService(giftHttpService, logger);
    repaymentProfileService = new GiftRepaymentProfileService(giftHttpService, logger);
    statusService = new GiftStatusService(giftHttpService, logger);

    service = new GiftFacilityService(giftHttpService, logger, counterpartyService, fixedFeeService, obligationService, repaymentProfileService, statusService);
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  it('should call giftHttpService.get', async () => {
    // Act
    await service.getFacility(mockFacilityId);

    // Assert
    expect(mockHttpServiceGet).toHaveBeenCalledTimes(1);

    expect(mockHttpServiceGet).toHaveBeenCalledWith({
      path: `${PATH.FACILITY}/${mockFacilityId}`,
    });
  });

  describe('when giftHttpService.get is successful', () => {
    it('should return the response of giftHttpService.get', async () => {
      // Act
      const response = await service.getFacility(mockFacilityId);

      // Assert
      expect(response).toEqual(mockResponseGet);
    });
  });

  describe('when giftHttpService.get returns an error', () => {
    beforeEach(() => {
      // Arrange
      mockHttpServiceGet = jest.fn().mockRejectedValueOnce(mockResponse500());

      httpService.get = mockHttpServiceGet;

      giftHttpService.get = mockHttpServiceGet;

      service = new GiftFacilityService(
        giftHttpService,
        logger,
        counterpartyService,
        fixedFeeService,
        obligationService,
        repaymentProfileService,
        statusService,
      );
    });

    it('should thrown an error', async () => {
      // Act
      const promise = service.getFacility(mockFacilityId);

      // Assert
      const expected = new Error('Error calling GIFT HTTP service GET method');

      await expect(promise).rejects.toThrow(expected);
    });
  });
});
