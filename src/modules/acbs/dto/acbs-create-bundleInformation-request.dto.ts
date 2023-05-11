import { BundleAction } from './bundle-actions/bundle-actions';

export interface AcbsCreateBundleInformationRequestDto {
  PortfolioIdentifier: string;
  // TODO APIM-311: Replace InitialBundleStatusCode with RequestedBundleStatus, as InitialBundleStatusCode is deprecated as of 01 dec 2024.
  InitialBundleStatusCode: number;
  InitiatingUserName: string;
  UseAPIUserIndicator: boolean;
  BundleMessageList: BundleAction[];
}
