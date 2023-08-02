import { round as lodashRound } from 'lodash';
//import Decimal from 'decimal.js-light';

// Lodash
export const roundTo2DecimalPlaces = (numberToRound: number): number => lodashRound(numberToRound, 2);

// Current
//export const roundTo2DecimalPlaces = (numberToRound: number): number => Math.round(numberToRound * 100) / 100;

// Mathjs
//export const roundTo2DecimalPlaces = (numberToRound: number): number => mathJsRound(numberToRound, 2);

// Decimal light, main Decimal lib is also used by Mathjs.
//export const roundTo2DecimalPlaces = (numberToRound: number): number => new Decimal(numberToRound).toDecimalPlaces(2).toNumber();

// No library, NOT PASSING UNIT TEST
//export const roundTo2DecimalPlaces = (numberToRound: number): number => Math.round((numberToRound + Number.EPSILON) * 100) / 100;
