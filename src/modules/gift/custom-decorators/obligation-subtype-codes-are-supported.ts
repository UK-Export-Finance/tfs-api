import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';
import { PinoLogger } from 'nestjs-pino';

import { GiftFacilityCreationDto } from '../dto';
import { GiftHttpService } from '../gift.http.service';
import { GiftObligationSubtypeService } from '../gift.obligation-subtype.service';
import { hasValidObligationSubtypeCodeFormats } from '../helpers';

interface ObligationSubtypeValidationArguments extends ValidationArguments {
  object: GiftFacilityCreationDto;
}

/**
 * Custom decorator to check if all provided obligation subtype codes are supported for the product type in GIFT.
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
          const { facilityId, productTypeCode } = args.object.overview;

          /**
           * Only check if the subtype codes are supported, if they are strings with the correct length.
           * Otherwise, we know that the provided value, is not in the correct format and will therefore not be supported.
           * By doing this we ensure that:
           * 1) We only call the GIFT API's obligation subtype endpoint, if we have a correctly formatted subtype code.
           * 2) A consumer of this API receives only relevant validation errors, e.g "must be provided" OR "subtypeCode is not supported", not both.
           */
          if (hasValidObligationSubtypeCodeFormats(obligations)) {
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
        defaultMessage() {
          return 'obligations contain a subtypeCode that is not supported';
        },
      },
    });
  };
}
