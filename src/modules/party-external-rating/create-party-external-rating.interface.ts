import { AssignedRatingCodeEnum } from '@ukef/constants/enums/assigned-rating-code';
import { DateOnlyString } from '@ukef/helpers';

export type CreatePartyExternalRating = {
  assignedRatingCode: AssignedRatingCodeEnum;
  ratedDate: DateOnlyString;
};
