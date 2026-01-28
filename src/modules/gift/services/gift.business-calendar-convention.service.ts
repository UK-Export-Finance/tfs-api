import { Injectable } from '@nestjs/common';
import { GIFT } from '@ukef/constants';
import { AxiosResponse } from 'axios';
import { PinoLogger } from 'nestjs-pino';

import { GiftBusinessCalendarResponseDto } from '../dto';
import { GiftHttpService } from './gift.http.service';

const { EVENT_TYPES, PATH } = GIFT;

interface CreateOneParams {
  facilityId: string;
  workPackageId: number;
  businessDayConvention: string;
  dueOnLastWorkingDayEachMonth: boolean;
  dateSnapBack: boolean;
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
   * @param {CreateOneParams} facilityId, businessDayConvention, dueOnLastWorkingDayEachMonth, dateSnapBack
   * @returns {Promise<AxiosResponse>}
   * @throws {Error}
   */
  async createOne({ facilityId, workPackageId, businessDayConvention, dueOnLastWorkingDayEachMonth, dateSnapBack }: CreateOneParams): Promise<AxiosResponse> {
    try {
      this.logger.info('Creating a business calendars convention for facility %s', facilityId);

      const response = await this.giftHttpService.post<GiftBusinessCalendarResponseDto>({
        path: `${PATH.FACILITY}/${facilityId}${PATH.WORK_PACKAGE}/${workPackageId}${PATH.CONFIGURATION_EVENT}/${EVENT_TYPES.ADD_BUSINESS_CALENDARS_CONVENTION}`,
        payload: {
          businessDayConvention,
          dueOnLastWorkingDayEachMonth,
          dateSnapBack,
        },
      });

      return response;
    } catch (error) {
      this.logger.error('Error creating a business calendars convention for facility %s %o', facilityId, error);

      throw new Error(`Error creating a business calendars convention for facility ${facilityId}`, error);
    }
  }
}
