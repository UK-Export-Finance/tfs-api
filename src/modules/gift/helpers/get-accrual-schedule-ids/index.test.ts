import { getAccrualScheduleIds } from '.';

describe('modules/gift/helpers/get-accrual-schedule-ids', () => {
  const mockObligations = [
    {
      accrualSchedules: [{ accrualScheduleId: 1 }, { accrualScheduleId: 2 }],
    },
    {
      accrualSchedules: [{ accrualScheduleId: 3 }],
    },
  ];

  it('should return an array of accrual schedule IDs', () => {
    // Act
    const result = getAccrualScheduleIds(mockObligations);

    // Assert
    const expected = [1, 2, 3];

    expect(result).toStrictEqual(expected);
  });

  describe('when obligations is an empty array', () => {
    it('should return an empty array', () => {
      // Act
      const result = getAccrualScheduleIds([]);

      // Assert
      expect(result).toStrictEqual([]);
    });
  });

  describe('when obligations do not include accrual schedules', () => {
    it('should return an empty array', () => {
      // Act
      const result = getAccrualScheduleIds([{ accrualSchedules: [] }, {}]);

      // Assert
      expect(result).toStrictEqual([]);
    });
  });

  describe('when obligations include fixed rate accrual schedules only', () => {
    it('should return an array of accrual schedule IDs', () => {
      // Act
      const result = getAccrualScheduleIds([{ accrualSchedules: [{ accrualScheduleId: 4 }] }]);

      // Assert
      expect(result).toStrictEqual([4]);
    });
  });
});
