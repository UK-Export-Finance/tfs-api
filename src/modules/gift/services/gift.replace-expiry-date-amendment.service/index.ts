import { HttpStatus, Injectable } from '@nestjs/common';
import { GIFT } from '@ukef/constants';
import { GiftAmendmentBaseParams } from '@ukef/types';
import { PinoLogger } from 'nestjs-pino';

import { GiftWorkPackageResponseDto } from '../../dto';
import { GiftHttpService } from '../gift.http.service';
import { GiftWorkPackageService } from '../gift.work-package.service';

const {
  AMEND_FACILITY_PREFIX_TYPES,
  AMEND_FACILITY_TYPES_GIFT: { AMEND_ACCRUAL_SCHEDULE_REPLACE_FIRST_CYCLE_ACCRUAL_END_DATE, AMEND_OBLIGATION_REPLACE_MATURITY_DATE },
  EVENT_TYPES: { AMEND_FACILITY_REPLACE_EXPIRY_DATE },
  PATH,
} = GIFT;

type ObligationsParams = GiftAmendmentBaseParams & {
  facilityExpiryDate: string;
  obligations: { id: string }[];
};

type FacilityParams = GiftAmendmentBaseParams & {
  expiryDate: string;
  accrualScheduleIds: number[];
};

/**
 * GIFT 'replace expiry date' amendment service.
 * This is responsible for the 'replace expiry date" amendment operations that call the GIFT API.
 */
@Injectable()
export class GiftReplaceExpiryDateAmendmentService {
  constructor(
    private readonly giftHttpService: GiftHttpService,
    private readonly giftWorkPackageService: GiftWorkPackageService,
    private readonly logger: PinoLogger,
  ) {
    this.giftHttpService = giftHttpService;
    this.giftWorkPackageService = giftWorkPackageService;
    this.logger = logger;
  }

  /**
   * Amend the obligations maturity dates for a given facility and work package.
   * @param {ObligationsParams} params - Parameters for the amendment.
   * @param {string} params.amendmentType - The type of amendment being made.
   * @param {string} params.facilityExpiryDate - The new expiry date for the facility.
   * @param {string} params.facilityId - The ID of the facility being amended.
   * @param {Array<{ id: string }>} params.obligations - An array of obligations to be amended.
   * @param {number} params.workPackageId - The ID of the work package associated with the amendment.
   * @returns {Promise<Array<GiftWorkPackageResponseDto>>} - A promise that resolves to an array of responses from the GIFT API for each obligation amended.
   * @throws {Error} - Throws an error if the amendment fails for any obligation, including details about the failure.
   * @returns {Promise<Array<GiftWorkPackageResponseDto>>} - A promise that resolves to an array of responses from the GIFT API for each obligation amended.
   */
  async obligations({ amendmentType, facilityExpiryDate, facilityId, obligations, workPackageId }: ObligationsParams) {
    try {
      this.logger.info('Amending facility obligations maturity dates %s for facility %s work package %s', amendmentType, facilityId, workPackageId);

      const basePath = `${PATH.FACILITY}/${facilityId}${PATH.WORK_PACKAGE}/${workPackageId}${PATH.CONFIGURATION_EVENT}`;

      /**
       * NOTE: We need to use a for loop instead of Promise.all, to ensure that the calls are sequential.
       * Promise.all is not sequential.
       */
      const responses = [];

      for (const obligation of obligations) {
        const payload = {
          obligationId: obligation.id,
          maturityDate: facilityExpiryDate,
        };

        const response = await this.giftHttpService.post<GiftWorkPackageResponseDto>({
          path: `${basePath}/${AMEND_FACILITY_PREFIX_TYPES.AMEND_OBLIGATION}${AMEND_OBLIGATION_REPLACE_MATURITY_DATE}`,
          payload,
        });

        if (response.status !== HttpStatus.CREATED) {
          this.logger.error('Error creating amendment %s for work package %s facility %s. Deleting work package', amendmentType, workPackageId, facilityId);

          await this.giftWorkPackageService.delete(workPackageId, facilityId);

          throw new Error(
            `Unexpected status ${response.status} amending facility obligations maturity dates ${amendmentType} for facility ${facilityId} work package ${workPackageId}`,
            {
              cause: response.data,
            },
          );
        }

        responses.push(response.data);
      }

      return responses;
    } catch (error) {
      this.logger.error(
        'Error amending facility obligations maturity dates %s for facility %s work package %s %o',
        amendmentType,
        facilityId,
        workPackageId,
        error,
      );

      throw new Error(`Error amending facility obligations maturity dates ${amendmentType} for facility ${facilityId} work package ${workPackageId}`, {
        cause: error,
      });
    }
  }

  /**
   * Amend the expiry date for a given facility and work package.
   * Also updates the first cycle accrual end date for all accrual schedules associated with the facility.
   * @param {FacilityParams} params - Parameters for the amendment.
   * @param {string[]} params.accrualScheduleIds - An array of accrual schedule IDs associated with the facility.
   * @param {string} params.amendmentType - The type of amendment being made.
   * @param {string} params.expiryDate - The new expiry date for the facility.
   * @param {string} params.facilityId - The ID of the facility being amended.
   * @param {number} params.workPackageId - The ID of the work package associated with the amendment.
   * @throws {Error} - Throws an error if the amendment fails, including details about the failure.
   * @returns {Promise<GiftWorkPackageResponseDto>} - A promise that resolves to the response from the GIFT API for the facility amendment.
   */
  async facility({ accrualScheduleIds, amendmentType, expiryDate, facilityId, workPackageId }: FacilityParams) {
    try {
      this.logger.info('Amending facility expiry date %s for facility %s work package %s', amendmentType, facilityId, workPackageId);

      const accrualScheduleAmendmentTypeString = `${AMEND_FACILITY_PREFIX_TYPES.AMEND_ACCRUAL_SCHEDULE}${AMEND_ACCRUAL_SCHEDULE_REPLACE_FIRST_CYCLE_ACCRUAL_END_DATE}`;

      const accrualPath = `${PATH.FACILITY}/${facilityId}${PATH.WORK_PACKAGE}/${workPackageId}${PATH.CONFIGURATION_EVENT}/${accrualScheduleAmendmentTypeString}`;

      /**
       * NOTE: We need to use a for loop instead of Promise.all, to ensure that the calls are sequential.
       * Promise.all is not sequential.
       */
      for (const accrualScheduleId of accrualScheduleIds) {
        const response = await this.giftHttpService.post<GiftWorkPackageResponseDto>({
          path: accrualPath,
          payload: {
            accrualScheduleId,
            firstCycleAccrualEndDate: expiryDate,
          },
        });

        if (response.status !== HttpStatus.CREATED) {
          this.logger.error(
            'Error creating accrual schedule amendment %s for work package %s facility %s. Deleting work package',
            amendmentType,
            workPackageId,
            facilityId,
          );

          await this.giftWorkPackageService.delete(workPackageId, facilityId);

          throw new Error(
            `Unexpected status ${response.status} amending accrual schedule ${accrualScheduleId} for facility ${facilityId} work package ${workPackageId}`,
            {
              cause: response.data,
            },
          );
        }
      }

      const facilityPath = `${PATH.FACILITY}/${facilityId}${PATH.WORK_PACKAGE}/${workPackageId}${PATH.CONFIGURATION_EVENT}/${AMEND_FACILITY_REPLACE_EXPIRY_DATE}`;

      const payload = { expiryDate };

      const response = await this.giftHttpService.post<GiftWorkPackageResponseDto>({
        path: facilityPath,
        payload,
      });

      return response;
    } catch (error) {
      this.logger.error('Error amending facility expiry date %s for facility %s work package %s %o', amendmentType, facilityId, workPackageId, error);

      throw new Error(`Error amending facility expiry date ${amendmentType} for facility ${facilityId} work package ${workPackageId}`, {
        cause: error,
      });
    }
  }
}
