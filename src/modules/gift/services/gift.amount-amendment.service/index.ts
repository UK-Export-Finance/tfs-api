import { HttpStatus, Injectable } from '@nestjs/common';
import { AMEND_FACILITY_PREFIX_TYPES, AmendFacilityType, FacilityCategoryCode, GIFT } from '@ukef/constants';
import { UkefId } from '@ukef/helpers/ukef-id.type';
import { AxiosResponse } from 'axios';
import { PinoLogger } from 'nestjs-pino';

import { DecreaseAmountDto, GiftWorkPackageResponseDto, IncreaseAmountDto, ReplaceExpiryDateDto } from '../../dto';
import { calculatePercentageAmount } from '../../helpers';
import { GiftHttpService } from '../gift.http.service';

const {
  AMEND_OBLIGATION_AMOUNT: { PERCENTAGE_OF_FACILITY_AMOUNT },
  PATH,
} = GIFT;

type ParamsBase = {
  amendmentType: AmendFacilityType;
  facilityId: UkefId;
  workPackageId: number;
};

type AmendFacilityAmountParams = ParamsBase & {
  amendmentData: IncreaseAmountDto | DecreaseAmountDto | ReplaceExpiryDateDto;
};

type AmendObligationsParams = ParamsBase & {
  date: string;
  facilityCategoryCode: FacilityCategoryCode;
  newFacilityAmount: number;
  obligations: { id: string }[];
};

/**
 * GIFT "amount" amendment service.
 * This is responsible for all "amount" amendment operations that call the GIFT API.
 */
@Injectable()
export class GiftAmountAmendmentService {
  constructor(
    private readonly giftHttpService: GiftHttpService,
    private readonly logger: PinoLogger,
  ) {
    this.giftHttpService = giftHttpService;
    this.logger = logger;
  }

  /**
   * Amend the facility amount for a given facility and work package.
   * @param {AmendFacilityAmountParams} params - Parameters for the amendment.
   * @returns {Promise<AxiosResponse>}
   * @throws {Error}
   */
  async facility({ amendmentData, amendmentType, facilityId, workPackageId }: AmendFacilityAmountParams): Promise<AxiosResponse> {
    try {
      this.logger.info('Amending facility amount %s for facility %s work package %s', amendmentType, facilityId, workPackageId);

      /**
       * Construct the full "configuration event type" string for GIFT.
       * By doing this in APIM, it provides consumers with a simpler payload requirement.
       * I.e, "IncreaseAmount" rather than "AmendFacility_IncreaseAmount".
       */
      const facilityAmendmentTypeString = `AmendFacility_${amendmentType}`;

      const path = `${PATH.FACILITY}/${facilityId}${PATH.WORK_PACKAGE}/${workPackageId}${PATH.CONFIGURATION_EVENT}/${facilityAmendmentTypeString}`;

      const facilityAmendmentResponse = await this.giftHttpService.post<GiftWorkPackageResponseDto>({
        path,
        payload: amendmentData,
      });

      if (facilityAmendmentResponse.status !== HttpStatus.CREATED) {
        this.logger.error('Error creating amendment %s for work package %s facility %s. Deleting work package', amendmentType, workPackageId, facilityId);

        await this.giftHttpService.delete<GiftWorkPackageResponseDto>({
          path: `${PATH.WORK_PACKAGE}/${workPackageId}`,
        });

        return facilityAmendmentResponse;
      }

      return facilityAmendmentResponse;
    } catch (error) {
      this.logger.error('Error amending facility amount %s for facility %s work package %s %o', amendmentType, facilityId, workPackageId, error);

      throw new Error(`Error amending facility amount ${amendmentType} for facility ${facilityId} work package ${workPackageId}`, { cause: error });
    }
  }

  /**
   * Amend the obligations for a given facility and work package.
   * @param {AmendObligationsParams} params - Parameters for the amendment.
   * @returns {Promise<void>}
   * @throws {Error}
   */
  async obligations({ amendmentType, newFacilityAmount, date, facilityId, obligations, facilityCategoryCode, workPackageId }: AmendObligationsParams) {
    try {
      this.logger.info('Amending facility obligation amounts %s for facility %s work package %s', amendmentType, facilityId, workPackageId);

      const basePath = `${PATH.FACILITY}/${facilityId}${PATH.WORK_PACKAGE}/${workPackageId}${PATH.CONFIGURATION_EVENT}`;

      /**
       * NOTE: currently only 1x obligation will exist for a facility.
       * Need to update this logic if an integration has more than 1x obligation.
       */
      const percentage = PERCENTAGE_OF_FACILITY_AMOUNT[`${facilityCategoryCode}`];

      const newObligationAmount = calculatePercentageAmount(newFacilityAmount, percentage);

      /**
       * NOTE: We need to use a for loop instead of Promise.all, to ensure that the calls are sequential.
       * Promise.all is not sequential.
       */
      const responses = [];

      for (const obligation of obligations) {
        const payload = {
          obligationId: obligation.id,
          date,
          amount: newObligationAmount,
        };

        const response = await this.giftHttpService.post<GiftWorkPackageResponseDto>({
          path: `${basePath}/${AMEND_FACILITY_PREFIX_TYPES.AMEND_OBLIGATION}${amendmentType}`,
          payload,
        });

        responses.push(response);
      }

      return responses;
    } catch (error) {
      this.logger.error('Error amending facility obligation amounts %s for facility %s work package %s %o', amendmentType, facilityId, workPackageId, error);

      throw new Error(`Error amending facility obligation amounts ${amendmentType} for facility ${facilityId} work package ${workPackageId}`, { cause: error });
    }
  }
}
