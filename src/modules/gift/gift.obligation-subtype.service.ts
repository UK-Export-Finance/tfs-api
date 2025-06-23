import { Injectable } from '@nestjs/common';
import { GIFT } from '@ukef/constants';
import { AxiosResponse } from 'axios';
import { PinoLogger } from 'nestjs-pino';

import { GiftObligationRequestDto, GiftObligationSubtypeResponseDto } from './dto';
import { GiftHttpService } from './gift.http.service';
import { getUnsupportedObligationSubtypeCodes } from './helpers';

const { PATH } = GIFT;

interface IsSupportedParams {
  facilityId: string;
  obligations: GiftObligationRequestDto[];
  productTypeCode: string;
}

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
   * @param {String} productTypeCode: Product type code
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

  /**
   * Check if multiple obligation subtypes are supported by a product type.
   * @param {IsSupportedParams} facility ID, obligations, product type code
   * @returns {promise<Boolean>}
   * @throws {Error}
   */
  async isSupported({ facilityId, obligations, productTypeCode }: IsSupportedParams): Promise<boolean> {
    try {
      this.logger.info('Checking if multiple obligation subtypes are supported by product type %s for facility %s', productTypeCode, facilityId);

      const supportedSubtypes = await this.getAllByProductType(productTypeCode);

      const unsupportedSubtypeCodes = getUnsupportedObligationSubtypeCodes({
        obligations,
        supportedSubtypes,
      });

      if (unsupportedSubtypeCodes.length) {
        this.logger.info(
          '%d Obligation subtypes are not supported by product type %s for facility %s',
          unsupportedSubtypeCodes.length,
          productTypeCode,
          facilityId,
        );

        return false;
      }

      return true;
    } catch (error) {
      this.logger.error('Error checking if multiple obligation subtypes are supported for product type for facility %s %o', productTypeCode, facilityId, error);

      throw new Error(`Error checking if multiple obligation subtypes are supported for product type ${productTypeCode} for facility ${facilityId}`, error);
    }
  }
}
