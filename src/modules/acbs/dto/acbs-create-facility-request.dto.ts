import { AcbsBaseFacilityRequest } from './acbs-base-facility-request.dto';

export type AcbsCreateFacilityRequest = AcbsBaseFacilityRequest & {
  FacilityInitialStatus: { FacilityInitialStatusCode: string };
};
