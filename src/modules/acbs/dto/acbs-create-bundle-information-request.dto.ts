import { DateString } from '@ukef/helpers';

import { BundleAction } from './bundle-actions/bundle-action.type';

export interface AcbsCreateBundleInformationRequestDto<BundleMessageListItem extends BundleAction = BundleAction> {
  PortfolioIdentifier: string;
  InitialBundleStatusCode: number;
  InitiatingUserName: string;
  UseAPIUserIndicator: boolean;
  ServicingUserAccountIdentifier?: string;
  PostingDate?: DateString;
  // In most cases BundleMessageList will have 1 item, but we support multiple for FacilityFeeAmountTransaction.
  BundleMessageList: BundleMessageListItem[];
}
