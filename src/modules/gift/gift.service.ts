import { Injectable } from '@nestjs/common';
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
  async getFacility(facilityId: string): Promise<AxiosResponse> {
    const response = await this.giftHttpService.get<GiftFacilityDto>({
      path: `/facility/${facilityId}`,
    });

    return response;
  }
}
