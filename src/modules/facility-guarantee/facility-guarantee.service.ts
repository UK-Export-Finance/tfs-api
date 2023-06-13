import { Injectable } from '@nestjs/common';
import { PROPERTIES } from '@ukef/constants';
import { roundTo2DecimalPlaces } from '@ukef/helpers/round-to-2-decimal-places.helper';
import { AcbsFacilityGuaranteeService } from '@ukef/modules/acbs/acbs-facility-guarantee.service';
import { AcbsCreateFacilityGuaranteeDto } from '@ukef/modules/acbs/dto/acbs-create-facility-guarantee.dto';
import { AcbsAuthenticationService } from '@ukef/modules/acbs-authentication/acbs-authentication.service';
import { CurrentDateProvider } from '@ukef/modules/date/current-date.provider';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';

import { AcbsUpdateFacilityGuaranteeRequest } from '../acbs/dto/acbs-update-facility-guarantee-request.dto';
import { UpdateFacilityGuaranteesRequestDto } from './dto/update-facility-guarantees-request.dto';
import { CreateFacilityGuaranteeRequestItem } from './dto/create-facility-guarantee-request.dto';
import { GetFacilityGuaranteesResponse } from './dto/get-facility-guarantees-response.dto';

@Injectable()
export class FacilityGuaranteeService {
  constructor(
    private readonly acbsAuthenticationService: AcbsAuthenticationService,
    private readonly acbsFacilityGuaranteeService: AcbsFacilityGuaranteeService,
    private readonly dateStringTransformations: DateStringTransformations,
    private readonly currentDateProvider: CurrentDateProvider,
  ) {}

  async getGuaranteesForFacility(facilityIdentifier: string): Promise<GetFacilityGuaranteesResponse> {
    const { portfolioIdentifier } = PROPERTIES.GLOBAL;
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

  async createGuaranteeForFacility(facilityIdentifier: string, newGuarantee: CreateFacilityGuaranteeRequestItem): Promise<void> {
    const idToken = await this.acbsAuthenticationService.getIdToken();

    const effectiveDateTime = this.currentDateProvider.getEarliestDateFromTodayAnd(
      new Date(this.dateStringTransformations.addTimeToDateOnlyString(newGuarantee.effectiveDate)),
    );
    const effectiveDateOnlyString = this.dateStringTransformations.removeTime(effectiveDateTime.toISOString());

    const guaranteeToCreateInAcbs: AcbsCreateFacilityGuaranteeDto = {
      LenderType: {
        LenderTypeCode: PROPERTIES.FACILITY_GUARANTEE.DEFAULT.lenderType.lenderTypeCode,
      },
      SectionIdentifier: PROPERTIES.FACILITY_GUARANTEE.DEFAULT.sectionIdentifier,
      LimitType: {
        LimitTypeCode: PROPERTIES.FACILITY_GUARANTEE.DEFAULT.limitType.limitTypeCode,
      },
      LimitKey: newGuarantee.limitKey,
      GuarantorParty: {
        PartyIdentifier: newGuarantee.guarantorParty,
      },
      GuaranteeType: {
        GuaranteeTypeCode: newGuarantee.guaranteeTypeCode,
      },
      EffectiveDate: this.dateStringTransformations.addTimeToDateOnlyString(effectiveDateOnlyString),
      ExpirationDate: this.dateStringTransformations.addTimeToDateOnlyString(newGuarantee.guaranteeExpiryDate),
      GuaranteedLimit: roundTo2DecimalPlaces(newGuarantee.maximumLiability),
      GuaranteedPercentage: PROPERTIES.FACILITY_GUARANTEE.DEFAULT.guaranteedPercentage,
    };

    await this.acbsFacilityGuaranteeService.createGuaranteeForFacility(facilityIdentifier, guaranteeToCreateInAcbs, idToken);
  }

  async updateGuaranteesForFacility(facilityIdentifier: string, updateFacilityGuaranteesRequest: UpdateFacilityGuaranteesRequestDto): Promise<void> {
    const { portfolioIdentifier } = PROPERTIES.GLOBAL;
    const idToken = await this.acbsAuthenticationService.getIdToken();
    const guaranteesToUpdate = await this.acbsFacilityGuaranteeService.getGuaranteesForFacility(portfolioIdentifier, facilityIdentifier, idToken);

    const guaranteeFieldsToUpdate = this.getGuaranteeFieldsToUpdate(updateFacilityGuaranteesRequest);
    for (const guarantee of guaranteesToUpdate) {
      const updatedGuarantee = { ...guarantee, ...guaranteeFieldsToUpdate };
      await this.acbsFacilityGuaranteeService.replaceGuaranteeForFacility(portfolioIdentifier, facilityIdentifier, updatedGuarantee, idToken);
    }
  }

  private getGuaranteeFieldsToUpdate({ expirationDate, guaranteedLimit }: UpdateFacilityGuaranteesRequestDto): Partial<AcbsUpdateFacilityGuaranteeRequest> {
    return {
      ...(expirationDate && { ExpirationDate: this.dateStringTransformations.addTimeToDateOnlyString(expirationDate) }),
      ...((guaranteedLimit || guaranteedLimit === 0) && { GuaranteedLimit: guaranteedLimit }),
    };
  }
}
