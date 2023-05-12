import { DateString } from '@ukef/helpers';
import { BundleAction } from './bundle-actions/bundle-actions';

export interface AcbsCreateBundleInformationRequestDto {
  PortfolioIdentifier: string;
  // TODO replace InitialBundleStatusCode with RequestedBundleStatus, as InitialBundleStatusCode is deprecated as of 01 dec 2024.
  InitialBundleStatusCode: number;
  InitiatingUserName: string;
  UseAPIUserIndicator: boolean;
  ServicingUserAccountIdentifier?: string;
  PostingDate?: DateString; 
  BundleMessageList: BundleAction[];
}
