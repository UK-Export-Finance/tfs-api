import { DateOnlyString } from '@ukef/helpers';

export interface DealToCreate {
  dealIdentifier: string;
  currency: string;
  dealValue: number;
  guaranteeCommencementDate: DateOnlyString;
  obligorPartyIdentifier: string;
  obligorName: string;
  obligorIndustryClassification: string;
}
