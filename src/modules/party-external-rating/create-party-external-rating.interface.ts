import { AssignedRatingCodeEnum } from '@ukef/constants/enums/assigned-rating-code';
import { DateOnlyString } from '@ukef/helpers';

export interface CreatePartyExternalRating {
  assignedRatingCode: AssignedRatingCodeEnum;
  ratedDate: DateOnlyString;
}
