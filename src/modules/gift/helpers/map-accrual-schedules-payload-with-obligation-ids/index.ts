import { GiftAccrualScheduleRequestDto } from '@ukef/modules/gift/dto';

/**
 * Maps accrual schedules payload with corresponding obligation IDs.
 * When there is only a single obligation, all accrual schedules are mapped to it,
 * otherwise, accrual schedules are mapped to obligations by matching array index.
 * @param {GiftAccrualScheduleRequestDto[]} accrualSchedules - Array of accrual schedules.
 * @param {number[]} obligationIds - Array of obligation IDs.
 * @returns {GiftAccrualScheduleRequestDto[]} Array of accrual schedules with obligation IDs.
 */
export const mapAccrualSchedulesPayload = (accrualSchedules: GiftAccrualScheduleRequestDto[], obligationIds: number[]) =>
  accrualSchedules.map((schedule, index) => ({
    ...schedule,
    obligationId: obligationIds.length === 1 ? obligationIds[0] : obligationIds[`${index}`],
  }));
