import { DateOnlyString } from '@ukef/helpers';

export interface Deal {
  dealIdentifier: string;
  portfolioIdentifier: string;
  currency: string;
  dealValue: number;
  guaranteeCommencementDate: DateOnlyString;
  obligorPartyIdentifier: string;
  obligorName: string;
  obligorIndustryClassification: string;
}
