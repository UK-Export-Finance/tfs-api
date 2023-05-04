import { Injectable } from '@nestjs/common';
import { PROPERTIES } from '@ukef/constants';
import { AcbsPartyId, DateOnlyString, UkefId } from '@ukef/helpers';
import { AcbsBundleInformationService } from '@ukef/modules/acbs/acbs-bundleInformation.service';
import { AcbsAuthenticationService } from '@ukef/modules/acbs-authentication/acbs-authentication.service';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';

import { CreateFacilityActivationTransactionResponse } from './dto/create-facility-activation-transaction-response.dto';
import { FacilityActivationTransactionToCreate } from './facility-activation-transaction-to-create.interface';

@Injectable()
export class FacilityActivationTransactionService {
  constructor(
    private readonly acbsAuthenticationService: AcbsAuthenticationService,
    private readonly acbsBundleInformationService: AcbsBundleInformationService,
    private readonly dateStringTransformations: DateStringTransformations,
  ) {}

  async createActivationTransactionForFacility(
    facilityIdentifier: UkefId,
    borrowerPartyIdentifier: AcbsPartyId,
    originalEffectiveDate: DateOnlyString,
    newFacilityActivationTransaction: FacilityActivationTransactionToCreate,
  ): Promise<CreateFacilityActivationTransactionResponse> {
    const idToken = await this.acbsAuthenticationService.getIdToken();

    const bundleInformationToCreateInAcbs = {
      PortfolioIdentifier: PROPERTIES.GLOBAL.portfolioIdentifier,
      InitialBundleStatusCode: newFacilityActivationTransaction.initialBundleStatusCode,
      InitiatingUserName: PROPERTIES.FACILITY_ACTIVATION_TRANSACTION.DEFAULT.initiatingUserName,
      UseAPIUserIndicator: PROPERTIES.FACILITY_ACTIVATION_TRANSACTION.DEFAULT.useAPIUserIndicator,
      BundleMessageList: [
        {
          $type: PROPERTIES.FACILITY_ACTIVATION_TRANSACTION.DEFAULT.bundleMessageList.type,
          AccountOwnerIdentifier: PROPERTIES.FACILITY_ACTIVATION_TRANSACTION.DEFAULT.bundleMessageList.accountOwnerIdentifier,
          EffectiveDate: this.dateStringTransformations.addTimeToDateOnlyString(originalEffectiveDate),
          FacilityIdentifier: facilityIdentifier,
          FacilityTransactionCodeValue: {
            FacilityTransactionCodeValueCode:
              PROPERTIES.FACILITY_ACTIVATION_TRANSACTION.DEFAULT.bundleMessageList.facilityTransactionCodeValue.facilityTransactionCodeValueCode,
          },
          FacilityTransactionType: {
            TypeCode: PROPERTIES.FACILITY_ACTIVATION_TRANSACTION.DEFAULT.bundleMessageList.facilityTransactionType.typeCode,
          },
          IsDraftIndicator: PROPERTIES.FACILITY_ACTIVATION_TRANSACTION.DEFAULT.bundleMessageList.isDraftIndicator,
          LenderType: {
            LenderTypeCode: newFacilityActivationTransaction.lenderTypeCode,
          },
          LimitKeyValue: borrowerPartyIdentifier,
          LimitType: {
            LimitTypeCode: PROPERTIES.FACILITY_ACTIVATION_TRANSACTION.DEFAULT.bundleMessageList.limitType.limitTypeCode,
          },
          SectionIdentifier: PROPERTIES.FACILITY_ACTIVATION_TRANSACTION.DEFAULT.bundleMessageList.sectionIdentifier,
        },
      ],
    };

    const response = await this.acbsBundleInformationService.createBundleInformation(bundleInformationToCreateInAcbs, idToken);
    return { bundleIdentifier: response.BundleIdentifier };
  }
}
