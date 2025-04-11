import { GIFT } from '@ukef/constants';
import { AxiosResponse } from 'axios';

import { mapValidationErrorResponses } from '../map-validation-error-responses';

const { ENTITY_NAMES } = GIFT;

interface TheParams {
  counterparties: AxiosResponse[];
  repaymentProfiles: AxiosResponse[];
}

// TODO: DRY
interface GiftValidationError {
  path: string[];
  message: string;
}

// TODO: DRY
interface ValidationErrorResponse {
  entityName: string;
  index: number;
  message: string;
  status: number;
  type: string;
  validationErrors: GiftValidationError[];
}

// /**
//  * Map responses with an invalid status.
//  * An index is also returned to help consumers debug which item in an array has errors.
//  * @param {MapValidationErrorResponsesParams}
//  * @returns {ExtendedAxiosResponse[]} Mapped responses that do not have a CREATED status.
//  */
export const mapAllValidationErrorResponses = ({ counterparties, repaymentProfiles }: TheParams): ValidationErrorResponse[] => [
  ...mapValidationErrorResponses({
    entityName: ENTITY_NAMES.COUNTERPARTY,
    responses: counterparties,
  }),
  ...mapValidationErrorResponses({
    entityName: ENTITY_NAMES.REPAYMENT_PROFILE,
    responses: repaymentProfiles,
  }),
];
