import { DateString } from '@ukef/helpers/date-string.type';

export interface Party {
  alternateIdentifier: string;
  industryClassification: string;
  name1: string;
  name2: string;
  name3: string;
  smeType: string;
  citizenshipClass: string;
  officerRiskDate: DateString;
  countryCode: string;
}
