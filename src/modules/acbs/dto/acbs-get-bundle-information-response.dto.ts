import { DateString } from '@ukef/helpers';

import { BundleAction } from './bundle-actions/bundle-action.type';

export interface AcbsGetBundleInformationResponseDto<BundleMessageListItem extends BundleAction = BundleAction> {
  PortfolioIdentifier: string;
  // TODO APIM-125: Replace InitialBundleStatusCode with RequestedBundleStatus, as InitialBundleStatusCode is deprecated as of 01 dec 2024.
  InitialBundleStatusCode: number;
  BundleStatus: {
    BundleStatusCode: string;
    BundleStatusShortDescription: string;
  };
  InitiatingUserName: string;
  PostingDate: DateString;
  // ACBS supports creating bundle information with multiple bundle message list items, but we do not support (or use) this functionality.
  BundleMessageList: [BundleMessageListItem];
}
