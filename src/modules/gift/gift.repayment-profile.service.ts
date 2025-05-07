import { Injectable } from '@nestjs/common';
import { GIFT } from '@ukef/constants';
import { AxiosResponse } from 'axios';
import { PinoLogger } from 'nestjs-pino';

import { GiftRepaymentProfileDto } from './dto';
import { GiftHttpService } from './gift-http.service';

const { PATH } = GIFT;

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
   * @param {GiftRepaymentProfileDto} payload: Repayment profile data
   * @param {Number} workPackageId: Facility work package ID
   * @returns {Promise<AxiosResponse>}
   * @throws {Error}
   */
  async createOne(payload: GiftRepaymentProfileDto, workPackageId: number): Promise<AxiosResponse> {
    try {
      const response = await this.giftHttpService.post<GiftRepaymentProfileDto>({
        path: `${PATH.WORK_PACKAGE}/${workPackageId}${PATH.REPAYMENT_PROFILE}${PATH.MANUAL}${PATH.CREATION_EVENT}`,
        payload,
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
   * @param {Number} workPackageId: Facility work package ID
   * @returns {Promise<Array<AxiosResponse>>}
   * @throws {Error}
   */
  async createMany(repaymentProfilesData: GiftRepaymentProfileDto[], workPackageId: number): Promise<Array<AxiosResponse>> {
    try {
      return await Promise.all(repaymentProfilesData.map((repaymentProfile) => this.createOne(repaymentProfile, workPackageId)));
    } catch (error) {
      this.logger.error('Error creating repayment profiles %o', error);

      throw new Error('Error creating repayment profiles', error);
    }
  }
}
