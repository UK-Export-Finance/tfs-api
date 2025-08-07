import { Injectable } from '@nestjs/common';
import { GIFT } from '@ukef/constants';
import { AxiosResponse } from 'axios';
import { PinoLogger } from 'nestjs-pino';

import { GiftRepaymentProfileRequestDto } from '../dto';
import { GiftHttpService } from './gift.http.service';

const { EVENT_TYPES, PATH } = GIFT;

/**
 * GIFT repayment profile service.
 * This is responsible for all repayment profile operations that call the GIFT API.
 */
@Injectable()
export class GiftRepaymentProfileService {
  constructor(
    private readonly giftHttpService: GiftHttpService,
    private readonly logger: PinoLogger,
  ) {
    this.giftHttpService = giftHttpService;
  }

  /**
   * Create a GIFT repayment profile
   * @param {GiftRepaymentProfileRequestDto} repaymentProfileData: Repayment profile data
   * @param {string} facilityId: Facility ID
   * @param {number} workPackageId: Facility work package ID
   * @returns {Promise<AxiosResponse>}
   * @throws {Error}
   */
  async createOne(repaymentProfileData: GiftRepaymentProfileRequestDto, facilityId: string, workPackageId: number): Promise<AxiosResponse> {
    try {
      this.logger.info('Creating a repayment profile with name %s for facility %s', repaymentProfileData.name, facilityId);

      const response = await this.giftHttpService.post<GiftRepaymentProfileRequestDto>({
        path: `${PATH.FACILITY}/${facilityId}${PATH.WORK_PACKAGE}/${workPackageId}${PATH.CONFIGURATION_EVENT}/${EVENT_TYPES.ADD_MANUAL_REPAYMENT_PROFILE}`,
        payload: repaymentProfileData,
      });

      return response;
    } catch (error) {
      this.logger.error('Error creating a repayment profile with name %s for facility %s %o', repaymentProfileData.name, facilityId, error);

      throw new Error(`Error creating a repayment profile with name ${repaymentProfileData.name} for facility ${facilityId}`, error);
    }
  }

  /**
   * Create multiple GIFT repayment profiles
   * @param {Array<GiftRepaymentProfileRequestDto>} repaymentProfilesData: Repayment profiles data
   * @param {string} facilityId: Facility ID
   * @param {number} workPackageId: Facility work package ID
   * @returns {Promise<Array<AxiosResponse>>}
   * @throws {Error}
   */
  async createMany(repaymentProfilesData: GiftRepaymentProfileRequestDto[], facilityId: string, workPackageId: number): Promise<Array<AxiosResponse>> {
    try {
      this.logger.info('Creating repayment profiles for facility %s', facilityId);

      /**
       * NOTE: We need to use a for loop instead of Promise.all, to ensure that the calls are sequential.
       * Promise.all is not sequential.
       */
      const responses = [];

      for (const repaymentProfile of repaymentProfilesData) {
        const response = await this.createOne(repaymentProfile, facilityId, workPackageId);

        responses.push(response);
      }

      return responses;
    } catch (error) {
      this.logger.error('Error creating repayment profiles for facility %s %o', facilityId, error);

      throw new Error(`Error creating repayment profiles for facility ${facilityId}`, error);
    }
  }
}
