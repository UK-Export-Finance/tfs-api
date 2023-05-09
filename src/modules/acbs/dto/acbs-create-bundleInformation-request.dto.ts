import { BundleAction } from './bundle-actions/bundle-actions';

/**
 * ACBS record type to wrap ACBS actions/transaction.
 */
export interface AcbsCreateBundleInformationRequestDto {
  PortfolioIdentifier: string;
  // TODO replace InitialBundleStatusCode with RequestedBundleStatus, as InitialBundleStatusCode is deprecated as of 01 dec 2024.
  InitialBundleStatusCode: number;
  InitiatingUserName: string;
  UseAPIUserIndicator: boolean;
  BundleMessageList: BundleAction[];
}
