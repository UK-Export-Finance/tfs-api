import { GiftObligationRequestDto, GiftObligationSubtypeResponseDto } from '../../dto';

interface GenerateObligationSubtypeCodeErrorsParams {
  subtypes: GiftObligationSubtypeResponseDto[];
  productTypeCode: string;
  providedObligations: GiftObligationRequestDto[];
}

/**
 * Check all provided obligation subtype codes are supported by the product type.
 * If a provided obligation subtype is NOT included in the subtypes (for a specific product type),
 * an error message should be returned.
 * @param {GenerateObligationSubtypeCodeErrorsParams} productTypeCode, providedObligations, providedCounterparties
 * @returns {String[]}
 * @example
 * ```ts
 * const subtypes = [ { code: 'A', productTypeCode: '1A' } ];
 * const productTypeCode = '1A';
 * const providedObligations = [ { subtypeCode: 'B', currency: 'GBP' }];
 *
 * generateObligationSubtypeCodeErrors({ subtypes, productTypeCode, providedObligations })
 *
 * [
 *   'obligations.0.subtypeCode is not supported by product type 1A'
 *   'obligations.1.subtypeCode is not supported by product type 1A'
 * ]
 * ```
 */
export const generateObligationSubtypeCodeErrors = ({
  subtypes,
  productTypeCode,
  providedObligations,
}: GenerateObligationSubtypeCodeErrorsParams): string[] => {
  const validationErrors = [];

  providedObligations.forEach((obligation: GiftObligationRequestDto, index: number) => {
    const { subtypeCode: providedSubtypeCode } = obligation;

    const giftSubtypeCode = subtypes.find((subtype: GiftObligationSubtypeResponseDto) => subtype.code === providedSubtypeCode);

    if (!giftSubtypeCode) {
      validationErrors.push(`obligations.${index}.subtypeCode is not supported by product type ${productTypeCode}`);
    }
  });

  return validationErrors;
};
