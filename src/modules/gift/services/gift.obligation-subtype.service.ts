import { Injectable } from '@nestjs/common';
import { GIFT } from '@ukef/constants';
import { AxiosResponse } from 'axios';
import { PinoLogger } from 'nestjs-pino';

import { GiftObligationSubtypeResponseDto } from '../dto';
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
   * Get all GIFT obligation subtypes
   * @returns {Promise<Array<AxiosResponse>>}
   * @throws {Error}
   */
  async getAll(): Promise<AxiosResponse> {
    try {
      this.logger.info('Getting obligation subtypes');

      const response = await this.giftHttpService.get<GiftObligationSubtypeResponseDto[]>({
        path: PATH.OBLIGATION_SUBTYPE,
      });

      return response;
    } catch (error) {
      this.logger.error('Error getting obligation subtypes %o', error);

      throw new Error('Error getting obligation subtypes', error);
    }
  }

  /**
   * Get all GIFT obligation subtypes by product type
   * @param {string} productTypeCode: Product type code
   * @returns {Promise<Array<GiftObligationSubtypeResponseDto>>}
   * @throws {Error}
   */
  async getAllByProductType(productTypeCode: string): Promise<GiftObligationSubtypeResponseDto[]> {
    try {
      this.logger.info('Getting obligation subtypes by product type %s', productTypeCode);

      const allSubtypes = await this.getAll();

      const filtered = allSubtypes.data?.obligationSubtypes?.filter((subtype: GiftObligationSubtypeResponseDto) => subtype.productTypeCode === productTypeCode);

      return filtered;
    } catch (error) {
      this.logger.error('Error getting obligation subtypes by product type %s %o', productTypeCode, error);

      throw new Error(`Error getting obligation subtypes by product type ${productTypeCode}`, error);
    }
  }
}
