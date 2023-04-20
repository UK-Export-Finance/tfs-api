import { Injectable } from '@nestjs/common';
import { PROPERTIES } from '@ukef/constants';
import { AcbsFacilityCovenantService } from '@ukef/modules/acbs/acbs-facility-covenant.service';
import { AcbsAuthenticationService } from '@ukef/modules/acbs-authentication/acbs-authentication.service';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';

import { GetFacilityCovenantsResponseDto } from './dto/get-facility-covenants-response.dto';

@Injectable()
export class FacilityCovenantService {
  constructor(
    private readonly acbsAuthenticationService: AcbsAuthenticationService,
    private readonly acbsFacilityCovenantService: AcbsFacilityCovenantService,
    private readonly dateStringTransformations: DateStringTransformations,
  ) {}

  async getCovenantsForFacility(facilityIdentifier: string): Promise<GetFacilityCovenantsResponseDto[]> {
    const portfolioIdentifier = PROPERTIES.GLOBAL.portfolioIdentifier;
    const idToken = await this.acbsAuthenticationService.getIdToken();
    const covenantsInAcbs = await this.acbsFacilityCovenantService.getCovenantsForFacility(portfolioIdentifier, facilityIdentifier, idToken);
    return covenantsInAcbs.map((covenant) => {
      const effectiveDateOnly = this.dateStringTransformations.removeTime(covenant.EffectiveDate);
      const expirationDateOnly = this.dateStringTransformations.removeTime(covenant.ExpirationDate);
      return {
        covenantIdentifier: covenant.CovenantIdentifier,
        covenantType: covenant.CovenantType.CovenantTypeCode,
        facilityIdentifier,
        portfolioIdentifier,
        maximumLiability: covenant.TargetAmount,
        currency: covenant.PledgeType.PledgeTypeCode,
        guaranteeCommencementDate: effectiveDateOnly,
        effectiveDate: effectiveDateOnly,
        guaranteeExpiryDate: expirationDateOnly,
      };
    });
  }
}
