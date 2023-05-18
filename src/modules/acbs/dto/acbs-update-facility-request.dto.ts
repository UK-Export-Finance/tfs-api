import { AcbsBaseFacilityRequest } from './acbs-base-facility-request.dto';

export type AcbsUpdateFacilityRequestWithoutGetFacilityAdditionalFields = AcbsBaseFacilityRequest;

// Record<string, unknown> is used here to address the GET facilities response merge
export type AcbsUpdateFacilityRequest = AcbsUpdateFacilityRequestWithoutGetFacilityAdditionalFields & Record<string, unknown>;
