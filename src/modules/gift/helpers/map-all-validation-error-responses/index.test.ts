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
    // Arrange
    const mockResponses = [
      { status: HttpStatus.CREATED },
      { status: HttpStatus.BAD_REQUEST, data: { validationErrors: mockValidationErrors } },
    ] as AxiosResponse[];

    // Act
    const result = mapAllValidationErrorResponses({
      businessCalendars: mockResponses,
      counterparties: mockResponses,
      fixedFees: mockResponses,
      obligations: mockResponses,
      repaymentProfiles: mockResponses,
    });

    // Assert
    const expected = [
      ...mapValidationErrorResponses({
        entityName: ENTITY_NAMES.BUSINESS_CALENDAR,
        responses: mockResponses,
      }),
      ...mapValidationErrorResponses({
        entityName: ENTITY_NAMES.COUNTERPARTY,
        responses: mockResponses,
      }),
      ...mapValidationErrorResponses({
        entityName: ENTITY_NAMES.FIXED_FEE,
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
