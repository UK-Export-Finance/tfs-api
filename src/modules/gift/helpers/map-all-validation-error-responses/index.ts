import { GIFT } from '@ukef/constants';
import { ValidationErrorResponse } from '@ukef/types';
import { AxiosResponse } from 'axios';

import { mapValidationErrorResponses } from '../map-validation-error-responses';

const { ENTITY_NAMES } = GIFT;

interface MapAllValidationErrorResponsesParams {
  counterparties: AxiosResponse[];
  repaymentProfiles: AxiosResponse[];
}

/**
 * Map multiple responses with an invalid status.
 * @param {MapAllValidationErrorResponsesParams}
 * @returns {ValidationErrorResponse[]} Mapped validation error responses.
 */
export const mapAllValidationErrorResponses = ({ counterparties, repaymentProfiles }: MapAllValidationErrorResponsesParams): ValidationErrorResponse[] => [
  ...mapValidationErrorResponses({
    entityName: ENTITY_NAMES.COUNTERPARTY,
    responses: counterparties,
  }),
  ...mapValidationErrorResponses({
    entityName: ENTITY_NAMES.REPAYMENT_PROFILE,
    responses: repaymentProfiles,
  }),
];
