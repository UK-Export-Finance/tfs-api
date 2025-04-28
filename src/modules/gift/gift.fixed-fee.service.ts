import { Injectable } from '@nestjs/common';
import { GIFT } from '@ukef/constants';
import { AxiosResponse } from 'axios';

import { GiftFixedFeeDto } from './dto';
import { GiftHttpService } from './gift-http.service';

const { EVENT_TYPES, PATH } = GIFT;

/**
 * GIFT fixed fee service.
 * This is responsible for all fixed fee operations that call the GIFT API.
 */
@Injectable()
export class GiftFixedFeeService {
  constructor(private readonly giftHttpService: GiftHttpService) {
    this.giftHttpService = giftHttpService;
  }

  /**
   * Create a GIFT fixed fee
   * @param {GiftFixedFeeDto} payload: Fixed fee data
   * @param {String} facilityId: Facility ID
   * @param {Number} workPackageId: Facility work package ID
   * @returns {Promise<AxiosResponse>}
   * @throws {Error}
   */
  async createOne(fixedFeeData: GiftFixedFeeDto, facilityId: string, workPackageId: number): Promise<AxiosResponse> {
    try {
      const response = await this.giftHttpService.post<GiftFixedFeeDto>({
        path: `${PATH.FACILITY}/${facilityId}${PATH.WORK_PACKAGE}/${workPackageId}${PATH.CONFIGURATION_EVENT}`,
        payload: {
          eventType: EVENT_TYPES.CREATE_FIXED_FEE,
          eventData: fixedFeeData,
        },
      });

      return response;
    } catch (error) {
      console.error('Error creating fixed fee %o', error);

      throw new Error('Error creating fixed fee', error);
    }
  }

  /**
   * Create multiple GIFT fixed fees
   * @param {Array<GiftFixedFeeDto>} fixedFeesData: Fixed fees data
   * @param {String} facilityId: Facility ID
   * @param {Number} workPackageId: Facility work package ID
   * @returns {Promise<Array<AxiosResponse>>}
   * @throws {Error}
   */
  async createMany(fixedFeesData: GiftFixedFeeDto[], facilityId: string, workPackageId: number): Promise<Array<AxiosResponse>> {
    try {
      return await Promise.all(fixedFeesData.map((fixedFee) => this.createOne(fixedFee, facilityId, workPackageId)));
    } catch (error) {
      console.error('Error creating fixed fees %o', error);

      throw new Error('Error creating fixed fees', error);
    }
  }
}
