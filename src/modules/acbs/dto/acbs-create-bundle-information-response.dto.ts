import { AcbsBundleId } from '@ukef/helpers';

export type AcbsCreateBundleInformationResponseHeadersDto = {
  BundleIdentifier: AcbsBundleId;
  WarningErrors: string;
};
