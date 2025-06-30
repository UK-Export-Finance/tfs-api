import { GiftObligationRequestDto, GiftObligationSubtypeResponseDto } from '../../dto';

interface GetUnsupportedObligationSubtypesParams {
  obligations: GiftObligationRequestDto[];
  supportedSubtypes: GiftObligationSubtypeResponseDto[];
}

/**
 * Given an array of obligations and supported sub types,
 * Return an array of any obligation subtype codes that are NOT supported.
 * @param {GetUnsupportedObligationSubtypesParams} obligations, supportedSubtypes
 * @returns {string[]} Array of subtype codes that are not supported
 */
export const getUnsupportedObligationSubtypeCodes = ({ obligations, supportedSubtypes }: GetUnsupportedObligationSubtypesParams) => {
  const supportedCodes = supportedSubtypes.map((subtype: GiftObligationSubtypeResponseDto) => subtype.code);

  const unsupportedSubtypeCodes = [];

  obligations.forEach(({ subtypeCode }: GiftObligationRequestDto) => {
    if (!supportedCodes.includes(subtypeCode)) {
      unsupportedSubtypeCodes.push(subtypeCode);
    }
  });

  return unsupportedSubtypeCodes;
};
