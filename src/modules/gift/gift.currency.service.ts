import { Injectable } from '@nestjs/common';
import { GIFT } from '@ukef/constants';
import { AxiosResponse } from 'axios';

import { GiftHttpService } from './gift-http.service';

const { PATH } = GIFT;

/**
 * GIFT currency service.
 * This is responsible for all currency operations that call the GIFT API.
 */
@Injectable()
export class GiftCurrencyService {
  constructor(private readonly giftHttpService: GiftHttpService) {
    this.giftHttpService = giftHttpService;
  }

  /**
   * Get supported GIFT currencies
   * @returns {Promise<AxiosResponse>}
   * @throws {Error}
   */
  async getSupportedCurrencies(): Promise<AxiosResponse> {
    try {
      const response = await this.giftHttpService.get<string>({
        path: PATH.CURRENCY,
      });

      return response;
    } catch (error) {
      console.error('Error getting supported currencies %o', error);

      throw new Error('Error getting supported currencies', error);
    }
  }
}
