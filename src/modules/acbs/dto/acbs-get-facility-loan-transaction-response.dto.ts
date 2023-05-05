import { DateString } from '@ukef/helpers';
import { BundleAction } from '@ukef/helpers/bundle-action.type';

export type AcbsGetFacilityLoanTransactionResponseDto = AcbsGetFacilityLoanTransactionResponseItem[];

export interface AcbsGetFacilityLoanTransactionResponseItem {
  PortfolioIdentifier: string;
  BundleStatus: {
    BundleStatusCode: string;
    BundleStatusShortDescription: string;
  };
  PostingDate: DateString;
  BundleMessageList: BundleAction[];
}
