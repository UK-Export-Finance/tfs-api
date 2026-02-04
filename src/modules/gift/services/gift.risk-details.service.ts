import { Injectable } from '@nestjs/common';
import { GIFT } from '@ukef/constants';
import { AxiosResponse } from 'axios';
import { PinoLogger } from 'nestjs-pino';

import { GiftBusinessCalendarsConventionResponseDto } from '../dto';
import { GiftFacilityRiskDetailsRequestDto } from '../dto/request/risk-details';
import { GiftHttpService } from './gift.http.service';

const { EVENT_TYPES, INTEGRATION_DEFAULTS, PATH } = GIFT;

/**
 * GIFT "risk details" service.
 * This is responsible for all "risk details" operations that call the GIFT API.
 */
@Injectable()
export class GiftRiskDetailsService {
  constructor(
    private readonly giftHttpService: GiftHttpService,
    private readonly logger: PinoLogger,
  ) {
    this.giftHttpService = giftHttpService;
  }

  /**
   * Create a GIFT "risk details".
   * @param {CreateOneParams} facilityId, workPackageId
   * @returns {Promise<AxiosResponse>}
   * @throws {Error}
   */
  async createOne(riskDetailsData: GiftFacilityRiskDetailsRequestDto, facilityId: string, workPackageId: number): Promise<AxiosResponse> {
    try {
      this.logger.info('Creating risk details for facility %s', facilityId);

      const response = await this.giftHttpService.post<GiftBusinessCalendarsConventionResponseDto>({
        path: `${PATH.FACILITY}/${facilityId}${PATH.WORK_PACKAGE}/${workPackageId}${PATH.CONFIGURATION_EVENT}/${EVENT_TYPES.ADD_RISK_DETAILS}`,
        payload: {
          ...riskDetailsData,
          overrideRiskRatingId: INTEGRATION_DEFAULTS.OVERRIDE_RISK_RATING_ID,
          overrideLossGivenDefault: INTEGRATION_DEFAULTS.OVERRIDE_LOSS_GIVEN_DEFAULT,
          riskReassessmentDate: INTEGRATION_DEFAULTS.RISK_REASSESSMENT_DATE,
        },
      });

      return response;
    } catch (error) {
      this.logger.error('Error creating risk details for facility %s %o', facilityId, error);

      throw new Error(`Error creating risk details for facility ${facilityId}`, error);
    }
  }
}
