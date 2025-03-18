import { Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';

import { GiftFacilityDto } from './dto';
import { GiftHttpService } from './gift-http.service';

@Injectable()
export class GiftService {
  constructor(private readonly giftHttpService: GiftHttpService) {
    this.giftHttpService = giftHttpService;
  }

  async getFacility(facilityId: string): Promise<AxiosResponse> {
    const response = await this.giftHttpService.get<GiftFacilityDto>({
      path: `/facility/${facilityId}`,
    });

    return response;
  }
}
