import { HttpStatus, Injectable } from '@nestjs/common';
import { UkefId } from '@ukef/helpers/ukef-id.type';
import { AxiosResponse } from 'axios';
import { PinoLogger } from 'nestjs-pino';

import { CreateGiftFacilityAmendmentRequestDto, GiftWorkPackageResponseDto } from '../../dto';
import { isDecreaseAmountAmendment, isIncreaseAmountAmendment } from '../../helpers';
import { GiftAmountAmendmentService } from '../gift.amount-amendment.service';
import { GiftFacilityService } from '../gift.facility.service';
import { GiftStatusService } from '../gift.status.service';
import { GiftWorkPackageService } from '../gift.work-package.service';

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
    private readonly giftStatusService: GiftStatusService,
  ) {
    this.giftWorkPackageService = giftWorkPackageService;
    this.giftFacilityService = giftFacilityService;
    this.giftAmountAmendmentService = giftAmountAmendmentService;
    this.giftStatusService = giftStatusService;
  }

  /**
   * Create a GIFT facility amendment
   * 1) Create a new GIFT work package
   * 2) Create a new GIFT "configuration event" for the amendment.
   * 3) Approve the GIFT work package.
   * As a result, GIFT will have a new, approved work package in the facility, with an amendment in the work package.
   *
   * If there is an error creating the amendment, the previous created work package will be deleted.
   * @param {UkefId} facilityId: Facility ID
   * @param {CreateGiftFacilityAmendmentRequestDto} amendmentData: Amendment data
   * @throws {Error} If there is an error creating the amendment or the work package.
   * @returns {Promise<CreateGiftFacilityAmendmentResponseDto>}
   */
  async create(facilityId: UkefId, amendment: CreateGiftFacilityAmendmentRequestDto): Promise<CreateGiftFacilityAmendmentResponseDto> {
    const { amendmentType } = amendment;
    let createdAmendmentData: GiftWorkPackageResponseDto | null = null;

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
       * All amendments will be in this work package.
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

        createdAmendmentData = facilityAmendmentResponse.data;

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

        createdAmendmentData = facilityAmendmentResponse.data;
      }

      const approvalResponse = await this.approveWorkPackage(facilityId, workPackageId);

      // TODO: GIFT-20331 - validation handling

      const returnResponse = {
        status: HttpStatus.CREATED,
        data: {
          ...(createdAmendmentData ?? approvalResponse.data),
          isApproved: true,
        },
      };

      return returnResponse;
    } catch (error) {
      this.logger.error('Error creating amendment %s for facility %s %o', amendmentType, facilityId, error);

      throw new Error(`Error creating amendment ${amendmentType} for facility ${facilityId}`, { cause: error });
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

        throw new Error(`Error approving amendment work package ${workPackageId} for facility ${facilityId} amendment`, {
          cause: {
            data: approvalResponse.data,
            status: approvalResponse.status,
          },
        });
      }

      return approvalResponse;
    } catch (error) {
      this.logger.error('Error approving amendment work package %s for facility %s %o', workPackageId, facilityId, error);

      throw new Error(`Error approving amendment work package ${workPackageId} for facility ${facilityId}`, { cause: error });
    }
  }
}
