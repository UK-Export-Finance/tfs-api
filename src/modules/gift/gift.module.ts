import { Module } from '@nestjs/common';
import { MdmModule } from '@ukef/modules/mdm/mdm.module';

import { GiftCurrencyController, GiftFacilityController, GiftFeeTypeController } from './controllers';
import {
  GiftAccrualScheduleService,
  GiftBusinessCalendarsConventionService,
  GiftBusinessCalendarService,
  GiftCounterpartyService,
  GiftCurrencyService,
  GiftFacilityAmendmentService,
  GiftFacilityAsyncValidationService,
  GiftFacilityCreationErrorService,
  GiftFacilityService,
  GiftFeeTypeService,
  GiftFixedFeeService,
  GiftHttpService,
  GiftObligationService,
  GiftProductTypeService,
  GiftRepaymentProfileService,
  GiftRiskDetailsService,
  GiftStatusService,
  GiftWorkPackageService,
} from './services';

@Module({
  imports: [MdmModule],
  providers: [
    GiftAccrualScheduleService,
    GiftBusinessCalendarService,
    GiftBusinessCalendarsConventionService,
    GiftCounterpartyService,
    GiftCurrencyService,
    GiftFacilityAsyncValidationService,
    GiftFacilityCreationErrorService,
    GiftFacilityService,
    GiftFacilityAmendmentService,
    GiftFeeTypeService,
    GiftFixedFeeService,
    GiftHttpService,
    GiftObligationService,
    GiftProductTypeService,
    GiftRepaymentProfileService,
    GiftRiskDetailsService,
    GiftStatusService,
    GiftWorkPackageService,
  ],
  controllers: [GiftCurrencyController, GiftFacilityController, GiftFeeTypeController],
})
export class GiftModule {}
