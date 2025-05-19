import { Injectable } from '@nestjs/common';
import { GIFT } from '@ukef/constants';
import { AxiosResponse } from 'axios';
import { PinoLogger } from 'nestjs-pino';

import { GiftObligationDto } from './dto';
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
   * @param {GiftObligationDto} obligationData: Obligation data
   * @param {String} facilityId: Facility ID
   * @param {Number} workPackageId: Facility work package ID
   * @returns {Promise<AxiosResponse>}
   * @throws {Error}
   */
  async createOne(obligationData: GiftObligationDto, facilityId: string, workPackageId: number): Promise<AxiosResponse> {
    try {
      const response = await this.giftHttpService.post<GiftObligationDto>({
        path: `${PATH.FACILITY}/${facilityId}${PATH.WORK_PACKAGE}/${workPackageId}${PATH.CONFIGURATION_EVENT}/${EVENT_TYPES.CREATE_OBLIGATION}`,
        payload: obligationData,
      });

      return response;
    } catch (error) {
      this.logger.error('Error creating obligation %o', error);

      throw new Error('Error creating obligation', error);
    }
  }

  /**
   * Create multiple GIFT obligations
   * @param {Array<GiftObligationDto>} obligations: Obligations data
   * @param {String} facilityId: Facility ID
   * @param {Number} workPackageId: Facility work package ID
   * @returns {Promise<Array<AxiosResponse>>}
   * @throws {Error}
   */
  async createMany(obligations: GiftObligationDto[], facilityId: string, workPackageId: number): Promise<Array<AxiosResponse>> {
    try {
      const responses = await Promise.all(obligations.map((repaymentProfile) => this.createOne(repaymentProfile, facilityId, workPackageId)));

      return responses;
    } catch (error) {
      this.logger.error('Error creating obligations %o', error);

      throw new Error('Error creating obligations', error);
    }
  }
}
