import { Module } from '@nestjs/common';
import { MdmModule } from '@ukef/modules/mdm/mdm.module';

import { GiftCurrencyController, GiftFacilitiesController, GiftFacilityController, GiftFeeTypeController } from './controllers';
import {
  GiftAccrualScheduleService,
  GiftAmountAmendmentService,
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
  GiftQueueService,
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
    GiftAmountAmendmentService,
    GiftFacilityAsyncValidationService,
    GiftFacilityCreationErrorService,
    GiftFacilityService,
    GiftFacilityAmendmentService,
    GiftFeeTypeService,
    GiftFixedFeeService,
    GiftHttpService,
    GiftQueueService,
    GiftObligationService,
    GiftProductTypeService,
    GiftRepaymentProfileService,
    GiftRiskDetailsService,
    GiftStatusService,
    GiftWorkPackageService,
  ],
  controllers: [GiftCurrencyController, GiftFacilitiesController, GiftFacilityController, GiftFeeTypeController],
})
export class GiftModule {}
