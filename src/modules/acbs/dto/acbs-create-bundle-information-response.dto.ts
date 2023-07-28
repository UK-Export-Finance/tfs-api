import { AcbsBundleId } from '@ukef/helpers';

export interface AcbsCreateBundleInformationResponseHeadersDto {
  BundleIdentifier: AcbsBundleId;
  WarningErrors: string;
}
