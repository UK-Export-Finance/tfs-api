import { Injectable } from '@nestjs/common';
import { GIFT } from '@ukef/constants';
import { AxiosResponse } from 'axios';

import { GiftObligationDto } from './dto';
import { GiftHttpService } from './gift-http.service';

const { PATH } = GIFT;

/**
 * GIFT obligation service.
 * This is responsible for all obligation operations that call the GIFT API.
 */
@Injectable()
export class GiftObligationService {
  constructor(private readonly giftHttpService: GiftHttpService) {
    this.giftHttpService = giftHttpService;
  }

  /**
   * Create a GIFT obligation
   * @param {GiftObligationDto} payload: Repayment profile data
   * @param {Number} workPackageId: Facility work package ID
   * @returns {Promise<AxiosResponse>}
   * @throws {Error}
   */
  async createOne(payload: GiftObligationDto, workPackageId: number): Promise<AxiosResponse> {
    try {
      const response = await this.giftHttpService.post<GiftObligationDto>({
        path: `${PATH.WORK_PACKAGE}/${workPackageId}${PATH.OBLIGATION}${PATH.CREATION_EVENT}`,
        payload,
      });

      return response;
    } catch (error) {
      console.error('Error creating obligation %o', error);

      throw new Error('Error creating obligation', error);
    }
  }

  /**
   * Create multiple GIFT obligations
   * @param {Array<GiftObligationDto>} obligations: Obligations data
   * @param {Number} workPackageId: Facility work package ID
   * @returns {Promise<Array<AxiosResponse>>}
   * @throws {Error}
   */
  async createMany(obligations: GiftObligationDto[], workPackageId: number): Promise<Array<AxiosResponse>> {
    try {
      const responses = await Promise.all(obligations.map((repaymentProfile) => this.createOne(repaymentProfile, workPackageId)));

      return responses;
    } catch (error) {
      console.error('Error creating obligations %o', error);

      throw new Error('Error creating obligations', error);
    }
  }
}
