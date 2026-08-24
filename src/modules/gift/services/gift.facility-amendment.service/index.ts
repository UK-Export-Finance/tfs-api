import { HttpStatus, Injectable } from '@nestjs/common';
import { UkefId } from '@ukef/helpers/ukef-id.type';
import { AxiosResponse } from 'axios';
import { PinoLogger } from 'nestjs-pino';

import { CreateGiftFacilityAmendmentRequestDto, CreateGiftFacilityMultipleAmendmentsRequestDto, GiftWorkPackageResponseDto } from '../../dto';
import {
  hasObligationsWithMaturityDateNotFollowingFacility,
  isDecreaseAmountAmendment,
  isIncreaseAmountAmendment,
  isReplaceExpiryDateAmendment,
} from '../../helpers';
import { GiftAmountAmendmentService } from '../gift.amount-amendment.service';
import { GiftFacilityService } from '../gift.facility.service';
import { GiftReplaceExpiryDateAmendmentService } from '../gift.replace-expiry-date-amendment.service';
import { GiftStatusService } from '../gift.status.service';
import { GiftWorkPackageService } from '../gift.work-package.service';

interface HandleCreateAmendmentsParams {
  amendment: CreateGiftFacilityAmendmentRequestDto;
  facility: any;
  facilityId: UkefId;
  workPackageId: number;
}

interface CreateGiftFacilityAmendmentResponseDto {
  status: AxiosResponse['status'];
  data: GiftWorkPackageResponseDto;
}

/**
 * GIFT facility amendment service.
 * This is responsible for all facility amendment operations that call the GIFT API.
 */
@Injectable()
export class GiftFacilityAmendmentService {
  constructor(
    private readonly logger: PinoLogger,
    private readonly giftWorkPackageService: GiftWorkPackageService,
    private readonly giftFacilityService: GiftFacilityService,
    private readonly giftAmountAmendmentService: GiftAmountAmendmentService,
    private readonly giftReplaceExpiryDateAmendmentService: GiftReplaceExpiryDateAmendmentService,
    private readonly giftStatusService: GiftStatusService,
  ) {
    this.giftWorkPackageService = giftWorkPackageService;
    this.giftFacilityService = giftFacilityService;
    this.giftAmountAmendmentService = giftAmountAmendmentService;
    this.giftReplaceExpiryDateAmendmentService = giftReplaceExpiryDateAmendmentService;
    this.giftStatusService = giftStatusService;
  }

  /**
   * Check if a GIFT amendment was successful based on the response status.
   * @param {AxiosResponse<GiftWorkPackageResponseDto>} response
   * @returns {Boolean} true if the amendment was successful, false otherwise.
   */
  private wasAmendmentSuccessful(response: AxiosResponse<GiftWorkPackageResponseDto>): boolean {
    return response?.status === HttpStatus.CREATED;
  }

  /**
   * Handle the creation of GIFT facility amendments.
   * @param {HandleCreateAmendmentsParams} params - The parameters for creating the amendment.
   * @param {number} params.workPackageId - The work package ID for the amendment.
   * @param {any} params.facility - The facility data for the amendment.
   * @param {UkefId} params.facilityId - The facility ID for the amendment.
   * @param {CreateGiftFacilityAmendmentRequestDto} params.amendment - The amendment data.
   * @returns {Promise<GiftWorkPackageResponseDto | { status: number; data: GiftWorkPackageResponseDto }>} The result of the amendment operation.
   */
  async handleCreateAmendments({ workPackageId, facility, facilityId, amendment }: HandleCreateAmendmentsParams) {
    let createdAmendmentData: AxiosResponse<GiftWorkPackageResponseDto>;

    const { amendmentType } = amendment;

    const {
      obligations,
      riskDetails: { facilityCategoryCode },
    } = facility;

    const baseObligationParams = {
      amendmentType,
      facilityId,
      obligations,
      facilityCategoryCode,
      workPackageId,
    };

    /**
     * If the amendment is "increase amount", the new facility amount will impact the obligation amounts.
     * Execute in the following order:
     * 1) Amend the facility
     * 2) Amend obligations
     */
    if (isIncreaseAmountAmendment(amendment)) {
      const {
        amendmentData: { amount: newFacilityAmount, date },
      } = amendment;

      const facilityAmendmentResponse = await this.giftAmountAmendmentService.facility({ ...amendment, facilityId, workPackageId });

      if (!this.wasAmendmentSuccessful(facilityAmendmentResponse)) {
        return {
          status: facilityAmendmentResponse?.status,
          data: facilityAmendmentResponse?.data,
        };
      }

      createdAmendmentData = facilityAmendmentResponse;

      await this.giftAmountAmendmentService.obligations({ ...baseObligationParams, date, newFacilityAmount });
    }

    /**
     * If the amendment is "decrease amount", the new facility amount will impact the obligation amounts.
     * Execute in the following order:
     * 1) Amend obligations
     * 2) Amend the facility
     */
    if (isDecreaseAmountAmendment(amendment)) {
      const {
        amendmentData: { amount: newFacilityAmount, date },
      } = amendment;

      await this.giftAmountAmendmentService.obligations({ ...baseObligationParams, date, newFacilityAmount });

      const facilityAmendmentResponse = await this.giftAmountAmendmentService.facility({ ...amendment, facilityId, workPackageId });

      if (!this.wasAmendmentSuccessful(facilityAmendmentResponse)) {
        return {
          status: facilityAmendmentResponse?.status,
          data: facilityAmendmentResponse?.data,
        };
      }

      createdAmendmentData = facilityAmendmentResponse;
    }

    /**
     * If the amendment is "replace expiry date",
     * and any obligation has maturityDateFollowsFacility=true,
     * GIFT will automatically update the obligation maturity dates to match the new facility expiry date.
     *
     * However, if any obligation has maturityDateFollowsFacility=false,
     * GIFT will not update the obligation maturity dates, so we need to update them manually.
     *
     * If the new expiry date is greater than the current expiry date, execute in the following order:
     * 1) Amend the facility
     * 2) Amend obligations maturity dates
     *
     * If the new expiry date is less than the current expiry date, the order is reversed.
     *
     * Otherwise, there is no need to update obligations maturity dates.
     */
    if (isReplaceExpiryDateAmendment(amendment)) {
      const {
        amendmentData: { expiryDate },
      } = amendment;

      const { expiryDate: originalFacilityExpiryDate } = facility;

      const shouldUpdateObligationsMaturityDates = hasObligationsWithMaturityDateNotFollowingFacility(obligations);

      const isExpiryDateEarlierThanOriginal = new Date(expiryDate).getTime() < new Date(originalFacilityExpiryDate).getTime();

      const baseParams = {
        amendmentType,
        facilityId,
        workPackageId,
      };

      if (isExpiryDateEarlierThanOriginal) {
        await this.giftReplaceExpiryDateAmendmentService.accrualSchedules({ ...baseParams, expiryDate, obligations });

        if (shouldUpdateObligationsMaturityDates) {
          await this.giftReplaceExpiryDateAmendmentService.obligations({ ...baseParams, facilityExpiryDate: expiryDate, obligations });
        }

        const dateResponse = await this.giftReplaceExpiryDateAmendmentService.facility({ ...baseParams, expiryDate });

        if (!this.wasAmendmentSuccessful(dateResponse)) {
          return {
            status: dateResponse.status,
            data: dateResponse.data,
          };
        }

        createdAmendmentData = dateResponse;
      } else {
        const dateResponse = await this.giftReplaceExpiryDateAmendmentService.facility({ ...baseParams, expiryDate });

        if (!this.wasAmendmentSuccessful(dateResponse)) {
          return {
            status: dateResponse.status,
            data: dateResponse.data,
          };
        }

        if (shouldUpdateObligationsMaturityDates) {
          await this.giftReplaceExpiryDateAmendmentService.obligations({ ...baseParams, facilityExpiryDate: expiryDate, obligations });
        }

        await this.giftReplaceExpiryDateAmendmentService.accrualSchedules({ ...baseParams, expiryDate, obligations });

        createdAmendmentData = dateResponse;
      }
    }

    if (!createdAmendmentData) {
      throw new Error(`Unsupported amendment type: ${amendmentType}`);
    }

    return createdAmendmentData;
  }

  /**
   * Create a GIFT facility amendment
   * 1) Create a new GIFT work package.
   * 2) Create the appropriate GIFT "configuration events" for the amendment.
   * 3) Approve the GIFT work package.
   * As a result, GIFT will have a new, approved work package in the facility, with multiple amendments in the work package.
   *
   * If there is an error creating the amendment, the previous created work package will be deleted.
   * @param {UkefId} facilityId: Facility ID
   * @param {CreateGiftFacilityAmendmentRequestDto} amendmentData: Amendment data
   * @throws {Error} If there is an error creating the amendment or the work package.
   * @returns {Promise<CreateGiftFacilityAmendmentResponseDto>}
   */
  async create(facilityId: UkefId, amendment: CreateGiftFacilityAmendmentRequestDto): Promise<CreateGiftFacilityAmendmentResponseDto> {
    const { amendmentType } = amendment;

    try {
      this.logger.info('Creating amendment %s for facility %s', amendmentType, facilityId);

      const facilityResponse = await this.giftFacilityService.get(facilityId);

      if (facilityResponse.status !== HttpStatus.OK) {
        return {
          status: facilityResponse.status,
          data: facilityResponse.data,
        };
      }

      const { data: facility } = facilityResponse;

      /**
       * Generate a GIFT work package.
       * The amendment will be in this work package.
       */
      const { data: workPackage, status } = await this.giftWorkPackageService.create(facilityId);

      if (status !== HttpStatus.CREATED) {
        this.logger.error('Error creating work package for facility %s amendment %o', facilityId, amendmentType);

        return {
          status,
          data: workPackage,
        };
      }

      const { id: workPackageId } = workPackage;

      const amendmentResponse = await this.handleCreateAmendments({ workPackageId, facility, facilityId, amendment });

      // If amendment failed, delete the work package and return the error response.
      if (amendmentResponse && 'status' in amendmentResponse && amendmentResponse.status !== HttpStatus.CREATED) {
        this.logger.error('Error creating amendment %s for facility %s', amendment.amendmentType, facilityId);

        try {
          await this.giftWorkPackageService.delete(workPackageId, facilityId);
        } catch (deleteError) {
          this.logger.error('Error deleting work package %s for facility %s %o', workPackageId, facilityId, deleteError);
        }

        return amendmentResponse;
      }

      // const approvalResponse = await this.approveWorkPackage(facilityId, workPackageId);

      let approvalResponse;

      try {
        approvalResponse = await this.approveWorkPackage(facilityId, workPackageId);
      } catch (approvalError) {
        this.logger.error('Error approving work package %s for facility %s amendment - deleting work package %o', workPackageId, facilityId, approvalError);

        // extract status from approvalError - might be nested in cause
        let errorStatus: number | undefined;
        let errorData: any;

        const errorWithStatus = approvalError as Error & { status?: number; data?: any; cause?: any };

        // first try direct access (error is directly thrown with status)
        if (errorWithStatus.status) {
          errorStatus = errorWithStatus.status;
          errorData = (errorWithStatus.cause as any)?.data;
        }

        try {
          await this.giftWorkPackageService.delete(workPackageId, facilityId);
        } catch (deleteError) {
          this.logger.error('Error deleting work package %s for facility amendment %s %o', workPackageId, facilityId, deleteError);
        }

        // Return the approval error regardless of delete result
        return {
          status: errorStatus ?? HttpStatus.INTERNAL_SERVER_ERROR,
          data: errorData ?? { statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: 'Internal server error' },
        };
      }

      return {
        status: HttpStatus.CREATED,
        data: {
          ...(amendmentResponse.data ?? approvalResponse.data),
          isApproved: true,
        },
      };
    } catch (error) {
      this.logger.error('Error creating amendment %s for facility %s %o', amendmentType, facilityId, error);

      throw new Error(`Error creating amendment ${amendmentType} for facility ${facilityId}`, { cause: error });
    }
  }

  /**
   * Create multiple GIFT facility amendments in one work package.
   * @param {UkefId} facilityId: Facility ID
   * @param {CreateGiftFacilityMultipleAmendmentsRequestDto} amendments: Amendments data
   * @throws {Error} If there is an error creating the amendments or the work package.
   * @returns {Promise<CreateGiftFacilityAmendmentResponseDto>}
   */
  async createMultiple(facilityId: UkefId, payload: CreateGiftFacilityMultipleAmendmentsRequestDto): Promise<CreateGiftFacilityAmendmentResponseDto> {
    try {
      this.logger.info('Creating multiple amendments for facility %s', facilityId);

      const facilityResponse = await this.giftFacilityService.get(facilityId);

      if (facilityResponse.status !== HttpStatus.OK) {
        return {
          status: facilityResponse.status,
          data: facilityResponse.data,
        };
      }

      const { data: facility } = facilityResponse;

      /**
       * Generate a GIFT work package.
       * All amendments will be in this work package.
       */
      const { data: workPackage, status } = await this.giftWorkPackageService.create(facilityId);

      if (status !== HttpStatus.CREATED) {
        this.logger.error('Error creating work package for facility %s multiple amendments', facilityId);

        return {
          status,
          data: workPackage,
        };
      }

      const { id: workPackageId } = workPackage;

      let amendmentResponse;
      let amendmentError = false;
      const approvalError = false;

      for (const amendment of payload.amendments) {
        const response = await this.handleCreateAmendments({ workPackageId, facility, facilityId, amendment });

        if (response?.status !== HttpStatus.CREATED) {
          amendmentError = true;

          amendmentResponse = response;

          this.logger.error('Error creating amendment %s for facility %s in multiple amendments', amendment.amendmentType, facilityId);
        }
      }

      let approvalResponse;

      try {
        approvalResponse = await this.approveWorkPackage(facilityId, workPackageId);
      } catch (approvalError) {
        approvalError = true;

        this.logger.error(
          'Error approving work package %s for facility %s in multiple amendments - deleting work package %o',
          workPackageId,
          facilityId,
          approvalError,
        );
      }

      if (amendmentError || approvalError) {
        let hasDeleteError = false;
        let deleteError;

        try {
          const response = await this.giftWorkPackageService.delete(workPackageId, facilityId);

          if (response?.status !== HttpStatus.NO_CONTENT) {
            hasDeleteError = true;
            deleteError = response;
          }
        } catch (error) {
          hasDeleteError = true;
          deleteError = error;

          this.logger.error('Error deleting work package %s for facility %s in multiple amendments %o', workPackageId, facilityId, deleteError);
        } finally {
          if (hasDeleteError) {
            return {
              status: deleteError?.status,
              data: deleteError?.data,
            };
          }

          return {
            status: amendmentError ? amendmentResponse?.status : approvalResponse?.status,
            data: amendmentError ? amendmentResponse?.data : approvalResponse?.data,
          };
        }
      }

      return {
        status: approvalResponse?.status,
        data: approvalResponse?.data,
      };
    } catch (error) {
      this.logger.error('Error creating multiple amendments for facility %s %o', facilityId, error);

      throw new Error(`Error creating multiple amendments for facility ${facilityId}`, { cause: error });
    }
  }

  /**
   * Approves a work package for a given facility.
   * @param {UkefId} facilityId The ID of the facility.
   * @param {number} workPackageId The ID of the work package.
   * @returns {Promise<GiftWorkPackageResponseDto>} The approval response.
   * @throws {Error}
   */
  async approveWorkPackage(facilityId: UkefId, workPackageId: number) {
    try {
      this.logger.info('Approving amendment work package %s for facility %s', workPackageId, facilityId);

      const approvalResponse = await this.giftStatusService.approved(facilityId, workPackageId);

      if (approvalResponse.status !== HttpStatus.OK) {
        this.logger.error('Error approving amendment work package %s for facility %s %o', workPackageId, facilityId, approvalResponse.data);

        throw new Error(`Error approving amendment work package ${workPackageId} for facility ${facilityId}`, { cause: approvalResponse });
      }

      return approvalResponse;
    } catch (error) {
      this.logger.error('Error approving amendment work package %s for facility %s %o', workPackageId, facilityId, error);

      /**
       * Intentionally throw error with a status property
       * so that the status can be surfaced.
       */
      const errorWithStatus = error as any;

      if (errorWithStatus.status) {
        throw error;
      }

      throw new Error(`Error approving amendment work package ${workPackageId} for facility ${facilityId}`, { cause: error });
    }
  }
}
