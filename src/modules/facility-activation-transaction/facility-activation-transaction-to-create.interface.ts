import { UkefId } from '@ukef/helpers';

export interface FacilityActivationTransactionToCreate {
  facilityIdentifier: UkefId;
  lenderTypeCode: string;
  initialBundleStatusCode: number;
}
