import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import AcbsConfig from '@ukef/config/acbs.config';
import { PROPERTIES } from '@ukef/constants';
import { AcbsConfigBaseUrlAndUseReturnExceptionHeader } from '@ukef/modules/acbs/acbs-config-base-url.type';
import { AcbsHttpService } from '@ukef/modules/acbs/acbs-http.service';
import { AcbsCreateBundleInformationRequestDto } from '@ukef/modules/acbs/dto/acbs-create-bundle-information-request.dto';
import { AcbsCreateBundleInformationResponseHeadersDto } from '@ukef/modules/acbs/dto/acbs-create-bundle-information-response.dto';
import { AcbsGetBundleInformationResponseDto } from '@ukef/modules/acbs/dto/acbs-get-bundle-information-response.dto';
import {
  BundleAction,
  isFacilityAmountTransaction,
  isFacilityCodeValueTransaction,
  isFacilityFeeAmountTransaction,
  isLoanAdvanceTransaction,
  isNewLoanRequest,
} from '@ukef/modules/acbs/dto/bundle-actions/bundle-action.type';
import {
  getBundleInformationNotFoundKnownAcbsError,
  getLoanNotFoundKnownAcbsBundleInformationError,
  KnownErrors,
  postFacilityNotFoundKnownAcbsError,
} from '@ukef/modules/acbs/known-errors';
import { createWrapAcbsHttpGetErrorCallback, createWrapAcbsHttpPostOrPutErrorCallback } from '@ukef/modules/acbs/wrap-acbs-http-error-callback';

@Injectable()
export class AcbsBundleInformationService {
  private static readonly bundleInformationPath = '/BundleInformation';

  private readonly acbsHttpService: AcbsHttpService;

  constructor(@Inject(AcbsConfig.KEY) config: AcbsConfigBaseUrlAndUseReturnExceptionHeader, httpService: HttpService) {
    this.acbsHttpService = new AcbsHttpService(config, httpService);
  }

  async getBundleInformationByIdentifier(bundleIdentifier: string, idToken: string): Promise<AcbsGetBundleInformationResponseDto> {
    const { data: bundleInformation } = await this.acbsHttpService.get<AcbsGetBundleInformationResponseDto>({
      path: `${AcbsBundleInformationService.bundleInformationPath}/${bundleIdentifier}?returnItems=true`,
      idToken,
      onError: createWrapAcbsHttpGetErrorCallback({
        messageForUnknownError: `Failed to get the bundle information with bundle identifier ${bundleIdentifier}.`,
        knownErrors: [getBundleInformationNotFoundKnownAcbsError(bundleIdentifier)],
      }),
    });
    return bundleInformation;
  }

  async createBundleInformation(
    newBundleInformation: AcbsCreateBundleInformationRequestDto,
    idToken: string,
  ): Promise<AcbsCreateBundleInformationResponseHeadersDto> {
    const { servicingQueueIdentifier } = PROPERTIES.GLOBAL;
    const [action] = newBundleInformation.BundleMessageList;

    const postResponse = await this.acbsHttpService.post<AcbsCreateBundleInformationRequestDto>({
      path: `${AcbsBundleInformationService.bundleInformationPath}?servicingQueueIdentifier=${servicingQueueIdentifier}`,
      requestBody: newBundleInformation,
      idToken,
      onError: createWrapAcbsHttpPostOrPutErrorCallback({
        messageForUnknownError: `Failed to create a bundle information in ACBS.`,
        knownErrors: this.getKnownErrorsForAction(action),
      }),
    });

    let warningErrors = '';
    if (postResponse.headers['processing-warning']) {
      warningErrors = postResponse.headers['processing-warning'];
    }
    return {
      BundleIdentifier: postResponse.headers.bundleidentifier,
      WarningErrors: warningErrors,
    };
  }

  private getKnownErrorsForAction(action: BundleAction): KnownErrors {
    if (isFacilityCodeValueTransaction(action)) {
      return [postFacilityNotFoundKnownAcbsError(action.FacilityIdentifier)];
    }

    if (isFacilityAmountTransaction(action)) {
      return [postFacilityNotFoundKnownAcbsError(action.FacilityIdentifier)];
    }

    if (isLoanAdvanceTransaction(action)) {
      return [getLoanNotFoundKnownAcbsBundleInformationError(action.LoanIdentifier)];
    }

    if (isNewLoanRequest(action)) {
      return [postFacilityNotFoundKnownAcbsError(action.FacilityIdentifier)];
    }

    if (isFacilityFeeAmountTransaction(action)) {
      return [postFacilityNotFoundKnownAcbsError(action.FacilityIdentifier)];
    }

    return [];
  }
}
