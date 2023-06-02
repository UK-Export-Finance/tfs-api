import { ValidatedFacilityIdentifierApiProperty } from '@ukef/decorators/validated-facility-identifier-api-property';
import { UkefId } from '@ukef/helpers';

export class FacilityActivationTransactionParamsDto {
  @ValidatedFacilityIdentifierApiProperty({
    description: 'The identifier of the facility in ACBS.',
  })
  facilityIdentifier: UkefId;
}
