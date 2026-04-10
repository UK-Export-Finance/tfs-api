import { Injectable } from '@nestjs/common';
import { GIFT } from '@ukef/constants';
import { AxiosResponse } from 'axios';
import { PinoLogger } from 'nestjs-pino';

import { GiftAccrualScheduleRequestDto } from '../dto';
import { GiftHttpService } from './gift.http.service';

const { EVENT_TYPES, INTEGRATION_DEFAULTS, PATH } = GIFT;

/**
 * GIFT accrual schedule service.
 * This is responsible for all accrual schedule operations that call the GIFT API.
 */
@Injectable()
export class GiftAccrualScheduleService {
  constructor(
    private readonly giftHttpService: GiftHttpService,
    private readonly logger: PinoLogger,
  ) {
    this.giftHttpService = giftHttpService;
  }

  /**
   * Create a GIFT accrual schedule
   * @param {GiftAccrualScheduleRequestDto} accrualScheduleData: Accrual schedule data
   * @param {string} facilityId: Facility ID
   * @param {number} workPackageId: Facility work package ID
   * @returns {Promise<AxiosResponse>}
   * @throws {Error}
   */
  async createOne(accrualScheduleData: GiftAccrualScheduleRequestDto, facilityId: string, workPackageId: number): Promise<AxiosResponse> {
    try {
      this.logger.info('Creating an accrual schedule with schedule type code %s for facility %s', accrualScheduleData.accrualScheduleTypeCode, facilityId);

      const payload = {
        ...accrualScheduleData,
        dateSnapBackOverride: INTEGRATION_DEFAULTS.DATE_SNAP_BACK_OVERRIDE,
        baseRateTypeCode: null,
        additionalRateTypeCode: null,
        acbsInterestScheduleId: INTEGRATION_DEFAULTS.ACBS_INTEREST_SCHEDULE_ID,
      };

      const response = await this.giftHttpService.post<GiftAccrualScheduleRequestDto>({
        path: `${PATH.FACILITY}/${facilityId}${PATH.WORK_PACKAGE}/${workPackageId}${PATH.CONFIGURATION_EVENT}/${EVENT_TYPES.ADD_ACCRUAL_SCHEDULE_FIXED_RATE}`,
        payload,
      });

      return response;
    } catch (error) {
      this.logger.error(
        'Error creating an accrual schedule with schedule type code %s for facility %s %o',
        accrualScheduleData.accrualScheduleTypeCode,
        facilityId,
        error,
      );

      throw new Error(`Error creating an accrual schedule with schedule type code ${accrualScheduleData.accrualScheduleTypeCode} for facility ${facilityId}`);
    }
  }

  /**
   * Create multiple GIFT accrual schedules
   * @param {Array<GiftAccrualScheduleRequestDto>} accrualSchedulesData: Accrual schedules data
   * @param {string} facilityId: Facility ID
   * @param {number} workPackageId: Facility work package ID
   * @returns {Promise<Array<AxiosResponse>>}
   * @throws {Error}
   */
  async createMany(accrualSchedulesData: GiftAccrualScheduleRequestDto[], facilityId: string, workPackageId: number): Promise<Array<AxiosResponse>> {
    try {
      this.logger.info('Creating accrual schedules for facility %s', facilityId);

      /**
       * NOTE: We need to use a for loop instead of Promise.all, to ensure that the calls are sequential.
       * Promise.all is not sequential.
       */
      const responses = [];

      for (const accrualSchedule of accrualSchedulesData) {
        const response = await this.createOne(accrualSchedule, facilityId, workPackageId);

        responses.push(response);
      }

      return responses;
    } catch (error) {
      this.logger.error('Error creating accrual schedules for facility %s %o', facilityId, error);

      throw new Error(`Error creating accrual schedules for facility ${facilityId}`, { cause: error });
    }
  }
}
