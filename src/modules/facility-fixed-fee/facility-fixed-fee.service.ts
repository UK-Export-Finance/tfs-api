import { Injectable } from '@nestjs/common';
import { PROPERTIES } from '@ukef/constants';
import { AcbsAuthenticationService } from '@ukef/modules/acbs-authentication/acbs-authentication.service';

import { AcbsFacilityFixedFeeService } from '../acbs/acbs-facility-fixed-fee.service';
import { DateStringTransformations } from '../date/date-string.transformations';
import { GetFacilityFixedFeeResponse } from './dto/get-facility-fixed-fee-response.dto';

@Injectable()
export class FacilityFixedFeeService {
  constructor(
    private readonly acbsAuthenticationService: AcbsAuthenticationService,
    private readonly acbsFacilityFixedFeeService: AcbsFacilityFixedFeeService,
    private readonly dateStringTransformations: DateStringTransformations,
  ) {}

  async getFixedFeesForFacility(facilityIdentifier: string): Promise<GetFacilityFixedFeeResponse> {
    const { portfolioIdentifier } = PROPERTIES.GLOBAL;
    const idToken = await this.acbsAuthenticationService.getIdToken();
    const fixedFeesInAcbs = await this.acbsFacilityFixedFeeService.getFixedFeesForFacility(portfolioIdentifier, facilityIdentifier, idToken);

    return fixedFeesInAcbs.map((fixedFee) => {
      const effectiveDate = this.dateStringTransformations.removeTimeIfExists(fixedFee.EffectiveDate);
      const expirationDate = this.dateStringTransformations.removeTimeIfExists(fixedFee.ExpirationDate);
      const nextDueDate = this.dateStringTransformations.removeTimeIfExists(fixedFee.NextDueDate);
      const nextAccrueToDate = this.dateStringTransformations.removeTimeIfExists(fixedFee.NextAccrueToDate);

      return {
        facilityIdentifier,
        portfolioIdentifier,
        amount: fixedFee.FixedFeeAmount,
        effectiveDate,
        expirationDate,
        nextDueDate,
        nextAccrueToDate,
        period: fixedFee.SegmentIdentifier,
        description: fixedFee.Description,
        currency: fixedFee.Currency.CurrencyCode,
        lenderTypeCode: fixedFee.LenderType.LenderTypeCode,
        incomeClassCode: fixedFee.IncomeClass.IncomeClassCode,
        spreadToInvestorsIndicator: fixedFee.SpreadToInvestorsIndicator,
      };
    });
  }
}
