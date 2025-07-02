import { Injectable } from '@nestjs/common';
import { GIFT } from '@ukef/constants';
import { AxiosResponse } from 'axios';
import { PinoLogger } from 'nestjs-pino';

import { GiftHttpService } from './gift.http.service';

const { PATH } = GIFT;

/**
 * GIFT currency service.
 * This is responsible for all currency operations that call the GIFT API.
 */
@Injectable()
export class GiftCurrencyService {
  constructor(
    private readonly giftHttpService: GiftHttpService,
    private readonly logger: PinoLogger,
  ) {
    this.giftHttpService = giftHttpService;
  }

  /**
   * Get supported GIFT currencies
   * @returns {Promise<AxiosResponse>}
   * @throws {Error}
   */
  async getSupportedCurrencies(): Promise<AxiosResponse> {
    try {
      this.logger.info('Getting supported currencies');

      const response = await this.giftHttpService.get<string>({
        path: PATH.CURRENCY,
      });

      return response;
    } catch (error) {
      this.logger.error('Error getting supported currencies %o', error);

      throw new Error('Error getting supported currencies', error);
    }
  }
}
