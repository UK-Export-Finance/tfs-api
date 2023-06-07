import { DateString } from '@ukef/helpers';

import { BundleAction } from './bundle-actions/bundle-action.type';

export interface AcbsGetBundleInformationResponseDto<BundleMessageListItem extends BundleAction = BundleAction> {
  PortfolioIdentifier: string;
  InitialBundleStatusCode: number;
  BundleStatus: {
    BundleStatusCode: string;
    BundleStatusShortDescription: string;
  };
  InitiatingUserName: string;
  PostingDate: DateString;
  BundleMessageList: BundleMessageListItem[];
}
