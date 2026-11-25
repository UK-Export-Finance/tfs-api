type AccrualSchedule = {
  accrualScheduleId: number;
};

type Obligation = {
  accrualSchedules?: AccrualSchedule[];
};

/**
 * Helper function to extract accrual schedule IDs from obligations.
 * @param {Obligation[]} obligations: An array of obligations containing accrual schedules.
 * @returns {number[]} An array of accrual schedule IDs.
 */
export const getAccrualScheduleIds = (obligations: Obligation[]) =>
  obligations.flatMap((obligation) => obligation.accrualSchedules ?? []).map((accrualSchedule) => accrualSchedule.accrualScheduleId);
