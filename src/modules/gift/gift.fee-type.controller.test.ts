import { GIFT } from '@ukef/constants';
import { GIFT_EXAMPLES } from '@ukef/constants/examples/gift.examples.constant';
import { mockResponse200 } from '@ukef-test/http-response';
import { PinoLogger } from 'nestjs-pino';

import { GiftFeeTypeController } from './gift.fee-type.controller';
import { GiftFeeTypeService } from './gift.fee-type.service';
import { GiftHttpService } from './gift-http.service';

const { PATH } = GIFT;

const mockResponseGet = mockResponse200(GIFT_EXAMPLES.FEE_TYPES_RESPONSE_DATA);

describe('GiftFeeTypeController', () => {
  const logger = new PinoLogger({});

  let giftHttpService: GiftHttpService;
  let feeTypeService: GiftFeeTypeService;
  let controller: GiftFeeTypeController;

  let mockRes;
  let mockResStatus;
  let mockResSend;

  let mockServiceGetSupportedFeeTypes;

  beforeEach(() => {
    // Arrange
    giftHttpService = new GiftHttpService(logger);

    feeTypeService = new GiftFeeTypeService(giftHttpService, logger);

    mockResSend = jest.fn();

    mockRes = {
      send: mockResSend,
    };

    mockResStatus = jest.fn(() => mockRes);

    mockRes.status = mockResStatus;

    mockServiceGetSupportedFeeTypes = jest.fn().mockResolvedValueOnce(mockResponseGet);

    feeTypeService.getSupportedFeeTypes = mockServiceGetSupportedFeeTypes;

    controller = new GiftFeeTypeController(feeTypeService);
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe(`GET ${PATH.SUPPORTED}`, () => {
    it('should call giftFeeTypeService.getSupportedFeeTypes', async () => {
      // Act
      await controller.get(mockRes);

      // Assert
      expect(mockServiceGetSupportedFeeTypes).toHaveBeenCalledTimes(1);
    });

    it('should call res.status with a status', async () => {
      // Act
      await controller.get(mockRes);

      // Assert
      expect(mockResStatus).toHaveBeenCalledTimes(1);

      expect(mockResStatus).toHaveBeenCalledWith(mockResponseGet.status);
    });

    it('should call res.status.send with data obtained from the service call', async () => {
      // Act
      await controller.get(mockRes);

      // Assert
      expect(mockResSend).toHaveBeenCalledTimes(1);

      expect(mockResSend).toHaveBeenCalledWith(mockResponseGet.data);
    });
  });
});
