import { Injectable } from '@nestjs/common';
import { GIFT } from '@ukef/constants';
import { AxiosResponse } from 'axios';
import { PinoLogger } from 'nestjs-pino';

import { GiftObligationRequestDto } from './dto';
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
   * @param {String} facilityId: Facility ID
   * @param {Number} workPackageId: Facility work package ID
   * @returns {Promise<AxiosResponse>}
   * @throws {Error}
   */
  async createOne(obligationData: GiftObligationRequestDto, facilityId: string, workPackageId: number): Promise<AxiosResponse> {
    try {
      this.logger.info('Creating an obligation with amount %s for facility %s', obligationData.amount, facilityId);

      const response = await this.giftHttpService.post<GiftObligationRequestDto>({
        path: `${PATH.FACILITY}/${facilityId}${PATH.WORK_PACKAGE}/${workPackageId}${PATH.CONFIGURATION_EVENT}/${EVENT_TYPES.CREATE_OBLIGATION}`,
        payload: obligationData,
      });

      return response;
    } catch (error) {
      this.logger.error('Error creating an obligation with amount %s for facility %s %o', obligationData.amount, facilityId, error);

      throw new Error(`Error creating an obligation with amount ${obligationData.amount} for facility ${facilityId}`, error);
    }
  }

  /**
   * Create multiple GIFT obligations
   * @param {Array<GiftObligationRequestDto>} obligations: Obligations data
   * @param {String} facilityId: Facility ID
   * @param {Number} workPackageId: Facility work package ID
   * @returns {Promise<Array<AxiosResponse>>}
   * @throws {Error}
   */
  async createMany(obligations: GiftObligationRequestDto[], facilityId: string, workPackageId: number): Promise<Array<AxiosResponse>> {
    try {
      this.logger.info('Creating obligations for facility %s', facilityId);

      const responses = await Promise.all(obligations.map((repaymentProfile) => this.createOne(repaymentProfile, facilityId, workPackageId)));

      return responses;
    } catch (error) {
      this.logger.error('Error creating obligations for facility %s %o', facilityId, error);

      throw new Error(`Error creating obligations for facility ${facilityId}`, error);
    }
  }
}
