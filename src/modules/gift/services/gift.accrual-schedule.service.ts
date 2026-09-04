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

      let path;
      let payload;

      const basePayload = {
        acbsInterestScheduleId: INTEGRATION_DEFAULTS.ACBS_INTEREST_SCHEDULE_ID,
        additionalRateTypeCode: INTEGRATION_DEFAULTS.ADDITIONAL_RATE_TYPE_CODE,
        dateSnapBackOverride: INTEGRATION_DEFAULTS.DATE_SNAP_BACK_OVERRIDE,
      };

      const basePath = `${PATH.FACILITY}/${facilityId}${PATH.WORK_PACKAGE}/${workPackageId}${PATH.CONFIGURATION_EVENT}`;

      /**
       * NOTE: The GIFT API has two different endpoints for creating an accrual schedule, one for fixed rate and one for indexed rate.
       * The "fixed rate" endpoint requires a baseRate and baseRateTypeCode to be provided,
       * while the "indexed rate" endpoint requires the indexRateCode to be provided.
       *
       * Therefore, we need to check if the indexRateCode is provided in the request data, and call the appropriate endpoint accordingly:
       * - If the indexRateCode is provided, we will call the indexed rate endpoint and remove the baseRate from the payload.
       * - If the indexRateCode is not provided, we will call the fixed rate endpoint.
       */
      if (accrualScheduleData.indexRateCode) {
        this.logger.info('Creating an "indexed rate" accrual schedule for facility %s', facilityId);

        path = `${basePath}/${EVENT_TYPES.ADD_ACCRUAL_SCHEDULE_INDEXED_RATE}`;

        payload = {
          ...basePayload,
          ...accrualScheduleData,
          accrualEffectiveDate: accrualScheduleData.accrualEffectiveDate ?? INTEGRATION_DEFAULTS.ACCRUAL_EFFECTIVE_DATE,
          accrualMaturityDate: accrualScheduleData.accrualMaturityDate ?? INTEGRATION_DEFAULTS.ACCRUAL_MATURITY_DATE,
          firstCycleAccrualEndDate: accrualScheduleData.firstCycleAccrualEndDate ?? INTEGRATION_DEFAULTS.FIRST_CYCLE_ACCRUAL_END_DATE,
        };

        delete payload.baseRate;
      } else {
        this.logger.info('Creating a "fixed rate" accrual schedule for facility %s', facilityId);

        path = `${basePath}/${EVENT_TYPES.ADD_ACCRUAL_SCHEDULE_FIXED_RATE}`;

        payload = {
          ...basePayload,
          ...accrualScheduleData,
          accrualEffectiveDate: accrualScheduleData.accrualEffectiveDate ?? INTEGRATION_DEFAULTS.ACCRUAL_EFFECTIVE_DATE,
          accrualMaturityDate: accrualScheduleData.accrualMaturityDate ?? INTEGRATION_DEFAULTS.ACCRUAL_MATURITY_DATE,
          firstCycleAccrualEndDate: accrualScheduleData.firstCycleAccrualEndDate ?? INTEGRATION_DEFAULTS.FIRST_CYCLE_ACCRUAL_END_DATE,
          baseRateTypeCode: null,
        };
      }

      const response = await this.giftHttpService.post<GiftAccrualScheduleRequestDto>({
        path,
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
