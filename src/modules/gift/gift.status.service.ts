import { Injectable } from '@nestjs/common';
import { GIFT } from '@ukef/constants';
import { AxiosResponse } from 'axios';
import { PinoLogger } from 'nestjs-pino';

import { GiftRepaymentProfileDto } from './dto';
import { GiftHttpService } from './gift.http.service';

const { PATH } = GIFT;

/**
 * GIFT status service.
 * This is responsible for all status operations that call the GIFT API.
 */
@Injectable()
export class GiftStatusService {
  constructor(
    private readonly giftHttpService: GiftHttpService,
    private readonly logger: PinoLogger,
  ) {
    this.giftHttpService = giftHttpService;
  }

  /**
   * Set a GIFT facility work package as approved
   * @param {String} facilityId: Facility ID
   * @param {Number} workPackageId: Facility work package ID
   * @returns {Promise<AxiosResponse>}
   * @throws {Error}
   */
  async approved(facilityId: string, workPackageId: number): Promise<AxiosResponse> {
    try {
      this.logger.info('Updating facility work package status to approved for facility %s', facilityId);

      const response = await this.giftHttpService.post<GiftRepaymentProfileDto>({
        path: `${PATH.FACILITY}/${facilityId}${PATH.WORK_PACKAGE}/${workPackageId}${PATH.APPROVE}`,
      });

      return response;
    } catch (error) {
      this.logger.error('Error updating facility work package status to approved for facility %s %o', facilityId, error);

      throw new Error(`Error updating facility work package status to approved for facility ${facilityId}`, error);
    }
  }
}
