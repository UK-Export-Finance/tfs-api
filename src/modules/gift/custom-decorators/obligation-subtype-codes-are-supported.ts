import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';
import { PinoLogger } from 'nestjs-pino';

import { GiftFacilityCreationRequestDto } from '../dto';
import { GiftHttpService } from '../gift.http.service';
import { GiftObligationSubtypeService } from '../gift.obligation-subtype.service';
import { hasValidObligationSubtypeCodeFormats, isValidProductTypeCodeFormat } from '../helpers';

interface ObligationSubtypeValidationArguments extends ValidationArguments {
  object: GiftFacilityCreationRequestDto;
}

/**
 * Custom decorator to check if all provided obligation subtype codes are supported for the product type in GIFT.
 * NOTE: This validation has to be placed at the top level of facility validation,
 * as apposed to being placed on individual obligations.
 * This is because, these checks require productTypeCode, which is at the top level.
 * Unfortunately, custom NestJS validation decorators are only able to obtain data from the level at which it's placed.
 * @param {ValidationOptions} options: Class validator's validation options
 * @returns {Boolean | string}
 */
export function ObligationSubtypeCodeAreSupported(options?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'IsSupportedObligationSubtypeCode',
      target: object.constructor,
      propertyName,
      options,
      validator: {
        async validate(obligations, args: ObligationSubtypeValidationArguments) {
          if (!args?.object?.overview) {
            /**
             * An invalid payload has been provided - other validation errors from the controller will be surfaced.
             * Therefore, no need to call GIFT to check if the (incorrectly formatted) subtype code is supported.
             */
            return true;
          }

          const { facilityId, productTypeCode } = args.object.overview;

          /**
           * Only check if a subtype codes are supported, if a product type code is provided and the subtype codes are strings with the correct length.
           * Otherwise, we know that the provided value, is not in the correct format. Or that the product type code has no subtypes.
           * In both cases - any provided subtype codes will not be supported.
           * By doing this we ensure that:
           * 1) We only call the GIFT API's obligation subtype endpoint, if we have a valid payload.
           * 2) A consumer of this API receives only relevant validation errors, e.g "must be provided" OR "subtypeCode is not supported", not both.
           */
          if (isValidProductTypeCodeFormat(productTypeCode) && hasValidObligationSubtypeCodeFormats(obligations)) {
            const logger = new PinoLogger({});
            const httpService = new GiftHttpService(logger);
            const obligationSubtypeService = new GiftObligationSubtypeService(httpService, logger);

            const allSubtypesAreSupported = await obligationSubtypeService.isSupported({
              facilityId,
              productTypeCode,
              obligations,
            });

            return allSubtypesAreSupported;
          }

          /**
           * An invalid subtype code format has been provided - other validation errors from the controller will be surfaced.
           * Therefore, no need to call GIFT to check if the (incorrectly formatted) subtype code is supported.
           */
          return true;
        },
        defaultMessage(args: ObligationSubtypeValidationArguments) {
          const productCode = args?.object?.overview?.productTypeCode;

          return `obligations contain a subtypeCode that is not supported for the provided productTypeCode (${productCode})`;
        },
      },
    });
  };
}
