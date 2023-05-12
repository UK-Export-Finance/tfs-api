import { AcbsBundleId } from '@ukef/helpers';

// TODO APIM-128: Should we rename this to AcbsCreateBundleInformationResponseHeadersDto?
export interface AcbsCreateBundleInformationResponseDto {
  BundleIdentifier: AcbsBundleId;
}
