import { HttpStatus, Injectable } from '@nestjs/common';
import { GIFT } from '@ukef/constants';
import { AxiosResponse } from 'axios';
import { PinoLogger } from 'nestjs-pino';

import { GiftHttpService } from './gift.http.service';

const { PATH } = GIFT;

/**
 * GIFT product type service.
 * This is responsible for all product type operations that call the GIFT API.
 */
@Injectable()
export class GiftProductTypeService {
  constructor(
    private readonly giftHttpService: GiftHttpService,
    private readonly logger: PinoLogger,
  ) {
    this.giftHttpService = giftHttpService;
  }

  /**
   * Get a GIFT product type
   * @param {string} productTypeCode: Product type code
   * @returns {Promise<AxiosResponse>}
   * @throws {Error}
   */
  async getOne(productTypeCode: string): Promise<AxiosResponse> {
    try {
      this.logger.info('Getting product type %s', productTypeCode);

      const response = await this.giftHttpService.get<string>({
        path: `${PATH.PRODUCT_TYPE}/${productTypeCode}`,
      });

      return response;
    } catch (error) {
      this.logger.error('Error getting product type %s %o', productTypeCode, error);

      throw new Error(`Error getting product type ${productTypeCode}`, error);
    }
  }

  /**
   * Check if a GIFT product type is supported
   * @param {string} productTypeCode: Product type code
   * @returns {Promise<Boolean>}
   * @throws {Error}
   */
  async isSupported(productTypeCode: string) {
    try {
      this.logger.info('Checking if product type %s is supported', productTypeCode);

      const response = await this.getOne(productTypeCode);

      if (response.status === HttpStatus.OK) {
        return true;
      }

      return false;
    } catch (error) {
      this.logger.error('Error checking if product type %s is supported %o', productTypeCode, error);

      throw new Error(`Error checking if product type ${productTypeCode} is supported`, error);
    }
  }
}
