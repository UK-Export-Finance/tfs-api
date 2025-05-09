import { Injectable } from '@nestjs/common';
import { GIFT } from '@ukef/constants';
import { AxiosResponse } from 'axios';
import { PinoLogger } from 'nestjs-pino';

import { GiftRepaymentProfileDto } from './dto';
import { GiftHttpService } from './gift-http.service';

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
   * @param {GiftRepaymentProfileDto} repaymentProfileData: Repayment profile data
   * @param {String} facilityId: Facility ID
   * @param {Number} workPackageId: Facility work package ID
   * @returns {Promise<AxiosResponse>}
   * @throws {Error}
   */
  async createOne(repaymentProfileData: GiftRepaymentProfileDto, facilityId: string, workPackageId: number): Promise<AxiosResponse> {
    try {
      const response = await this.giftHttpService.post<GiftRepaymentProfileDto>({
        path: `${PATH.FACILITY}/${facilityId}${PATH.WORK_PACKAGE}/${workPackageId}${PATH.CONFIGURATION_EVENT}/${EVENT_TYPES.ADD_MANUAL_REPAYMENT_PROFILE}`,
        payload: repaymentProfileData,
      });

      return response;
    } catch (error) {
      this.logger.error('Error creating repayment profile %o', error);

      throw new Error('Error creating repayment profile', error);
    }
  }

  /**
   * Create multiple GIFT repayment profiles
   * @param {Array<GiftRepaymentProfileDto>} repaymentProfilesData: Repayment profiles data
   * @param {String} facilityId: Facility ID
   * @param {Number} workPackageId: Facility work package ID
   * @returns {Promise<Array<AxiosResponse>>}
   * @throws {Error}
   */
  async createMany(repaymentProfilesData: GiftRepaymentProfileDto[], facilityId: string, workPackageId: number): Promise<Array<AxiosResponse>> {
    try {
      const responses = await Promise.all(repaymentProfilesData.map((repaymentProfile) => this.createOne(repaymentProfile, facilityId, workPackageId)));

      return responses;
    } catch (error) {
      this.logger.error('Error creating repayment profiles %o', error);

      throw new Error('Error creating repayment profiles', error);
    }
  }
}
