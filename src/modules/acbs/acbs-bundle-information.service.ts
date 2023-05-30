import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import AcbsConfig from '@ukef/config/acbs.config';
import { PROPERTIES } from '@ukef/constants';

import { AcbsConfigBaseUrl } from './acbs-config-base-url.type';
import { AcbsHttpService } from './acbs-http.service';
import { AcbsCreateBundleInformationRequestDto } from './dto/acbs-create-bundle-information-request.dto';
import { AcbsCreateBundleInformationResponseHeadersDto } from './dto/acbs-create-bundle-information-response.dto';
import { AcbsGetBundleInformationResponseDto } from './dto/acbs-get-bundle-information-response.dto';
import { BundleAction, isFacilityCodeValueTransaction, isLoanAdvanceTransaction, isNewLoanRequest } from './dto/bundle-actions/bundle-action.type';
import {
  getBundleInformationNotFoundKnownAcbsError,
  getLoanNotFoundKnownAcbsBundleInformationError,
  KnownErrors,
  postFacilityNotFoundKnownAcbsError,
} from './known-errors';
import { createWrapAcbsHttpGetErrorCallback, createWrapAcbsHttpPostOrPutErrorCallback } from './wrap-acbs-http-error-callback';

@Injectable()
export class AcbsBundleInformationService {
  private static readonly bundleInformationPath = '/BundleInformation';

  private readonly acbsHttpService: AcbsHttpService;

  constructor(@Inject(AcbsConfig.KEY) config: AcbsConfigBaseUrl, httpService: HttpService) {
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
    // TODO APIM-308: ACBS might create bundle but fail to process it. In this case it will return header "Processing-Warning" and we should handle it.
    return { BundleIdentifier: postResponse.headers.bundleidentifier };
  }

  private getKnownErrorsForAction(action: BundleAction): KnownErrors {
    if (isFacilityCodeValueTransaction(action)) {
      return [postFacilityNotFoundKnownAcbsError(action.FacilityIdentifier)];
    }

    if (isLoanAdvanceTransaction(action)) {
      return [getLoanNotFoundKnownAcbsBundleInformationError(action.LoanIdentifier)];
    }

    if (isNewLoanRequest(action)) {
      return [postFacilityNotFoundKnownAcbsError(action.FacilityIdentifier)];
    }

    return [];
  }
}
