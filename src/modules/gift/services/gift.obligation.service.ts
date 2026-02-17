import { Injectable } from '@nestjs/common';
import { GIFT } from '@ukef/constants';
import { AxiosResponse } from 'axios';
import { PinoLogger } from 'nestjs-pino';

import { GiftObligationRequestDto } from '../dto';
import { GiftHttpService } from './gift.http.service';

const { EVENT_TYPES, PATH } = GIFT;

/**
 * GIFT obligation service.
 * This is responsible for all obligation operations that call the GIFT API.
 */
@Injectable()
export class GiftObligationService {
  constructor(
    private readonly giftHttpService: GiftHttpService,
    private readonly logger: PinoLogger,
  ) {
    this.giftHttpService = giftHttpService;
  }

  /**
   * Create a GIFT obligation
   * @param {GiftObligationRequestDto} obligationData: Obligation data
   * @param {string} facilityId: Facility ID
   * @param {number} workPackageId: Facility work package ID
   * @returns {Promise<AxiosResponse>}
   * @throws {Error}
   */
  async createOne(obligationData: GiftObligationRequestDto, facilityId: string, workPackageId: number): Promise<AxiosResponse> {
    try {
      this.logger.info('Creating an obligation with amount %s for facility %s', obligationData.amount, facilityId);

      /**
       * GIFT requires a null acbsObligationId.
       * This field is not relevant for consumers of APIM TFS.
       * This is purely for GIFT version 1, for ACBS migration.
       */
      const payload = {
        ...obligationData,
        acbsObligationId: null,
      };

      const response = await this.giftHttpService.post<GiftObligationRequestDto>({
        path: `${PATH.FACILITY}/${facilityId}${PATH.WORK_PACKAGE}/${workPackageId}${PATH.CONFIGURATION_EVENT}/${EVENT_TYPES.ADD_OBLIGATION}`,
        payload,
      });

      return response;
    } catch (error) {
      this.logger.error('Error creating an obligation with amount %s for facility %s %o', obligationData.amount, facilityId, error);

      throw new Error(`Error creating an obligation with amount ${obligationData.amount} for facility ${facilityId}`);
    }
  }

  /**
   * Create multiple GIFT obligations
   * @param {Array<GiftObligationRequestDto>} obligations: Obligations data
   * @param {string} facilityId: Facility ID
   * @param {number} workPackageId: Facility work package ID
   * @returns {Promise<Array<AxiosResponse>>}
   * @throws {Error}
   */
  async createMany(obligationsData: GiftObligationRequestDto[], facilityId: string, workPackageId: number): Promise<Array<AxiosResponse>> {
    try {
      this.logger.info('Creating obligations for facility %s', facilityId);

      /**
       * NOTE: We need to use a for loop instead of Promise.all, to ensure that the calls are sequential.
       * Promise.all is not sequential.
       */
      const responses = [];

      for (const obligations of obligationsData) {
        const response = await this.createOne(obligations, facilityId, workPackageId);

        responses.push(response);
      }

      return responses;
    } catch (error) {
      this.logger.error('Error creating obligations for facility %s %o', facilityId, error);

      throw new Error(`Error creating obligations for facility ${facilityId}`, { cause: error });
    }
  }
}
