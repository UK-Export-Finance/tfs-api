import { GIFT } from '@ukef/constants';
import { GIFT_EXAMPLES } from '@ukef/constants/examples/gift.examples.constant';
import { mockResponse200 } from '@ukef-test/http-response';
import { PinoLogger } from 'nestjs-pino';

import { GiftCurrencyService, GiftHttpService } from '../services';
import { GiftCurrencyController } from './gift.currency.controller';

const { PATH } = GIFT;

const mockResponseGet = mockResponse200(GIFT_EXAMPLES.CURRENCIES);

describe('GiftCurrencyController', () => {
  const logger = new PinoLogger({});

  let giftHttpService: GiftHttpService;
  let currencyService: GiftCurrencyService;
  let controller: GiftCurrencyController;

  let mockRes;
  let mockResStatus;
  let mockResSend;

  let mockServiceGetSupportedCurrencies;

  beforeEach(() => {
    // Arrange
    giftHttpService = new GiftHttpService(logger);

    currencyService = new GiftCurrencyService(giftHttpService, logger);

    mockResSend = jest.fn();

    mockRes = {
      send: mockResSend,
    };

    mockResStatus = jest.fn(() => mockRes);

    mockRes.status = mockResStatus;

    mockServiceGetSupportedCurrencies = jest.fn().mockResolvedValueOnce(mockResponseGet);

    currencyService.getSupportedCurrencies = mockServiceGetSupportedCurrencies;

    controller = new GiftCurrencyController(currencyService);
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe(`GET ${PATH.SUPPORTED}`, () => {
    it('should call giftCurrencyService.getSupportedCurrencies', async () => {
      // Act
      await controller.get(mockRes);

      // Assert
      expect(mockServiceGetSupportedCurrencies).toHaveBeenCalledTimes(1);
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
