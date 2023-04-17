import { Injectable } from '@nestjs/common';
import { PROPERTIES } from '@ukef/constants';
import { AcbsFacilityGuaranteeService } from '@ukef/modules/acbs/acbs-facility-guarantee.service';
import { AcbsAuthenticationService } from '@ukef/modules/acbs-authentication/acbs-authentication.service';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';

import { FacilityGuarantee } from './facility-guarantee.interface';

@Injectable()
export class FacilityGuaranteeService {
  constructor(
    private readonly acbsAuthenticationService: AcbsAuthenticationService,
    private readonly acbsFacilityGuaranteeService: AcbsFacilityGuaranteeService,
    private readonly dateStringTransformations: DateStringTransformations,
  ) {}

  async getGuaranteesForFacility(facilityIdentifier: string): Promise<FacilityGuarantee[]> {
    const portfolioIdentifier = PROPERTIES.GLOBAL.portfolioIdentifier;
    const idToken = await this.acbsAuthenticationService.getIdToken();
    const guaranteesInAcbs = await this.acbsFacilityGuaranteeService.getGuaranteesForFacility(portfolioIdentifier, facilityIdentifier, idToken);
    return guaranteesInAcbs.map((guarantee) => {
      const effectiveDateOnly = this.dateStringTransformations.removeTimeIfExists(guarantee.EffectiveDate);
      const expirationDateOnly = this.dateStringTransformations.removeTimeIfExists(guarantee.ExpirationDate);
      return {
        facilityIdentifier,
        portfolioIdentifier,
        guaranteeCommencementDate: effectiveDateOnly,
        effectiveDate: effectiveDateOnly,
        guarantorParty: guarantee.GuarantorParty.PartyIdentifier,
        limitKey: guarantee.LimitKey,
        guaranteeExpiryDate: expirationDateOnly,
        maximumLiability: guarantee.GuaranteedLimit,
        guaranteeTypeCode: guarantee.GuaranteeType.GuaranteeTypeCode,
      };
    });
  }
}
