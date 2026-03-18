import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { HttpClient } from '@ukef/modules/http/http.client';
import { AxiosError } from 'axios';
import { PinoLogger } from 'nestjs-pino';
import { throwError } from 'rxjs';

import { MdmCustomersParams } from './dto/mdm-customers-params.dto';
import { MdmCustomersResponse } from './dto/mdm-customers-response.dto';
import { MdmException } from './exception/mdm.exception';
import { MdmResourceNotFoundException } from './exception/mdm-resource-not-found.exception';

@Injectable()
export class MdmService {
  private readonly httpClient: HttpClient;
  private readonly logger: PinoLogger;

  constructor(httpService: HttpService, logger: PinoLogger) {
    this.httpClient = new HttpClient(httpService);
    this.logger = logger;
  }

  /**
   * Finds a customer in APIM MDM by their party URN.
   * @param {string} partyUrnToSearch: The party URN to search for.
   * @returns {Promise<MdmCustomersResponse>}
   */
  async findCustomersByPartyUrn(partyUrnToSearch: string): Promise<MdmCustomersResponse> {
    const { data: customerSearchResults } = await this.httpClient.get<MdmCustomersParams, MdmCustomersResponse>({
      path: '/v1/customers',
      queryParams: { partyUrn: partyUrnToSearch },
      onError: (error: Error) =>
        throwError(() => {
          const baseErrorMessage = `Failed to find customers with partyUrn ${partyUrnToSearch} in APIM MDM.`;

          if (error instanceof AxiosError && error.response?.status === 404) {
            return new MdmResourceNotFoundException(`${baseErrorMessage} The response status was 404 Not Found.`, error);
          }

          return new MdmException(baseErrorMessage, error);
        }),
    });

    return customerSearchResults;
  }
}
