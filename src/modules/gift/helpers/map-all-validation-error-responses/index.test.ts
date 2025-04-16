import { HttpStatus } from '@nestjs/common';
import { GIFT } from '@ukef/constants';
import { AxiosResponse } from 'axios';

import { mapValidationErrorResponses } from '../map-validation-error-responses';
import { mapAllValidationErrorResponses } from '.';

const { ENTITY_NAMES } = GIFT;

const mockValidationErrors = [
  {
    path: ['exitDate'],
    message: 'Expected string, received number',
  },
];

describe('modules/gift/helpers/map-all-validation-error-responses', () => {
  it('should return multiple mapValidationErrorResponses results', () => {
    const mockResponses = [
      { status: HttpStatus.CREATED },
      { status: HttpStatus.BAD_REQUEST, data: { validationErrors: mockValidationErrors } },
    ] as AxiosResponse[];

    const result = mapAllValidationErrorResponses({ counterparties: mockResponses, obligations: mockResponses, repaymentProfiles: mockResponses });

    const expected = [
      ...mapValidationErrorResponses({
        entityName: ENTITY_NAMES.COUNTERPARTY,
        responses: mockResponses,
      }),
      ...mapValidationErrorResponses({
        entityName: ENTITY_NAMES.OBLIGATION,
        responses: mockResponses,
      }),
      ...mapValidationErrorResponses({
        entityName: ENTITY_NAMES.REPAYMENT_PROFILE,
        responses: mockResponses,
      }),
    ];

    expect(result).toEqual(expected);
  });
});
