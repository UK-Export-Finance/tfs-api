import { HttpStatus, Injectable } from '@nestjs/common';
import { GIFT } from '@ukef/constants';
import { AxiosResponse } from 'axios';
import { PinoLogger } from 'nestjs-pino';

import { GiftFacilityAmendmentRequestDto, GiftWorkPackageResponseDto } from '../../dto';
import { GiftHttpService } from '../gift.http.service';
import { GiftWorkPackageService } from '../gift.work-package.service';

const { PATH } = GIFT;

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
    private readonly giftHttpService: GiftHttpService,
    private readonly logger: PinoLogger,
    private readonly giftWorkPackageService: GiftWorkPackageService,
  ) {
    this.giftHttpService = giftHttpService;
    this.giftWorkPackageService = giftWorkPackageService;
  }

  /**
   * Create a GIFT facility amendment
   * 1) Create a new GIFT work package
   * 2) Create a new GIFT "configuration event" for the amendment.
   * As a result, GIFT will have a new work package in the facility, with an amendment in the facility's work package.
   * @param {string} facilityId: Facility ID
   * @param {GiftFacilityAmendmentRequestDto} amendmentData: Amendment data
   * @returns {Promise<CreateFacilityAmendmentResponse>}
   */
  async create(facilityId: string, amendment: GiftFacilityAmendmentRequestDto): Promise<CreateGiftFacilityAmendmentResponseDto> {
    const { amendmentType, amendmentData } = amendment;

    try {
      this.logger.info('Creating amendment %s for facility %s', amendmentType, facilityId);

      const { data: workPackage, status } = await this.giftWorkPackageService.create(facilityId);

      if (status !== HttpStatus.CREATED) {
        this.logger.error('Error creating work package for facility %s amendment %o', facilityId);

        return {
          status,
          data: workPackage,
        };
      }

      const { id: workPackageId } = workPackage;

      /**
       * Construct the full "configuration event type" string for GIFT.
       * By doing this in APIM, it provides consumers with a simpler payload requirement.
       * I.e, "IncreaseAmount" rather than "AmendFacility_IncreaseAmount".
       */
      const configTypeString = `AmendFacility_${amendmentType}`;

      const amendmentResponse = await this.giftHttpService.post<GiftWorkPackageResponseDto>({
        path: `${PATH.FACILITY}/${facilityId}${PATH.WORK_PACKAGE}/${workPackageId}${PATH.CONFIGURATION_EVENT}/${configTypeString}`,
        payload: amendmentData,
      });

      if (amendmentResponse.status !== HttpStatus.CREATED) {
        this.logger.error('Error creating amendment %s for work package %s facility %s', amendmentType, workPackageId, facilityId);

        return {
          status: amendmentResponse.status,
          data: workPackage,
        };
      }

      // TODO: GIFT-20330 - auto approve the work package
      // TODO: GIFT-20331 - validation handling

      const returnResponse = {
        status: HttpStatus.CREATED,
        data: amendmentResponse.data,
      };

      return returnResponse;
    } catch (error) {
      this.logger.error('Error creating amendment %s for facility %s %o', amendmentType, facilityId, error);

      // TODO: update all error instances with { cause: error } / create ticket.
      throw new Error(`Error creating amendment ${amendmentType} for facility ${facilityId}`, { cause: error });
    }
  }
}
