import { BundleAction } from './bundle-actions/bundle-actions';

/**
 * ACBS record type to wrap ACBS actions/transaction.
 */
export interface AcbsCreateBundleInformationRequestDto {
  PortfolioIdentifier: string;
  InitialBundleStatusCode: number;
  InitiatingUserName: string;
  UseAPIUserIndicator: boolean;
  BundleMessageList: BundleAction[];
}
