import { HttpStatus, Injectable } from '@nestjs/common';
import { GIFT } from '@ukef/constants';
import { AxiosResponse } from 'axios';
import { PinoLogger } from 'nestjs-pino';

import { GiftObligationSubtypeDto } from './dto';
import { GiftHttpService } from './gift.http.service';

const { PATH } = GIFT;

/**
 * GIFT obligation subtype service.
 * This is responsible for all obligation subtype operations that call the GIFT API.
 */
@Injectable()
export class GiftObligationSubtypeService {
  constructor(
    private readonly giftHttpService: GiftHttpService,
    private readonly logger: PinoLogger,
  ) {
    this.giftHttpService = giftHttpService;
  }

  /**
   * Get a GIFT obligation subtype
   * @param {String} subtypeCode: Obligation subtype code
   * @returns {Promise<Array<AxiosResponse>>}
   * @throws {Error}
   */
  async getOne(subtypeCode: string): Promise<AxiosResponse> {
    try {
      this.logger.info('Getting obligation subtype %s', subtypeCode);

      const response = await this.giftHttpService.get<GiftObligationSubtypeDto[]>({
        path: `${PATH.OBLIGATION_SUBTYPE}/${subtypeCode}`,
      });

      return response;
    } catch (error) {
      this.logger.error('Error getting obligation subtype $s %o', subtypeCode, error);

      throw new Error(`Error getting obligation subtype ${subtypeCode}`, error);
    }
  }

  /**
   * Check if a GIFT obligation subtype is supported
   * @param {String} productTypeCode: Product type code
   * @param {String} subtypeCode: Obligation subtype code
   * @returns {Promise<Boolean>}
   * @throws {Error}
   */
  async isSupported(productTypeCode: string, subtypeCode: string): Promise<boolean> {
    try {
      this.logger.info('Checking if obligation subtype code %s is supported for product type %s', subtypeCode, productTypeCode);

      const response = await this.getOne(subtypeCode);

      if (response.status === HttpStatus.OK && response.data?.productTypeCode === productTypeCode) {
        return true;
      }

      return false;
    } catch (error) {
      this.logger.error('Error checking if obligation subtype code %s is supported for product type %s %o', productTypeCode, error);

      throw new Error(`Error checking if obligation subtype code ${subtypeCode} is supported for product type ${productTypeCode}`, error);
    }
  }
}
