import { BundleAction } from './bundle-actions/bundle-action.type';

export interface AcbsGetFacilityActivationTransactionResponseDto {
  PortfolioIdentifier: string;
  InitialBundleStatusCode: number;
  BundleStatus: {
    BundleStatusCode: string;
    BundleStatusShortDescription: string;
  };
  InitiatingUserName: string;
  BundleMessageList: BundleAction[];
}
