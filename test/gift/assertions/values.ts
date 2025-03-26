export const BOOLEAN_VALUES = [true, false];

export const EMPTY_VALUES = [null, [], undefined];

export const EMPTY_STRING_VALUES = ['', '""'];

export const INVALID_NUMBER_VALUES = [...EMPTY_VALUES, ...BOOLEAN_VALUES, ...EMPTY_STRING_VALUES, -1];

export const INVALID_STRING_VALUES = [...EMPTY_VALUES, ...BOOLEAN_VALUES, 0, 1];

export const INVALID_NUMBER_STRING_VALUES = [...INVALID_STRING_VALUES, ...EMPTY_STRING_VALUES, 0, 1];

export const INVALID_BOOLEAN_VALUES = [...EMPTY_VALUES, ...EMPTY_STRING_VALUES, 0, 1];
