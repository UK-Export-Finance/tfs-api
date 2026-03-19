import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { HttpClient } from '@ukef/modules/http/http.client';
import { AxiosError } from 'axios';
import { PinoLogger } from 'nestjs-pino';
import { throwError } from 'rxjs';

import { MdmCustomersParams } from './dto/mdm-customers-params.dto';
import { MdmCustomersResponse } from './dto/mdm-customers-response.dto';
import { ObligationSubtypeWithProductTypeCodeResponseDto } from './dto/obligation-subtype-with-product-type-code-response';
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

  /**
   * Get all obligation subtypes with product typecodes from APIM MDM.
   * @returns {Promise<ObligationSubtypeWithProductTypeCodeResponseDto[]>}
   */
  async getAllObligationSubtypesWithProductTypeCodes(): Promise<ObligationSubtypeWithProductTypeCodeResponseDto[]> {
    try {
      this.logger.info('Getting obligation subtypes with product type codes from APIM MDM');

      const response = await this.httpClient.get<Record<string, never>, ObligationSubtypeWithProductTypeCodeResponseDto[]>({
        path: '/v2/ods/obligation-subtypes/with-product-type-codes',
        onError: (error: Error) => throwError(() => error),
      });

      return response.data;
    } catch (error) {
      this.logger.error('Error getting obligation subtypes with product type codes from APIM MDM %o', error);

      throw new Error('Error getting obligation subtypes with product type codes from APIM MDM', { cause: error });
    }
  }

  /**
   * Get all obligation subtypes for a product type code from APIM MDM.
   * @param {string} productTypeCode - The product type code to filter obligation subtypes by.
   * @returns {Promise<ObligationSubtypeWithProductTypeCodeResponseDto[]>}
   */
  async getAllObligationSubtypesByProductTypeCode(productTypeCode: string): Promise<ObligationSubtypeWithProductTypeCodeResponseDto[]> {
    try {
      this.logger.info('Getting obligation subtypes by product type code %s from APIM MDM', productTypeCode);

      const allSubtypes = await this.getAllObligationSubtypesWithProductTypeCodes();

      const filtered = allSubtypes.filter((subtype: ObligationSubtypeWithProductTypeCodeResponseDto) => subtype.productTypeCode === productTypeCode);

      return filtered;
    } catch (error) {
      this.logger.error('Error getting obligation subtypes by product type code %s from APIM MDM %o', productTypeCode, error);

      throw new Error(`Error getting obligation subtypes by product type code ${productTypeCode} from APIM MDM`, { cause: error });
    }
  }
}
