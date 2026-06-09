import { ObligationSubtypeMdmResponseDto } from '@ukef/modules/mdm/dto/obligation-subtype-mdm-response';

interface GenerateObligationSubtypeCodeErrorsParams {
  subtypes: ObligationSubtypeMdmResponseDto[];
  productTypeCode: string;
  providedSubtypeCodes: string[];
}

/**
 * Check all provided obligation subtype codes are supported by the product type.
 * If a provided obligation subtype is NOT included in the subtypes (for a specific product type),
 * an error message should be returned.
 * @param {GenerateObligationSubtypeCodeErrorsParams} subtypes, productTypeCode, providedSubtypeCodes
 * @returns {String[]}
 * @example
 * ```ts
 * const subtypes = [ { code: 'A', productTypeCode: '1A' } ];
 * const productTypeCode = '1A';
 * const providedSubtypeCodes = [ 'B' ];
 *
 * generateObligationSubtypeCodeErrors({ subtypes, productTypeCode, providedSubtypeCodes })
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
  providedSubtypeCodes,
}: GenerateObligationSubtypeCodeErrorsParams): string[] => {
  const validationErrors = [];

  providedSubtypeCodes.forEach((providedSubtypeCode: string, index: number) => {
    const matchedSubtypeCode = subtypes.find((subtype: ObligationSubtypeMdmResponseDto) => subtype.code === providedSubtypeCode);

    if (!matchedSubtypeCode) {
      validationErrors.push(`obligations.${index}.subtypeCode is not supported by product type ${productTypeCode}`);
    }
  });

  return validationErrors;
};
