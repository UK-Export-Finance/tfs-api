import { GiftObligationRequestDto } from '../../dto';

/**
 * Get all obligation subtype codes from the payload.
 * @param {GiftObligationRequestDto[]} obligations
 * @returns {String[]}
 * @example
 * const obligations = [
 *   { amount: 100, subtypeCode: 'A' },
 *   { amount: 100, subtypeCode: 'B' },
 *   { amount: 100, subtypeCode: 'C' },
 * ]
 *
 * getObligationSubtypeCodes(obligations)
 *
 * [ 'A', 'B', 'C' ]
 */
export const getObligationSubtypeCodes = (obligations: GiftObligationRequestDto[]): string[] =>
  obligations.map((obligation) => obligation.subtypeCode).filter((subtypeCode) => Boolean(subtypeCode?.trim()));
