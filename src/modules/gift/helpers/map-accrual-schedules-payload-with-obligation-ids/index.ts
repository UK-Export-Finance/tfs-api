import { GiftAccrualScheduleRequestDto } from '../../dto';

/**
 * Maps accrual schedules payload with corresponding obligation IDs.
 * @param {GiftAccrualScheduleRequestDto[]} accrualSchedules - Array of accrual schedules.
 * @param {number[]} obligationIds - Array of obligation IDs.
 * @returns {GiftAccrualScheduleRequestDto[]} Array of accrual schedules with obligation IDs.
 */
export const mapAccrualSchedulesPayload = (accrualSchedules: GiftAccrualScheduleRequestDto[], obligationIds: number[]) =>
  accrualSchedules.map((schedule, index) => ({
    ...schedule,
    obligationId: obligationIds[`${index}`],
  }));
