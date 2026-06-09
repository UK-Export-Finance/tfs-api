import { Injectable } from '@nestjs/common';
import { GIFT } from '@ukef/constants';
import { AxiosResponse } from 'axios';
import { PinoLogger } from 'nestjs-pino';

import { GiftFacilityFeeTypeResponse, GiftFeeTypeResponseDto } from '../dto';
import { GiftHttpService } from './gift.http.service';

const { PATH } = GIFT;

/**
 * GIFT fee type service.
 * This is responsible for all fee type operations that call the GIFT API.
 */
@Injectable()
export class GiftFeeTypeService {
  constructor(
    private readonly giftHttpService: GiftHttpService,
    private readonly logger: PinoLogger,
  ) {
    this.giftHttpService = giftHttpService;
  }

  /**
   * Get supported GIFT fee types
   * @returns {Promise<AxiosResponse>}
   * @throws {Error}
   */
  async getSupportedFeeTypes(): Promise<AxiosResponse> {
    try {
      this.logger.info('Getting supported fee types');

      const response = await this.giftHttpService.get<GiftFacilityFeeTypeResponse>({
        path: PATH.FEE_TYPE,
      });

      return response;
    } catch (error) {
      this.logger.error('Error getting supported fee types %o', error);

      throw new Error('Error getting supported fee types', { cause: error });
    }
  }

  /**
   * Get all GIFT fee type codes
   * @returns {Promise<string[]>}
   * @throws {Error}
   */
  async getAllFeeTypeCodes(): Promise<string[]> {
    try {
      this.logger.info('Getting all fee type codes');

      const response = await this.getSupportedFeeTypes();

      const codes = response.data?.feeTypes.map((role: GiftFeeTypeResponseDto) => role.code);

      return codes;
    } catch (error) {
      this.logger.error('Error getting all fee type codes %o', error);

      throw new Error('Error getting all fee type codes', { cause: error });
    }
  }
}
