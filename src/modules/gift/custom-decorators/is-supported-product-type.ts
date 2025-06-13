import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';
import { PinoLogger } from 'nestjs-pino';

import { GiftHttpService } from '../gift.http.service';
import { GiftProductTypeService } from '../gift.product-type.service';
import { isValidProductTypeCodeFormat } from './../helpers';

interface ObjectWithProductTypeCode {
  productTypeCode: string;
}

interface ProductTypeValidationArguments extends ValidationArguments {
  object: ObjectWithProductTypeCode;
}

/**
 * Custom decorator to check if a provided product type code is a supported product type in GIFT.
 * @param {ValidationOptions} options: Class validator's validation options
 * @returns {Boolean | string}
 */
export function IsSupportedProductType(options?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'IsSupportedProductType',
      target: object.constructor,
      propertyName,
      options,
      validator: {
        async validate(productTypeCode) {
          /**
           * Only check if a product type code is supported, if a string with the correct length is provided.
           * Otherwise, we know that the provided value, is not in the correct format and will therefore not be supported.
           * By doing this we ensure that:
           * 1) We only call the GIFT API's product type endpoint, if we have a correctly formatted product type code.
           * 2) A consumer of this API receives only relevant validation errors, e.g "must be provided" OR "productTypeCode is not supported", not both.
           */
          if (isValidProductTypeCodeFormat(productTypeCode)) {
            const logger = new PinoLogger({});
            const httpService = new GiftHttpService(logger);
            const productTypeService = new GiftProductTypeService(httpService, logger);

            const isSupported = await productTypeService.isSupported(productTypeCode);

            return isSupported;
          }

          /**
           * An invalid product type code format has been provided - other validation errors from the controller will be surfaced.
           * Therefore, no need to call GIFT to check if the (incorrectly formatted) product type code is supported.
           */
          return true;
        },
        defaultMessage(args: ProductTypeValidationArguments) {
          const { productTypeCode } = args.object;

          return `productTypeCode is not supported (${productTypeCode})`;
        },
      },
    });
  };
}
