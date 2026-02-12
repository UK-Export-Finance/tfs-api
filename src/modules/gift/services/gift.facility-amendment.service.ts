import { HttpStatus, Injectable } from '@nestjs/common';
import { GIFT } from '@ukef/constants';
import { PinoLogger } from 'nestjs-pino';

import { GiftFacilityAmendmentRequestDto, GiftWorkPackageResponseDto } from '../dto';
import { GiftHttpService } from './gift.http.service';
import { GiftWorkPackageService } from './gift.work-package.service';

const { PATH } = GIFT;

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
   * @returns {Promise<AxiosResponse>}
   */
  async create(facilityId: string, amendmentData: GiftFacilityAmendmentRequestDto) {
    try {
      const { amendmentType } = amendmentData;

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
          status,
          data: workPackage,
        };
      }

      // TODO: validation handling

      // TODO: create ticket
      // TODO: auto approve the work package

      const returnResponse = {
        status: HttpStatus.CREATED,
        data: amendmentResponse.data,
      };

      return returnResponse;
    } catch (error) {
      this.logger.error('Error creating amendment for facility %s %o', facilityId, error);

      throw new Error(`Error creating amendment for facility ${facilityId}`, error);
    }
  }
}
