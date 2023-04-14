import { ValidatedStringApiProperty } from '@ukef/decorators/validated-string-api-property.decorator';

export class GetFacilityByIdentifierParamsDto {
  @ValidatedStringApiProperty({ description: 'The UKEF identifier for the facility.', length: 10, pattern: /^\d{10}$/ })
  facilityIdentifier: string;
}
