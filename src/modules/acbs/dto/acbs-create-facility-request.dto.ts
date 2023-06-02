import { AcbsBaseFacilityRequest } from './acbs-base-facility-request.dto';

export interface AcbsCreateFacilityRequest extends AcbsBaseFacilityRequest {
  Description: string;
  FacilityInitialStatus: { FacilityInitialStatusCode: string };
}
