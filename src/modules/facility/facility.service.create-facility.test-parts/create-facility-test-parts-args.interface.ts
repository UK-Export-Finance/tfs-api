import { AcbsCreateFacilityRequest } from '@ukef/modules/acbs/dto/acbs-create-facility-request.dto';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';

import { CreateFacilityRequestItem } from '../dto/create-facility-request.dto';

export interface CreateFacilityTestPartsArgs {
  valueGenerator: RandomValueGenerator;
  dateStringTransformations: DateStringTransformations;
  facilityToCreate: CreateFacilityRequestItem;
  createFacility: (newFacility: CreateFacilityRequestItem) => Promise<void>;
  getFacilityCreatedInAcbs: () => AcbsCreateFacilityRequest;
}
