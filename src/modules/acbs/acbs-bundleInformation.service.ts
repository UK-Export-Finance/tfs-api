import { HttpService } from '@nestjs/axios';
import { Inject } from '@nestjs/common';
import AcbsConfig from '@ukef/config/acbs.config';
import { PROPERTIES } from '@ukef/constants';

import { AcbsConfigBaseUrl } from './acbs-config-base-url.type';
import { AcbsHttpService } from './acbs-http.service';
import { AcbsCreateBundleInformationRequestDto } from './dto/acbs-create-bundleInformation-request.dto';
import { AcbsCreateBundleInformationResponseDto } from './dto/acbs-create-bundleInformation-response.dto';
import { createWrapAcbsHttpPostErrorCallback } from './wrap-acbs-http-error-callback';

/**
 * ACBS transaction wrapper service.
 */
export class AcbsBundleInformationService {
  private readonly acbsHttpService: AcbsHttpService;

  constructor(@Inject(AcbsConfig.KEY) config: AcbsConfigBaseUrl, httpService: HttpService) {
    this.acbsHttpService = new AcbsHttpService(config, httpService);
  }

  async createBundleInformation(newBundleInformation: AcbsCreateBundleInformationRequestDto, idToken: string): Promise<AcbsCreateBundleInformationResponseDto> {
    const { servicingQueueIdentifier } = PROPERTIES.GLOBAL;
    const postResponse = await this.acbsHttpService.post<AcbsCreateBundleInformationRequestDto>({
      path: `/BundleInformation?servicingQueueIdentifier=${servicingQueueIdentifier}`,
      requestBody: newBundleInformation,
      idToken,
      onError: createWrapAcbsHttpPostErrorCallback({
        messageForUnknownError: `Failed to create a bundleInformation in ACBS.`,
        knownErrors: [],
      }),
    });

    return { BundleIdentifier: postResponse.headers.bundleidentifier };
  }
}
