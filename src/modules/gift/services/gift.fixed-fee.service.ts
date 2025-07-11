import { Injectable } from '@nestjs/common';
import { GIFT } from '@ukef/constants';
import { AxiosResponse } from 'axios';
import { PinoLogger } from 'nestjs-pino';

import { GiftFixedFeeRequestDto } from '../dto';
import { GiftHttpService } from './gift.http.service';

const { EVENT_TYPES, PATH } = GIFT;

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
   * @param {GiftFixedFeeRequestDto} payload: Fixed fee data
   * @param {String} facilityId: Facility ID
   * @param {Number} workPackageId: Facility work package ID
   * @returns {Promise<AxiosResponse>}
   * @throws {Error}
   */
  async createOne(fixedFeeData: GiftFixedFeeRequestDto, facilityId: string, workPackageId: number): Promise<AxiosResponse> {
    try {
      this.logger.info('Creating a fixed fee with description %s for facility %s', fixedFeeData.description, facilityId);

      const response = await this.giftHttpService.post<GiftFixedFeeRequestDto>({
        path: `${PATH.FACILITY}/${facilityId}${PATH.WORK_PACKAGE}/${workPackageId}${PATH.CONFIGURATION_EVENT}/${EVENT_TYPES.CREATE_FIXED_FEE}`,
        payload: fixedFeeData,
      });

      return response;
    } catch (error) {
      this.logger.error('Error creating a fixed fee with description %s for facility %s %o', fixedFeeData.description, facilityId, error);

      throw new Error(`Error creating a fixed fee with description ${fixedFeeData.description} for facility ${facilityId}`, error);
    }
  }

  /**
   * Create multiple GIFT fixed fees
   * @param {Array<GiftFixedFeeRequestDto>} fixedFeesData: Fixed fees data
   * @param {String} facilityId: Facility ID
   * @param {Number} workPackageId: Facility work package ID
   * @returns {Promise<Array<AxiosResponse>>}
   * @throws {Error}
   */
  async createMany(fixedFeesData: GiftFixedFeeRequestDto[], facilityId: string, workPackageId: number): Promise<Array<AxiosResponse>> {
    try {
      this.logger.info('Creating fixed fees for facility %s', facilityId);

      /**
       * NOTE: We need to use a for loop instead of Promise.all, to ensure that the calls are sequential.
       * Promise.all is not sequential.
       */
      const responses = [];

      for (const fixedFee of fixedFeesData) {
        responses.push(await this.createOne(fixedFee, facilityId, workPackageId));
      }

      return responses;
    } catch (error) {
      this.logger.error('Error creating fixed fees for facility %s %o', facilityId, error);

      throw new Error(`Error creating fixed fees for facility ${facilityId}`, error);
    }
  }
}
