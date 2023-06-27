import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { HttpClient } from '@ukef/modules/http/http.client';
import { AxiosError } from 'axios';
import { throwError } from 'rxjs';

import { MdmCustomersParams } from './dto/mdm-customers-params.dto';
import { MdmCustomersResponse } from './dto/mdm-customers-response.dto';
import { MdmException } from './exception/mdm.exception';
import { MdmResourceNotFoundException } from './exception/mdm-resource-not-found.exception';

@Injectable()
export class MdmService {
  private readonly httpClient: HttpClient;

  constructor(httpService: HttpService) {
    this.httpClient = new HttpClient(httpService);
  }

  async findCustomersByPartyUrn(partyUrnToSearch: string): Promise<MdmCustomersResponse> {
    const { data: customerSearchResults } = await this.httpClient.get<MdmCustomersParams, MdmCustomersResponse>({
      path: '/customers',
      queryParams: { partyUrn: partyUrnToSearch },
      headers: {},
      onError: (error: Error) =>
        throwError(() => {
          const baseErrorMessage = `Failed to find customers with partyUrn ${partyUrnToSearch} in MDM.`;
          if (error instanceof AxiosError && error.response?.status === 404) {
            return new MdmResourceNotFoundException(`${baseErrorMessage} The response status was 404 Not Found.`, error);
          }
          return new MdmException(baseErrorMessage, error);
        }),
    });
    return customerSearchResults;
  }
}
