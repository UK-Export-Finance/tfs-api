import { Injectable } from '@nestjs/common';
import { GIFT } from '@ukef/constants';
import { AxiosResponse } from 'axios';
import { PinoLogger } from 'nestjs-pino';

import { GiftBusinessCalendarsConventionResponseDto } from '../dto';
import { GiftHttpService } from './gift.http.service';

const { INTEGRATION_DEFAULTS, EVENT_TYPES, PATH } = GIFT;

interface CreateOneParams {
  facilityId: string;
  workPackageId: number;
}

/**
 * GIFT "business calendars convention" service.
 * This is responsible for all "business calendars convention" operations that call the GIFT API.
 */
@Injectable()
export class GiftBusinessCalendarsConventionService {
  constructor(
    private readonly giftHttpService: GiftHttpService,
    private readonly logger: PinoLogger,
  ) {
    this.giftHttpService = giftHttpService;
  }

  /**
   * Create a GIFT "business calendars convention".
   * NOTE: This uses default integration values.
   * @param {CreateOneParams} facilityId, workPackageId
   * @returns {Promise<AxiosResponse>}
   * @throws {Error}
   */
  async createOne({ facilityId, workPackageId }: CreateOneParams): Promise<AxiosResponse> {
    try {
      this.logger.info('Creating business calendars convention for facility %s', facilityId);

      const response = await this.giftHttpService.post<GiftBusinessCalendarsConventionResponseDto>({
        path: `${PATH.FACILITY}/${facilityId}${PATH.WORK_PACKAGE}/${workPackageId}${PATH.CONFIGURATION_EVENT}/${EVENT_TYPES.ADD_BUSINESS_CALENDARS_CONVENTION}`,
        payload: {
          businessDayConvention: INTEGRATION_DEFAULTS.BUSINESS_CALENDARS_CONVENTION,
          dueOnLastWorkingDayEachMonth: INTEGRATION_DEFAULTS.DUE_ON_LAST_WORKING_DAY_EACH_MONTH,
          dateSnapBack: INTEGRATION_DEFAULTS.DATE_SNAP_BACK,
        },
      });

      return response;
    } catch (error) {
      this.logger.error('Error creating business calendars convention for facility %s %o', facilityId, error);

      throw new Error(`Error creating business calendars convention for facility ${facilityId}`, error);
    }
  }
}
