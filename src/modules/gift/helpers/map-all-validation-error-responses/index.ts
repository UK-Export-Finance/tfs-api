import { GIFT } from '@ukef/constants';
import { ValidationErrorResponse } from '@ukef/types';
import { AxiosResponse } from 'axios';

import { mapValidationErrorResponses } from '../map-validation-error-responses';

const { ENTITY_NAMES } = GIFT;

interface MapAllValidationErrorResponsesParams {
  businessCalendars: AxiosResponse[];
  counterparties: AxiosResponse[];
  fixedFees: AxiosResponse[];
  obligations: AxiosResponse[];
  repaymentProfiles: AxiosResponse[];
}

/**
 * Map multiple responses with an invalid status.
 * @param {MapAllValidationErrorResponsesParams}
 * @returns {ValidationErrorResponse[]} Mapped validation error responses.
 */
export const mapAllValidationErrorResponses = ({
  businessCalendars,
  counterparties,
  fixedFees,
  obligations,
  repaymentProfiles,
}: MapAllValidationErrorResponsesParams): ValidationErrorResponse[] => [
  ...mapValidationErrorResponses({
    entityName: ENTITY_NAMES.BUSINESS_CALENDAR,
    responses: businessCalendars,
  }),
  ...mapValidationErrorResponses({
    entityName: ENTITY_NAMES.COUNTERPARTY,
    responses: counterparties,
  }),
  ...mapValidationErrorResponses({
    entityName: ENTITY_NAMES.FIXED_FEE,
    responses: fixedFees,
  }),
  ...mapValidationErrorResponses({
    entityName: ENTITY_NAMES.OBLIGATION,
    responses: obligations,
  }),
  ...mapValidationErrorResponses({
    entityName: ENTITY_NAMES.REPAYMENT_PROFILE,
    responses: repaymentProfiles,
  }),
];
