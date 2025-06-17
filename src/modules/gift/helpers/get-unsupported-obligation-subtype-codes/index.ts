import { GiftObligationDto, GiftObligationSubtypeDto } from '../../dto';

interface GetUnsupportedObligationSubtypesParams {
  obligations: GiftObligationDto[];
  supportedSubtypes: GiftObligationSubtypeDto[];
}

/**
 * Given an array of obligations and supported sub types,
 * Return an array of any obligation subtype codes that are NOT supported.
 * @param {GetUnsupportedObligationSubtypesParams} obligations, supportedSubtypes
 * @returns {string[]} Array of subtype codes that are not supported
 */
export const getUnsupportedObligationSubtypeCodes = ({ obligations, supportedSubtypes }: GetUnsupportedObligationSubtypesParams) => {
  const supportedCodes = supportedSubtypes.map((subtype: GiftObligationSubtypeDto) => subtype.code);

  const unsupportedSubtypeCodes = [];

  obligations.forEach(({ subtypeCode }: GiftObligationDto) => {
    if (!supportedCodes.includes(subtypeCode)) {
      unsupportedSubtypeCodes.push(subtypeCode);
    }
  });

  return unsupportedSubtypeCodes;
};
