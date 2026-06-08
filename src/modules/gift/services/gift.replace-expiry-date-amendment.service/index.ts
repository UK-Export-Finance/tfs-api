import { Injectable } from '@nestjs/common';
import { GIFT } from '@ukef/constants';
import { GiftAmendmentBaseParams } from '@ukef/types';
import { PinoLogger } from 'nestjs-pino';

import { GiftWorkPackageResponseDto } from '../../dto';
import { GiftHttpService } from '../gift.http.service';

const {
  AMEND_FACILITY_PREFIX_TYPES,
  AMEND_FACILITY_TYPES: { AMEND_OBLIGATION_REPLACE_MATURITY_DATE },
  EVENT_TYPES: { AMEND_FACILITY_REPLACE_EXPIRY_DATE },
  PATH,
} = GIFT;

type ObligationsParams = GiftAmendmentBaseParams & {
  facilityExpiryDate: string;
  obligations: { id: string }[];
};

type FacilityParams = GiftAmendmentBaseParams & {
  expiryDate: string;
};

/**
 * GIFT 'replace expiry date' amendment service.
 * This is responsible for the 'replace expiry date" amendment operations that call the GIFT API.
 */
@Injectable()
export class GiftReplaceExpiryDateAmendmentService {
  constructor(
    private readonly giftHttpService: GiftHttpService,
    private readonly logger: PinoLogger,
  ) {
    this.giftHttpService = giftHttpService;
    this.logger = logger;
  }

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

  async facility({ amendmentType, expiryDate, facilityId, workPackageId }: FacilityParams) {
    try {
      this.logger.info('Amending facility expiry date %s for facility %s work package %s', amendmentType, facilityId, workPackageId);

      const path = `${PATH.FACILITY}/${facilityId}${PATH.WORK_PACKAGE}/${workPackageId}${PATH.CONFIGURATION_EVENT}/${AMEND_FACILITY_REPLACE_EXPIRY_DATE}`;

      const payload = { expiryDate };

      const response = await this.giftHttpService.post<GiftWorkPackageResponseDto>({
        path,
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
