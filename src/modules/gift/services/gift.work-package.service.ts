import { Injectable } from '@nestjs/common';
import { GIFT } from '@ukef/constants';
import { PinoLogger } from 'nestjs-pino';

import { GiftWorkPackageResponseDto } from '../dto';
import { GiftHttpService } from './gift.http.service';

const { INTEGRATION_DEFAULTS, PATH } = GIFT;

@Injectable()
export class GiftWorkPackageService {
  constructor(
    private readonly giftHttpService: GiftHttpService,
    private readonly logger: PinoLogger,
  ) {
    this.giftHttpService = giftHttpService;
  }

  /**
   * Create a GIFT work package for a facility
   * @param {string} facilityId: Facility ID
   * @returns {Promise<AxiosResponse>}
   * @throws {Error}
   */
  async create(facilityId: string) {
    try {
      this.logger.info('Creating work package for facility %s', facilityId);

      const response = await this.giftHttpService.post<GiftWorkPackageResponseDto>({
        path: `${PATH.FACILITY}/${facilityId}${PATH.WORK_PACKAGE}`,
        payload: {
          name: INTEGRATION_DEFAULTS.GIFT_AMENDMENT_WORK_PACKAGE_NAME,
        },
      });

      return response;
    } catch (error) {
      this.logger.error('Error creating work package for facility %s %o', facilityId, error);

      throw new Error(`Error creating work package for facility ${facilityId}`, { cause: error });
    }
  }
}
