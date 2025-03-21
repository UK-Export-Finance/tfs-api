import { Injectable } from '@nestjs/common';
import { GIFT } from '@ukef/constants';
import { UkefId } from '@ukef/helpers';
import { AxiosResponse } from 'axios';

import { GiftFacilityDto } from './dto';
import { GiftHttpService } from './gift-http.service';

/**
 * GIFT service.
 * This is responsible for defining all high level operations that call the GIFT API.
 */
@Injectable()
export class GiftService {
  constructor(private readonly giftHttpService: GiftHttpService) {
    this.giftHttpService = giftHttpService;
  }

  /**
   * Get a GIFT facility by ID
   * @param {String} facilityId
   * @returns {Promise<AxiosResponse>}
   */
  getFacility(facilityId: UkefId): Promise<AxiosResponse> {
    return this.giftHttpService.get<GiftFacilityDto>({
      path: `${GIFT.PATH.FACILITY}${facilityId}`,
    });
  }
}
