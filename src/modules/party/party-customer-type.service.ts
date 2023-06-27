import { Injectable } from '@nestjs/common';
import { MdmService } from '@ukef/modules/mdm/mdm.service';
import { PinoLogger } from 'nestjs-pino';

import { MdmResourceNotFoundException } from '../mdm/exception/mdm-resource-not-found.exception';

type CustomerType = string | null;

@Injectable()
export class PartyCustomerTypeService {
  constructor(private readonly mdmService: MdmService, private readonly logger: PinoLogger) {}

  async getCustomerTypeForPartyFromAlternateIdentifier({
    alternateIdentifier,
    fallbackIfNotFound,
  }: {
    alternateIdentifier: string;
    fallbackIfNotFound: CustomerType;
  }): Promise<CustomerType> {
    try {
      const customersWithPartyUrnMatchingAlternateIdentifier = await this.mdmService.findCustomersByPartyUrn(alternateIdentifier);

      if (customersWithPartyUrnMatchingAlternateIdentifier.length === 0) {
        this.logThatNoCustomersWereFound({ alternateIdentifier, fallbackIfNotFound });
        return fallbackIfNotFound;
      }

      const [{ type: typeOfFirstCustomerFound }] = customersWithPartyUrnMatchingAlternateIdentifier;
      return typeOfFirstCustomerFound;
    } catch (error) {
      if (error instanceof MdmResourceNotFoundException) {
        // TODO APIM-336: Should we check the error message as well to not apply this logic for unexpected 404 errors?
        this.logThatNoCustomersWereFound({ alternateIdentifier, fallbackIfNotFound });
        return fallbackIfNotFound;
      }
      throw error;
    }
  }

  private logThatNoCustomersWereFound({ alternateIdentifier, fallbackIfNotFound }: { alternateIdentifier: string; fallbackIfNotFound: CustomerType }): void {
    this.logger.warn(`No customers were found with a partyUrn matching ${alternateIdentifier}. We will use a fallback customer type of ${fallbackIfNotFound}.`);
  }
}
