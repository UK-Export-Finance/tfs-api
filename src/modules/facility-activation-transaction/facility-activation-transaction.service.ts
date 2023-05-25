import { BadRequestException, Injectable } from '@nestjs/common';
import { PROPERTIES } from '@ukef/constants';
import { AcbsPartyId, DateOnlyString, UkefId } from '@ukef/helpers';
import { AcbsBundleInformationService } from '@ukef/modules/acbs/acbs-bundle-information.service';
import { AcbsCreateBundleInformationRequestDto } from '@ukef/modules/acbs/dto/acbs-create-bundle-information-request.dto';
import { FacilityCodeValueTransaction } from '@ukef/modules/acbs/dto/bundle-actions/facility-code-value-transaction.bundle-action';
import { AcbsAuthenticationService } from '@ukef/modules/acbs-authentication/acbs-authentication.service';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';

import { AcbsGetBundleInformationResponseDto } from '../acbs/dto/acbs-get-bundle-information-response.dto';
import { isFacilityCodeValueTransaction } from '../acbs/dto/bundle-actions/bundle-action.type';
import { CreateFacilityActivationTransactionRequestItem } from './dto/create-facility-activation-transaction-request.dto';
import { CreateFacilityActivationTransactionResponse } from './dto/create-facility-activation-transaction-response.dto';
import { GetFacilityActivationTransactionResponseDto } from './dto/get-facility-activation-transaction-response.dto';

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
    newFacilityActivationTransaction: CreateFacilityActivationTransactionRequestItem,
  ): Promise<CreateFacilityActivationTransactionResponse> {
    const idToken = await this.acbsAuthenticationService.getIdToken();

    const bundleInformationToCreateInAcbs: AcbsCreateBundleInformationRequestDto<FacilityCodeValueTransaction> = {
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

  async getActivationTransactionByBundleIdentifier(bundleIdentifier: string): Promise<GetFacilityActivationTransactionResponseDto> {
    const idToken = await this.acbsAuthenticationService.getIdToken();
    const activationTransaction = await this.acbsBundleInformationService.getBundleInformationByIdentifier(bundleIdentifier, 'Activation transaction', idToken);
    const [codeValueTransaction] = activationTransaction.BundleMessageList;

    if (!isFacilityCodeValueTransaction(codeValueTransaction)) {
      throw new BadRequestException('Bad request', 'The provided bundleIdentifier does not correspond to an activation transaction.');
    }
    return this.mapActivationTransaction(activationTransaction, codeValueTransaction);
  }

  private mapActivationTransaction(
    activationTransaction: AcbsGetBundleInformationResponseDto,
    codeValueTransaction: FacilityCodeValueTransaction,
  ): GetFacilityActivationTransactionResponseDto {
    const effectiveDateOnly = this.dateStringTransformations.removeTime(codeValueTransaction.EffectiveDate);

    return {
      portfolioIdentifier: activationTransaction.PortfolioIdentifier,
      facilityIdentifier: codeValueTransaction.FacilityIdentifier,
      bundleStatusCode: activationTransaction.BundleStatus.BundleStatusCode,
      bundleStatusDesc: activationTransaction.BundleStatus.BundleStatusShortDescription,
      lenderTypeCode: codeValueTransaction.LenderType.LenderTypeCode,
      initialBundleStatusCode: activationTransaction.InitialBundleStatusCode,
      initiatingUserName: activationTransaction.InitiatingUserName,
      accountOwnerIdentifier: codeValueTransaction.AccountOwnerIdentifier,
      effectiveDate: effectiveDateOnly,
      facilityTransactionCodeValueCode: codeValueTransaction.FacilityTransactionCodeValue?.FacilityTransactionCodeValueCode,
      facilityTransactionTypeCode: Number(codeValueTransaction.FacilityTransactionType?.TypeCode),
      isDraftIndicator: codeValueTransaction.IsDraftIndicator,
      limitKeyValue: codeValueTransaction.LimitKeyValue,
      limitTypeCode: codeValueTransaction.LimitType?.LimitTypeCode,
      sectionIdentifier: codeValueTransaction.SectionIdentifier,
    };
  }
}
