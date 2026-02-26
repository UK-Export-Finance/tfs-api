import { GiftFacilityCreationErrorService } from '@ukef/modules/gift/services';
import { mockResponse204 } from '@ukef-test/http-response';
import { PinoLogger } from 'nestjs-pino';

/**
 * Mock GiftFacilityCreationErrorService service.
 * Used for unit testing purposes only.
 * This avoids repeating the same code in individual tests.
 * @returns {GiftFacilityCreationErrorService}
 */
export const mockFacilityCreationErrorService = () => {
  let giftHttpService;
  const logger = new PinoLogger({});

  const creationErrorService = new GiftFacilityCreationErrorService(giftHttpService, logger);

  creationErrorService.finallyHandler = jest.fn().mockResolvedValueOnce(mockResponse204());

  return creationErrorService;
};
