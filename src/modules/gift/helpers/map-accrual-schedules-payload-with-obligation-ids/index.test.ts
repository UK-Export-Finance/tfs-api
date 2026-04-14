import { EXAMPLES } from '@ukef/constants';

import { mapAccrualSchedulesPayload } from '.';

describe('modules/gift/helpers/map-accrual-schedules-payload-with-obligation-ids', () => {
  const mockAccrualSchedules = [EXAMPLES.GIFT.ACCRUAL_SCHEDULE, EXAMPLES.GIFT.ACCRUAL_SCHEDULE, EXAMPLES.GIFT.ACCRUAL_SCHEDULE];

  const mockObligationIds = [1, 2, 3];

  it('should return mapped accrual schedules with obligation IDs', () => {
    // Act
    const result = mapAccrualSchedulesPayload(mockAccrualSchedules, mockObligationIds);

    // Assert
    const expected = [
      { ...mockAccrualSchedules[0], obligationId: mockObligationIds[0] },
      { ...mockAccrualSchedules[1], obligationId: mockObligationIds[1] },
      { ...mockAccrualSchedules[2], obligationId: mockObligationIds[2] },
    ];

    expect(result).toStrictEqual(expected);
  });
});
