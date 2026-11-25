/**
 * Defining multiple String Literal Types, this does not support constants.
 * The start of the ID differs depending on the environment.
 */
type DealFacilityPartyUkefIdStart = '0020' | '0030' | '0040';
type CovenantUkefIdStart = '0000';

// Value example 0030000321
export type UkefId = `${DealFacilityPartyUkefIdStart}${number}`;

// Value example 0000011006
export type UkefCovenantId = `${CovenantUkefIdStart}${number}`;
