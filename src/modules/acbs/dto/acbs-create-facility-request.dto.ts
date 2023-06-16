import { AcbsBaseFacilityRequest } from './acbs-base-facility-request.dto';

export interface AcbsCreateFacilityRequest extends AcbsBaseFacilityRequest {
  FacilityInitialStatus: { FacilityInitialStatusCode: string };
}
