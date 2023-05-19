import { Injectable } from '@nestjs/common';
import { ENUMS, PROPERTIES } from '@ukef/constants';
import { AcbsFacilityCovenantService } from '@ukef/modules/acbs/acbs-facility-covenant.service';
import { AcbsCreateFacilityCovenantRequestDto } from '@ukef/modules/acbs/dto/acbs-create-facility-covenant-request.dto';
import { AcbsAuthenticationService } from '@ukef/modules/acbs-authentication/acbs-authentication.service';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';

import { CreateFacilityCovenantRequestItem } from './dto/create-facility-covenant-request.dto';
import { GetFacilityCovenantsResponseDto } from './dto/get-facility-covenants-response.dto';

@Injectable()
export class FacilityCovenantService {
  constructor(
    private readonly acbsAuthenticationService: AcbsAuthenticationService,
    private readonly acbsFacilityCovenantService: AcbsFacilityCovenantService,
    private readonly dateStringTransformations: DateStringTransformations,
  ) {}

  async createCovenantForFacility(
    facilityIdentifier: string,
    facilityTypeCode: string,
    limitKeyValue: string,
    newCovenant: CreateFacilityCovenantRequestItem,
  ): Promise<void> {
    const idToken = await this.acbsAuthenticationService.getIdToken();

    let covenantName;

    if (
      newCovenant.covenantType === ENUMS.COVENANT_TYPE_CODES.CHARGEABLE_AMOUNT ||
      newCovenant.covenantType === ENUMS.COVENANT_TYPE_CODES.CHARGEABLE_AMOUNT_NOT_GBP
    ) {
      covenantName = 'CHARGEABLE AMOUNT';
    } else if (facilityTypeCode === '250') {
      covenantName = 'AMOUNT OF SUPPORTED BOND';
    } else if (facilityTypeCode === '260' || (newCovenant.covenantType === ENUMS.COVENANT_TYPE_CODES.UK_CONTRACT_VALUE && facilityTypeCode === '280')) {
      covenantName = 'AMOUNT OF SUPPORTED FACILITY';
    } else {
      covenantName = facilityTypeCode;
    }

    const effectiveDateString = this.dateStringTransformations.addTimeToDateOnlyString(newCovenant.effectiveDate);
    const guaranteeExpiryDateString = this.dateStringTransformations.addTimeToDateOnlyString(newCovenant.guaranteeExpiryDate);

    const covenantToCreateInAcbs: AcbsCreateFacilityCovenantRequestDto = {
      AccountOwnerIdentifier: PROPERTIES.COVENANT.DEFAULTS.accountOwnerIdentifier,
      ComplianceEvaluationMode: {
        CovenantEvaluationModeCode: PROPERTIES.COVENANT.DEFAULTS.complianceEvaluationMode.covenantEvaluationModeCode,
      },
      ComplianceStatusDate: effectiveDateString,
      CovenantIdentifier: newCovenant.covenantIdentifier,
      CovenantName: covenantName,
      DateCycleEvaluationMode: {
        CovenantEvaluationModeCode: PROPERTIES.COVENANT.DEFAULTS.dateCycleEvaluationMode.covenantEvaluationModeCode,
      },
      EffectiveDate: effectiveDateString,
      ExpirationDate: guaranteeExpiryDateString,
      LenderType: {
        LenderTypeCode: PROPERTIES.COVENANT.DEFAULTS.lenderType.covenantLenderTypeCode,
      },
      LimitKeyValue: limitKeyValue,
      LimitType: {
        LimitTypeCode: PROPERTIES.COVENANT.DEFAULTS.limitType.covenantLimitTypeCode,
      },
      SectionIdentifier: PROPERTIES.COVENANT.DEFAULTS.sectionIdentifier,
      TargetAmount: newCovenant.maximumLiability,
      PledgeType: {
        PledgeTypeCode: newCovenant.currency,
      },
      CovenantType: {
        CovenantTypeCode: newCovenant.covenantType,
      },
      ComplianceRule: {
        ComplianceRuleCode: PROPERTIES.COVENANT.DEFAULTS.complianceRule.covenantComplianceRuleCode,
      },
      InComplianceIndicator: PROPERTIES.COVENANT.DEFAULTS.inComplianceIndicator,
      WaivedIndicator: PROPERTIES.COVENANT.DEFAULTS.waivedIndicator,
      NextReviewDate: effectiveDateString,
    };

    await this.acbsFacilityCovenantService.createCovenantForFacility(facilityIdentifier, covenantToCreateInAcbs, idToken);
  }

  async getCovenantsForFacility(facilityIdentifier: string): Promise<GetFacilityCovenantsResponseDto[]> {
    const { portfolioIdentifier } = PROPERTIES.GLOBAL;
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
