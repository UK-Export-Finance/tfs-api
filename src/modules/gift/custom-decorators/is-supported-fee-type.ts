import { VALIDATION } from '@ukef/constants/gift/validation.constant';
import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';
import { PinoLogger } from 'nestjs-pino';

import { arrayOfObjectsHasValue } from '../helpers';
import { GiftFeeTypeService, GiftHttpService } from '../services';

interface ObjectWithFeeTypeCode {
  feeTypeCode: string;
}

interface FeeTypeValidationArguments extends ValidationArguments {
  object: ObjectWithFeeTypeCode;
}

/**
 * Custom decorator to check if a provided fee type, is a supported fee type in GIFT.
 * @param {ValidationOptions} options: Class validator's validation options
 * @returns {Boolean | string}
 */
export function IsSupportedFeeType(options?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'IsSupportedFeeType',
      target: object.constructor,
      propertyName,
      options,
      validator: {
        async validate(feeTypeCode) {
          /**
           * Only check if a fee type is supported, if a string with the correct length is provided.
           * Otherwise, we know that the provided value, is not in the correct format and will therefore not be supported.
           * By doing this we ensure that:
           * 1) We only call the GIFT API's fee type endpoint, if we have a correctly formatted fee type.
           * 2) A consumer of this API receives only relevant validation errors, e.g "must be provided/X length" OR "feeTypeCode is not supported", not both.
           */
          const isValidFeeTypeFormat = typeof feeTypeCode === 'string' && feeTypeCode.length === VALIDATION.FEE_TYPE_CODE.MIN_LENGTH;

          if (isValidFeeTypeFormat) {
            const logger = new PinoLogger({});
            const httpService = new GiftHttpService(logger);
            const feeTypeService = new GiftFeeTypeService(httpService, logger);

            const supportedFeeTypes = await feeTypeService.getSupportedFeeTypes();

            const isSupportedFeeType = arrayOfObjectsHasValue(supportedFeeTypes.data?.feeTypes, 'code', feeTypeCode);

            return isSupportedFeeType;
          }

          /**
           * An invalid fee type format has been provided - other validation errors from the controller will be surfaced.
           * Therefore, no need to call GIFT to check if the (incorrectly formatted) fee type is supported.
           */
          return true;
        },
        defaultMessage(args: FeeTypeValidationArguments) {
          const { feeTypeCode } = args.object;

          return `feeTypeCode is not supported (${feeTypeCode})`;
        },
      },
    });
  };
}
