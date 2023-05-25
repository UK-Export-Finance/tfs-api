import { DateOnlyString } from '@ukef/helpers';

export class UpdateFacilityGuaranteesRequestDto {
  readonly expirationDate?: DateOnlyString;
  readonly guaranteedLimit?: number;
}
