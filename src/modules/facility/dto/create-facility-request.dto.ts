import { BaseFacilityRequestItemWithFacilityIdentifier } from './base-facility-request.dto';

export type CreateFacilityRequest = CreateFacilityRequestItem[];

export class CreateFacilityRequestItem extends BaseFacilityRequestItemWithFacilityIdentifier {}
