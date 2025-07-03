import { GiftFacilityCreationValidationStrippedPayload } from '@ukef/types';

import { GiftFacilityCreationRequestDto } from '../../../dto';

/**
 * Get a single array from multiple entity field values
 * @param {object[]} entities
 * @param {String} fieldName: Name of the field to return
 * @returns {String[] | Number[]}
 * @example
 * ```ts
 * const entities = [ { a: true, currency: 'GBP' }, { B: true, currency: 'USD' } ];
 *
 * mapEntitiesByField(entities, 'currency')
 *
 * ['GBP', 'USD']
 * ```
 */
export const mapEntitiesByField = (entities: object[], fieldName: string) => entities.map((obj) => obj[`${fieldName}`]);

/**
 * Based on a field name, strip a GIFT facility creation payload into an object,
 * with child entities that contains only the fields we need to validate.
 * This allows the validation checks to simply assert if an array contains X.
 * in addition to being able to return an index for improve messaging.
 * @param {GiftFacilityCreationRequestDto} payload: The facility creation payload
 * @param {String} fieldName: Name of the field to return in in the stripped payload
 * @returns {GiftFacilityCreationValidationStrippedPayload}
 * @example
 * ```ts
 * stripPayload(payload, 'currency')
 *
 * {
 *   overview: 'GBP',
 *   fixedFees: ['GBP', 'USD', 'EUR']
 *   obligations: ['USD']
 * }
 * ```
 */
export const stripPayload = (payload: GiftFacilityCreationRequestDto, fieldName: string): GiftFacilityCreationValidationStrippedPayload => {
  const { overview, fixedFees, obligations } = payload;

  return {
    overview: overview[`${fieldName}`],
    // counterparties: mapEntitiesByField(counterparties, fieldName),
    fixedFees: mapEntitiesByField(fixedFees, fieldName),
    obligations: mapEntitiesByField(obligations, fieldName),
  };
};
