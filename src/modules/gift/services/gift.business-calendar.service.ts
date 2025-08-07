import { Injectable } from '@nestjs/common';
import { BUSINESS_CALENDAR, GIFT } from '@ukef/constants';
import { AxiosResponse } from 'axios';
import { PinoLogger } from 'nestjs-pino';

import { GiftBusinessCalendarRequestDto } from '../dto';
import { GiftHttpService } from './gift.http.service';

const { EVENT_TYPES, PATH } = GIFT;

interface CreateOneParams {
  facilityId: string;
  workPackageId: number;
  startDate: string;
  exitDate: string;
}

/**
 * GIFT business calendar service.
 * This is responsible for all business calendar operations that call the GIFT API.
 */
@Injectable()
export class GiftBusinessCalendarService {
  constructor(
    private readonly giftHttpService: GiftHttpService,
    private readonly logger: PinoLogger,
  ) {
    this.giftHttpService = giftHttpService;
  }

  /**
   * Create a GIFT business calendar. Currently defaults to a London.
   * @param {CreateOneParams} facilityId, workPackageId, startDate, exitDate
   * @returns {Promise<AxiosResponse>}
   * @throws {Error}
   */
  async createOne({ facilityId, workPackageId, startDate, exitDate }: CreateOneParams): Promise<AxiosResponse> {
    try {
      this.logger.info('Creating a business calendar for facility %s', facilityId);

      const response = await this.giftHttpService.post<GiftBusinessCalendarRequestDto>({
        path: `${PATH.FACILITY}/${facilityId}${PATH.WORK_PACKAGE}/${workPackageId}${PATH.CONFIGURATION_EVENT}/${EVENT_TYPES.ADD_BUSINESS_CALENDAR}`,
        payload: {
          centreCode: BUSINESS_CALENDAR.LONDON.CODE,
          startDate,
          exitDate,
        },
      });

      return response;
    } catch (error) {
      this.logger.error('Error creating a business calendar for facility %s %o', facilityId, error);

      throw new Error(`Error creating a business calendar for facility ${facilityId}`, error);
    }
  }
}
