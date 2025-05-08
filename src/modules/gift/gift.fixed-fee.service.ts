import { Injectable } from '@nestjs/common';
import { GIFT } from '@ukef/constants';
import { AxiosResponse } from 'axios';
import { PinoLogger } from 'nestjs-pino';

import { GiftFixedFeeDto } from './dto';
import { GiftHttpService } from './gift-http.service';

const { PATH } = GIFT;

/**
 * GIFT fixed fee service.
 * This is responsible for all fixed fee operations that call the GIFT API.
 */
@Injectable()
export class GiftFixedFeeService {
  constructor(
    private readonly giftHttpService: GiftHttpService,
    private readonly logger: PinoLogger,
  ) {
    this.giftHttpService = giftHttpService;
  }

  /**
   * Create a GIFT fixed fee
   * @param {GiftFixedFeeDto} payload: Fixed fee data
   * @param {Number} workPackageId: Facility work package ID
   * @returns {Promise<AxiosResponse>}
   * @throws {Error}
   */
  async createOne(payload: GiftFixedFeeDto, workPackageId: number): Promise<AxiosResponse> {
    try {
      const response = await this.giftHttpService.post<GiftFixedFeeDto>({
        path: `${PATH.WORK_PACKAGE}/${workPackageId}${PATH.FIXED_FEE}${PATH.CREATION_EVENT}`,
        payload,
      });

      return response;
    } catch (error) {
      this.logger.error('Error creating fixed fee %o', error);

      throw new Error('Error creating fixed fee', error);
    }
  }

  /**
   * Create multiple GIFT fixed fees
   * @param {Array<GiftFixedFeeDto>} fixedFeesData: Fixed fees data
   * @param {Number} workPackageId: Facility work package ID
   * @returns {Promise<Array<AxiosResponse>>}
   * @throws {Error}
   */
  async createMany(fixedFeesData: GiftFixedFeeDto[], workPackageId: number): Promise<Array<AxiosResponse>> {
    try {
      return await Promise.all(fixedFeesData.map((fixedFee) => this.createOne(fixedFee, workPackageId)));
    } catch (error) {
      this.logger.error('Error creating fixed fees %o', error);

      throw new Error('Error creating fixed fees', error);
    }
  }
}
