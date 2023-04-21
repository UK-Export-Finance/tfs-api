import { Injectable } from '@nestjs/common';
import { PROPERTIES } from '@ukef/constants';
import { roundTo2DecimalPlaces } from '@ukef/helpers/round-to-2-decimal-places.helper';
import { AcbsFacilityGuaranteeService } from '@ukef/modules/acbs/acbs-facility-guarantee.service';
import { AcbsCreateFacilityGuaranteeDto } from '@ukef/modules/acbs/dto/acbs-create-facility-guarantee.dto';
import { AcbsAuthenticationService } from '@ukef/modules/acbs-authentication/acbs-authentication.service';
import { CurrentDateProvider } from '@ukef/modules/date/current-date.provider';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';

import { FacilityGuarantee } from './facility-guarantee.interface';
import { FacilityGuaranteeToCreate } from './facility-guarantee-to-create.interface';

@Injectable()
export class FacilityGuaranteeService {
  constructor(
    private readonly acbsAuthenticationService: AcbsAuthenticationService,
    private readonly acbsFacilityGuaranteeService: AcbsFacilityGuaranteeService,
    private readonly dateStringTransformations: DateStringTransformations,
    private readonly currentDateProvider: CurrentDateProvider,
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

  async createGuaranteeForFacility(facilityIdentifier: string, newGuarantee: FacilityGuaranteeToCreate): Promise<void> {
    const idToken = await this.acbsAuthenticationService.getIdToken();

    // TODO: Mulesoft Deal and Facility guarantees logic has small difference, we don't check that Facility date is in future.

    const effectiveDateTime = this.currentDateProvider.getEarliestDateFromTodayAnd(
      new Date(this.dateStringTransformations.addTimeToDateOnlyString(newGuarantee.effectiveDate)),
    );
    const effectiveDateOnlyString = this.dateStringTransformations.removeTime(effectiveDateTime.toISOString());

    const guaranteeToCreateInAcbs: AcbsCreateFacilityGuaranteeDto = {
      LenderType: {
        LenderTypeCode: PROPERTIES.DEAL_GUARANTEE.DEFAULT.lenderType.lenderTypeCode,
      },
      SectionIdentifier: PROPERTIES.DEAL_GUARANTEE.DEFAULT.sectionIdentifier,
      LimitType: {
        LimitTypeCode: PROPERTIES.DEAL_GUARANTEE.DEFAULT.limitType.limitTypeCode,
      },
      LimitKey: newGuarantee.limitKey,
      GuarantorParty: {
        PartyIdentifier: newGuarantee.guarantorParty ?? PROPERTIES.DEAL_GUARANTEE.DEFAULT.guarantorParty,
      },
      GuaranteeType: {
        GuaranteeTypeCode: newGuarantee.guaranteeTypeCode ?? PROPERTIES.DEAL_GUARANTEE.DEFAULT.guaranteeTypeCode,
      },
      EffectiveDate: this.dateStringTransformations.addTimeToDateOnlyString(effectiveDateOnlyString),
      ExpirationDate: this.dateStringTransformations.addTimeToDateOnlyString(newGuarantee.guaranteeExpiryDate),
      GuaranteedLimit: roundTo2DecimalPlaces(newGuarantee.maximumLiability),
      GuaranteedPercentage: PROPERTIES.DEAL_GUARANTEE.DEFAULT.guaranteedPercentage,
    };

    await this.acbsFacilityGuaranteeService.createGuaranteeForFacility(facilityIdentifier, guaranteeToCreateInAcbs, idToken);
  }
}
